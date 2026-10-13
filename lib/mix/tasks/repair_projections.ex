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

  # 5mins
  @default_replay_timeout 300_000

  @shortdoc "Rebuild projections marked for reset"
  def run(_args) do
    # Ensure we don't start serving during replay of the
    # events. Concerning mostly during production release task.
    disable_endpoint_server()

    with :ok <- start_dependency_processes(),
         {:ok, count} <- check_and_rebuild_projectors() do
      Logger.info(
        IO.ANSI.format([:green, "Projections repair complete. #{count} events processed."])
      )
    else
      :no_rebuild_needed ->
        Logger.info(IO.ANSI.format([:green, "No projections need repairing."]))

      {:error, :timeout} ->
        Logger.error(IO.ANSI.format([:red, "Timed out when repairing projections"]))
        System.stop(2)

      {:error, error} ->
        Logger.error(IO.ANSI.format([:red, "Failed to rebuild projections: #{inspect(error)}"]))
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
    else
      {:error, error} ->
        {:error, "Could not start dependencies: #{inspect(error)}"}
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
      replay_all_with_archived_events(projectors_to_rebuild)
    end
  end

  # Manually read all events in the event store. This is a recreation
  # of what Commanded's EventStore.stream_all_forward() function is
  # doing but combining events from all archived streams as
  # well. Additionally, we make use of optimizations such as using
  # Postgrex.stream() instead of the manual chunking used by the
  # EventStore implementation.
  defp replay_all_with_archived_events(projectors_to_rebuild) do
    projector_modules_map = Map.take(get_projector_modules(), projectors_to_rebuild)
    {:ok, pid} = Postgrex.start_link(Trento.EventStore.config())

    try do
      transaction_result =
        Postgrex.transaction(
          pid,
          fn conn ->
            conn
            |> stream_all_with_archived_forward()
            |> Enum.reduce(0, fn event, count ->
              Enum.each(projector_modules_map, &apply_event_to_projector(event, &1))
              count + 1
            end)
          end,
          timeout: @default_replay_timeout
        )

      case transaction_result do
        {:error, :rollback} ->
          {:error, :timeout}

        result ->
          result
      end
    after
      GenServer.stop(pid)
    end
  end

  # Pass the event to a projector's handle/2 and prepares the metadata
  # in the same way that an ordinary event handler is using
  # internally.
  defp apply_event_to_projector(event, {projector_name, projector_module}) do
    metadata =
      Commanded.EventStore.RecordedEvent.enrich_metadata(
        event,
        additional_metadata: %{
          application: Trento.Commanded,
          handler_name: projector_name
        }
      )

    projector_module.handle(event.data, metadata)
  end

  # Get projector name to module map from its supervisor but without
  # starting it.
  defp get_projector_modules do
    {:ok, {_, children}} = Trento.ProjectorsSupervisor.init([])

    Map.new(children, fn %{start: {module, :start_link, [opts]}} ->
      {Keyword.fetch!(opts, :name), module}
    end)
  end

  # Read all events from $all stream and backfilling events from
  # archived streams. Since the logical global ordering of archived
  # events is lost from the RollUp process we use `created_at` field
  # to maximally approximate that order.
  # ---
  # IMPORTANT: We are using synthetic event_numbers derived by the
  # `created_at` timestamp of the events. We assume that by
  # backfilling events from the archived streams, we would re-create
  # the global `stream_version` (event_number) exactly for the events
  # that are currently in the $all stream (eg. not still
  # archived). This is supposed to be exactly the inverse operation of
  # the DB modifications caused by the RollUp. However, if you notice
  # that this doesn't hold true anymore for some reason the
  # implementation should be changed. Not having the same global
  # event_number for an event currently in the $all stream has
  # implications on either missing a projection from an event (if the
  # last replayed event to that projector was with higher than
  # expected number, very unlikely) or duplicate projection (if the
  # last replayed event to that projector was with lower the expected
  # number).
  # ---
  defp stream_all_with_archived_forward(conn) do
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
    INNER JOIN "#{schema}".streams s ON s.stream_id = se.original_stream_id
    INNER JOIN "#{schema}".events e ON se.event_id = e.event_id
    WHERE (se.stream_id = 0)
       OR (se.stream_id = se.original_stream_id AND s.stream_uuid LIKE '%-archived-%')
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
    |> Enum.map(&Commanded.EventStore.Adapters.EventStore.Mapper.from_recorded_event/1)
  end
end
