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

  @archive_replay_timeout 120_000 # 2mins
  @active_catchup_timeout 120_000 # 2mins

  @shortdoc "Rebuild projections marked for reset"
  def run(_args) do
    # Ensure we don't start serving during replay of the
    # events. Concerning mostly during production release task.
    disable_endpoint_server()

    case start_dependency_processes() do
      :ok ->
        case check_and_rebuild_projectors() do
          :no_rebuild_needed ->
            Logger.info(IO.ANSI.format([:green, "No projections need rebuilding."]))

          :ok ->
            Logger.info(IO.ANSI.format([:green, "Projections rebuild complete."]))

          {:error, {:timeout, :archive_replay, projector_name}} ->
            Logger.error(IO.ANSI.format([:red, "Timed out replaying archived streams for #{projector_name}."]))
            System.stop(2)

          {:error, {:timeout, :active_catchup}} ->
            Logger.error(IO.ANSI.format([:red, "Timed out waiting for active projections to catch up."]))
            System.stop(2)

          {:error, error} ->
            Logger.error("Failed to rebuild projections: #{inspect(error)}")
            System.stop(3)

        end

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

  defp start_dependency_processes do
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

      with :ok <- replay_archived_streams(projectors_to_rebuild),
           :ok <- rebuild_active_projectors(projectors_to_rebuild) do
        :ok
      end
    end
  end

  # Manually read the archived streams and replay their events into
  # the projection, sorted by their created_at timestamp.  Because of
  # RollUp, membership of these events in the `$all` stream is
  # deleted. Replaying them in global created_at order reconstructs
  # their original chronological order across all aggregates.
  # Resetting of the projector checkpoint is needed afterwards so that
  # active projectors can catch up on the `$all` stream since
  # artificial event numbers were used during replay of archived
  # streams.
  defp replay_archived_streams(projector_names) do
    projector_modules_map = get_projector_modules()
    {:ok, pid} = Postgrex.start_link(Trento.EventStore.config())

    try do
      Enum.reduce_while(projector_names, :ok, fn projector_name, :ok ->
        projector_module = Map.fetch!(projector_modules_map, projector_name)

        case replay_archived_streams_for_projector(pid, projector_name, projector_module) do
          :ok ->
            reset_projector_checkpoint(projector_name)
            {:cont, :ok}

          {:error, reason} ->
            {:halt, {:error, reason}}
        end
      end)
    after
      GenServer.stop(pid)
    end
  end

  # Get projector name to module map from its supervisor but without
  # starting it.
  defp get_projector_modules do
    {:ok, {_, children}} = Trento.ProjectorsSupervisor.init([])

    Map.new(children, fn %{start: {module, :start_link, [opts]}} ->
      {Keyword.fetch!(opts, :name), module}
    end)
  end

  # We re-create what Commanded stream_forward() function is doing but
  # combining events from all archived streams. Since the logical
  # global ordering of these events is lost from the RollUp process we
  # use `created_at` field of the events themselves to maximally
  # approximate that order. Additionally, we make use of optimizations
  # such as using Postgrex.stream() instead of the manual chunking
  # used by the EventStore implementation.
  defp replay_archived_streams_for_projector(pid, projector_name, projector_module) do
    Logger.info("Replaying archived stream events for #{projector_name}...")

    transaction_result =
      Postgrex.transaction(
        pid,
        fn conn ->
          conn
          |> stream_archived_forward()
          |> Enum.reduce(0, fn event, count ->
            # This function re-creates what the handler is doing internally.
            metadata =
              Commanded.EventStore.RecordedEvent.enrich_metadata(event,
                additional_metadata: %{
                  application: Trento.Commanded,
                  handler_name: projector_name
                }
              )

            projector_module.handle(event.data, metadata)
            # NOTE: Processing an event doesn't actually mean
            # replaying that event since the handler receives events
            # from all archived streams and would drop the ones it's
            # not interested in. There is no trivial way to catch when
            # the projector handler actually replayed the event.
            count + 1
          end)
        end,
        timeout: @archive_replay_timeout
      )

    case transaction_result do
      {:ok, count} ->
        Logger.info(
          "Archived streams replay complete for #{projector_name}. #{count} events processed."
        )
        :ok

      {:error, :rollback} ->
        {:error, {:timeout, :archive_replay, projector_name}}

      {:error, reason} = error ->
        {:error, {:archive_replay_failed, projector_name, reason}}
    end
  end

  # Read all archived streams and order their events by `created_at`
  # field and assigning an event_number that is derived from that
  # ordering.
  defp stream_archived_forward(conn) do
    config = Trento.EventStore.config()
    serializer = Keyword.get(config, :serializer, Trento.Support.JsonbSerializer)
    schema = Keyword.get(config, :schema, "public")

    # Archived streams have names
    # `<stream_id>-archived-<timestamp-of-archival>`. The mapping
    # table `stream_events` has only one record per event for the
    # archived streams and this is the record that designates that
    # this event originated from the archive stream, hence the
    # stream_id == original_stream_id filter.
    query = """
    SELECT
      row_number() OVER (ORDER BY e.created_at, se.stream_id, se.stream_version) AS event_number,
      e.event_id,
      s.stream_uuid,
      se.original_stream_version,
      e.event_type,
      e.correlation_id,
      e.causation_id,
      e.data,
      e.metadata,
      e.created_at
    FROM "#{schema}".stream_events se
    INNER JOIN "#{schema}".streams s ON s.stream_id = se.stream_id
    INNER JOIN "#{schema}".events e ON se.event_id = e.event_id
    WHERE se.stream_id = se.original_stream_id AND s.stream_uuid LIKE '%-archived-%'
    ORDER BY event_number ASC;
    """

    conn
    |> Postgrex.stream(query, [], max_rows: 1_000)
    |> Stream.flat_map(&result_to_recorded_events(&1, serializer))
    |> Commanded.Event.Upcast.upcast_event_stream(
      additional_metadata: %{application: Trento.Commanded}
    )
  end

  defp result_to_recorded_events(%Postgrex.Result{rows: rows}, serializer) do
    rows
    |> EventStore.Storage.Reader.EventAdapter.to_event_data()
    |> Enum.map(&EventStore.RecordedEvent.deserialize(&1, serializer))
    # Convert EventStore.RecordedEvent to
    # Commanded.EventStore.Recorded event which is part of
    # `commanded_event_store_adapter` in the original
    # stream_forward() function.
    |> Enum.map(&Commanded.EventStore.Adapters.EventStore.Mapper.from_recorded_event/1)
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

    try do
      case wait_for_projectors(projector_names, stream_version, @active_catchup_timeout) do
        :ok -> :ok
        {:error, :timeout} -> {:error, {:timeout, :active_catchup}}
      end
    after
      Supervisor.stop(supervisor_pid)
    end
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
