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

  def run(_args) do
    case start_repo() do
      {:ok, _} ->
        Enum.each([:eventstore, :commanded], &Application.ensure_all_started/1)
        Trento.Commanded.start_link()

        check_and_rebuild_projectors()

      {:error, error} ->
        print_error("Could not start repo: #{inspect(error)}")
    end
  end

  defp check_and_rebuild_projectors do
    all_projectors = get_all_projectors()

    # All projectors subscribe to the global stream "$all". Get the
    # latest event in the global stream.
    {:ok, %{stream_version: stream_version}} = Trento.EventStore.stream_info("$all")

    # Get all projection checkpoints
    checkpoints =
      "SELECT projection_name, last_seen_event_number FROM projection_versions;"
      |> Trento.Repo.query!()
      |> Map.fetch!(:rows)
      |> Map.new(fn [name, version] -> {name, version} end)

    # Identify which projectors need rebuilding
    projectors_to_rebuild =
      Enum.filter(all_projectors, fn projector ->
        last_seen = Map.get(checkpoints, projector, nil)
        is_nil(last_seen) or last_seen < stream_version
      end)

    if Enum.empty?(projectors_to_rebuild) do
      Logger.info("All read model projections are up to date.")
    else
      Logger.info(
        "Rebuilding/catching up: #{Enum.join(projectors_to_rebuild, ", ")} (stream head: #{stream_version})..."
      )

      rebuild_projectors(projectors_to_rebuild, stream_version)
    end
  end

  defp get_all_projectors do
    {:ok, {_flags, children}} = Trento.ProjectorsSupervisor.init([])

    for %{id: {_module, opts}} <- children,
        name = Keyword.get(opts, :name),
        is_binary(name) do
      name
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
      query = """
      SELECT projection_name, last_seen_event_number
      FROM projection_versions
      WHERE projection_name = ANY($1::text[]);
      """

      %Postgrex.Result{rows: rows} = Trento.Repo.query!(query, [projector_names])
      versions = Map.new(rows, fn [name, version] -> {name, version} end)

      all_caught_up? =
        Enum.all?(projector_names, fn projector ->
          Map.get(versions, projector, 0) >= target_stream_version
        end)

      if all_caught_up? do
        :ok
      else
        Process.sleep(100)
        do_poll_catchup(projector_names, target_stream_version, deadline)
      end
    end
  end
end
