# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Mix.Tasks.RepairProjections do
  @moduledoc """
  Rebuild any projection that was reset or is behind its event store subscription.

  By `reset` we mean that the row for the respective projector in the `projection_versions` table is deleted.
  """
  use Mix.Task

  require Logger

  import Trento.Tasks.Helper

  @shortdoc "Rebuild projections marked for reset"
  def run(_args) do
    # Ensure we don't start serving during replay of the
    # events. Concerning mostly during production release task.
    disable_endpoint_server()

    with :ok <- start_dependency_processes() do
      case check_and_rebuild_projectors() do
        :no_rebuild_needed ->
          Logger.info(IO.ANSI.format([:green, "No projections need rebuilding."]))

        :ok ->
          Logger.info(IO.ANSI.format([:green, "Projections catch-up complete."]))

        {:error, :timeout} ->
          Logger.error(IO.ANSI.format([:red, "Timed out waiting for projections to catch up."]))
          System.stop(2)
      end
    else
      {:error, error} ->
        print_error("Could not start dependencies: #{inspect(error)}")
        System.stop(1)
    end
  end

  defp disable_endpoint_server do
    endpoint_config =
      :trento
      |> Application.get_env(TrentoWeb.Endpoint, [])
      |> Keyword.put(:server, false)

    Application.put_env(:trento, TrentoWeb.Endpoint, endpoint_config)
    :ok
  end

  defp start_dependency_processes() do
    with {:ok, _} <- Application.ensure_all_started(:eventstore),
         {:ok, _} <- Application.ensure_all_started(:commanded),
         {:ok, _} <- start_repo(),
         {:ok, _} <- Trento.Commanded.start_link(),
         {:ok, _} <- Phoenix.PubSub.Supervisor.start_link(name: Trento.PubSub),
         {:ok, _} <- TrentoWeb.Endpoint.start_link() do
      :ok
    end
  end

  defp check_and_rebuild_projectors do
    # Projectors to rebuild are marked with the special value `0`.
    projectors_to_rebuild =
      "SELECT projection_name FROM projection_versions WHERE last_seen_event_number = 0;"
      |> Trento.Repo.query!()
      |> Map.fetch!(:rows)
      |> List.flatten()

    if Enum.empty?(projectors_to_rebuild) do
      :no_rebuild_needed
    else
      Logger.info("Rebuilding projectors: #{Enum.join(projectors_to_rebuild, ", ")}...")

      replay_archived_streams(projectors_to_rebuild)
      rebuild_active_projectors(projectors_to_rebuild)
    end
  end

  # Manually read the archived streams and replay their events into
  # the projection. Because of RollUp, membership of these events in
  # the `$all` stream is deleted. Thus, the standard subscription
  # mechanism for projections doesn't find them. All archived streams
  # are traversed for every projector since this is how normal
  # projectors are working. Resetting of the projector checkpoint is
  # needed since single-streams have local versioning that starts from
  # 1 every time.
  defp replay_archived_streams(projector_names) do
    projector_modules_map = get_projector_modules()
    archived_streams = fetch_archived_stream_uuids()

    Enum.each(projector_names, fn projector_name ->
      projector_module = Map.fetch!(projector_modules_map, projector_name)
      replay_archived_streams_for_projector(projector_name, projector_module, archived_streams)
      reset_projector_checkpoint(projector_name)
    end)
  end

  # Get projector name to module map from its supervisor but without
  # starting it.
  defp get_projector_modules do
    {:ok, {_, children}} = Trento.ProjectorsSupervisor.init([])

    Map.new(children, fn %{start: {module, :start_link, [opts]}} ->
      {Keyword.fetch!(opts, :name), module}
    end)
  end

  # Get all archived streams. They are sorted by their archive name.
  # CAVEAT: Since RollUp is deleting membership (link) of the events
  # from these streams in the `$all` stream, their relative positions
  # according to events from other aggregates are permanently
  # lost. So, for this to work reliably we expect projections to
  # receive events from their aggregate only, which seems to be the
  # case in Trento, except for the host projector.
  defp fetch_archived_stream_uuids do
    {:ok, pid} = Postgrex.start_link(Trento.EventStore.config())

    {:ok, %{rows: rows}} =
      Postgrex.query(
        pid,
        """
        SELECT stream_uuid
        FROM streams
        WHERE stream_uuid LIKE '%-archived-%'
        ORDER BY split_part(stream_uuid, '-archived-', 2) ASC;
        """
      )

    GenServer.stop(pid)

    List.flatten(rows)
  end

  defp replay_archived_streams_for_projector(projector_name, projector_module, archived_streams) do
    if Enum.empty?(archived_streams) do
      Logger.info("No archived streams found for #{projector_name}.")
    else
      Logger.info(
        "Replaying #{length(archived_streams)} archived stream(s) for #{projector_name}..."
      )

      Enum.each(archived_streams, fn stream_uuid ->
        Trento.Commanded
        |> Commanded.EventStore.stream_forward(stream_uuid)
        |> Commanded.Event.Upcast.upcast_event_stream(
          additional_metadata: %{application: Trento.Commanded}
        )
        |> Enum.each(fn event ->
          metadata =
            Commanded.EventStore.RecordedEvent.enrich_metadata(event,
              additional_metadata: %{
                application: Trento.Commanded,
                handler_name: projector_name
              }
            )

          projector_module.handle(event.data, metadata)
        end)
      end)

      Logger.info(
        IO.ANSI.format([:green, "Archived streams replay complete for #{projector_name}."])
      )
    end
  end

  defp reset_projector_checkpoint(projector_name) do
    Trento.Repo.query!(
      """
      UPDATE projection_versions
      SET last_seen_event_number = 0, updated_at = NOW()
      WHERE projection_name = $1
      """,
      [projector_name]
    )
  end

  defp rebuild_active_projectors(projector_names) do
    # All *active* (without rollup or after rollup) projectors
    # subscribe to the global stream "$all". Get the latest event in
    # the global stream.
    {:ok, %{stream_version: stream_version}} = Trento.EventStore.stream_info("$all")

    # Reset the projectors' subscriptions so they can replay all events.
    Enum.each(projector_names, fn projector_name ->
      Logger.info("Resetting EventStore subscription for #{projector_name}...")
      Trento.EventStore.delete_all_streams_subscription(projector_name)
    end)

    # Start ProjectorsSupervisor and wait until specified projectors
    # caught up on the stream.
    {:ok, supervisor_pid} = Trento.ProjectorsSupervisor.start_link([])

    result = wait_for_projectors(projector_names, stream_version, 60_000)

    Supervisor.stop(supervisor_pid)

    result
  end

  defp wait_for_projectors(projector_names, target_stream_version, timeout_ms) do
    deadline = System.monotonic_time(:millisecond) + timeout_ms
    do_poll_catchup(projector_names, target_stream_version, deadline)
  end

  defp do_poll_catchup(projector_names, target_stream_version, deadline) do
    if System.monotonic_time(:millisecond) > deadline do
      {:error, :timeout}
    else
      all_caught_up? =
        Enum.all?(projector_names, fn projector_name ->
          last_seen = get_subscription_last_seen!(projector_name)
          is_integer(last_seen) and last_seen >= target_stream_version
        end)

      if all_caught_up? do
        :ok
      else
        Process.sleep(100)
        do_poll_catchup(projector_names, target_stream_version, deadline)
      end
    end
  end

  defp get_subscription_last_seen!(projector_name) do
    registry = Module.concat(Trento.EventStore, EventStore.Subscriptions.Registry)

    case Registry.whereis_name({registry, {"$all", projector_name}}) do
      :undefined ->
        :starting

      pid when is_pid(pid) ->
        EventStore.Subscriptions.Subscription.last_seen(pid)
    end
  end
end
