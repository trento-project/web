defimpl Trento.Support.Middleware.Enrichable,
  for: Trento.Domain.Commands.RequestHostDeregistration do
  alias Trento.Domain.Commands.RequestHostDeregistration

  import Ecto.Query

  alias Trento.{
    Heartbeat,
    HostReadModel,
    Repo
  }

  @heartbeat_interval Application.compile_env!(:trento, Trento.Heartbeats)[:interval]
  @deregistration_debounce Application.compile_env!(
                             :trento,
                             :deregistration_debounce
                           )
  @total_deregistration_debounce @heartbeat_interval + @deregistration_debounce

  @spec enrich(RequestHostDeregistration.t(), map) ::
          {:ok, RequestHostDeregistration.t()}
          | {:error, :host_alive}
          | {:error, :host_not_registered}
  def enrich(%RequestHostDeregistration{host_id: host_id} = command, _) do
    HostReadModel
    |> where([h], h.id == ^host_id)
    |> enrich_host_read_model_query()
    |> Repo.one()
    |> host_deregisterable(command)
  end

  defp host_deregisterable(
         %HostReadModel{last_heartbeat_timestamp: nil, deregistered_at: nil},
         %RequestHostDeregistration{} = command
       ),
       do: {:ok, command}

  defp host_deregisterable(
         %HostReadModel{
           last_heartbeat_timestamp: last_heartbeat_timestamp,
           deregistered_at: nil
         },
         %RequestHostDeregistration{} = command
       ) do
    if :lt ==
         DateTime.compare(
           DateTime.utc_now(),
           DateTime.add(last_heartbeat_timestamp, @total_deregistration_debounce, :millisecond)
         ),
       do: {:error, :host_alive},
       else: {:ok, command}
  end

  defp host_deregisterable(_, _), do: {:error, :host_not_registered}

  @spec enrich_host_read_model_query(Ecto.Query.t()) :: Ecto.Query.t()
  defp enrich_host_read_model_query(query) do
    query
    |> join(:left, [h], hb in Heartbeat, on: type(h.id, :string) == hb.agent_id)
    |> select_merge([h, hb], %{last_heartbeat_timestamp: hb.timestamp})
  end
end
