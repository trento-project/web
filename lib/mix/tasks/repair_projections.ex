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

    case start_repo() do
      {:ok, _} ->
        Enum.each([:eventstore, :commanded], &Application.ensure_all_started/1)
        Trento.Commanded.start_link()
        Phoenix.PubSub.Supervisor.start_link(name: Trento.PubSub)
        TrentoWeb.Endpoint.start_link()

        check_and_rebuild_projectors()

      {:error, error} ->
        print_error("Could not start repo: #{inspect(error)}")
    end
  end

  defp disable_endpoint_server do
    endpoint_config =
      :trento
      |> Application.get_env(TrentoWeb.Endpoint, [])
      |> Keyword.put(:server, false)

    Application.put_env(:trento, TrentoWeb.Endpoint, endpoint_config)
  end

  defp check_and_rebuild_projectors do
    # Projectors to rebuild are marked with the special value `0`.
    projectors_to_rebuild =
      "SELECT projection_name FROM projection_versions WHERE last_seen_event_number = 0;"
      |> Trento.Repo.query!()
      |> Map.fetch!(:rows)
      |> List.flatten()

    if Enum.empty?(projectors_to_rebuild) do
      Logger.info(IO.ANSI.format([:green, "No projections need rebuilding."]))
    else
      # All projectors subscribe to the global stream "$all". Get the
      # latest event in the global stream.
      {:ok, %{stream_version: stream_version}} = Trento.EventStore.stream_info("$all")

      Logger.info(
        "Rebuilding projectors: #{Enum.join(projectors_to_rebuild, ", ")} (stream head: #{stream_version})..."
      )

      rebuild_projectors(projectors_to_rebuild, stream_version)
    end
  end

  defp rebuild_projectors(projector_names, stream_version) do
    # Reset the projectors' subscriptions so they can replay all events.
    Enum.each(projector_names, fn projector_name ->
      Logger.info("Resetting EventStore subscription for #{projector_name}...")
      Trento.EventStore.delete_all_streams_subscription(projector_name)
    end)

    # Start ProjectorsSupervisor and wait until specified projectors
    # caught up on the stream.
    {:ok, supervisor_pid} = Trento.ProjectorsSupervisor.start_link([])

    case wait_for_projectors(projector_names, stream_version, 60_000) do
      :ok ->
        Logger.info(IO.ANSI.format([:green, "Projections catch-up complete."]))

      {:error, :timeout} ->
        Logger.error(IO.ANSI.format([:red, "Timed out waiting for projections to catch up."]))
    end

    Supervisor.stop(supervisor_pid)
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
    case Registry.whereis_name(
           {registry, {"$all", projector_name}}
         ) do
           :undefined ->
             :starting

           pid when is_pid(pid) ->
             EventStore.Subscriptions.Subscription.last_seen(pid)
    end
  end
end
