defimpl Trento.Support.Middleware.Enrichable,
  for: Trento.Domain.Commands.RequestHostDeregistration do
  alias Trento.Domain.Commands.RequestHostDeregistration

  alias Trento.Repo
  alias Trento.HostReadModel

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
    Repo.get(HostReadModel, host_id)
    |> Repo.preload([:heartbeat_timestamp])
    |> host_deregisterable(command)
  end

  defp host_deregisterable(
         %HostReadModel{heartbeat_timestamp: nil, deregistered_at: nil},
         %RequestHostDeregistration{} = command
       ),
       do: {:ok, command}

  defp host_deregisterable(
         %HostReadModel{
           heartbeat_timestamp: %Trento.Heartbeat{timestamp: timestamp},
           deregistered_at: nil
         },
         %RequestHostDeregistration{} = command
       ) do
    if :lt ==
         DateTime.compare(
           DateTime.utc_now(),
           DateTime.add(timestamp, @total_deregistration_debounce, :millisecond)
         ),
       do: {:error, :host_alive},
       else: {:ok, command}
  end

  defp host_deregisterable(_, _), do: {:error, :host_not_registered}
end
