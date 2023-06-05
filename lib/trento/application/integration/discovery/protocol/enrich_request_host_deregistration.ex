defimpl Trento.Support.Middleware.Enrichable,
  for: Trento.Domain.Commands.RequestHostDeregistration do
  alias Trento.Domain.Commands.RequestHostDeregistration

  alias Trento.Repo

  alias Trento.Heartbeat
  alias Trento.HostReadModel

  import Ecto.Query

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
    with true <- Repo.exists?(HostReadModel, id: host_id),
         :ok <- host_deregisterable(host_id) do
      {:ok, command}
    else
      {:error, :host_alive} -> {:error, :host_alive}
      _ -> {:error, :host_not_registered}
    end
  end

  @spec host_deregisterable(Ecto.UUID) :: :ok | {:error, :host_alive}
  defp host_deregisterable(host_id) do
    query =
      from(h in Heartbeat,
        where:
          ^DateTime.utc_now() <
            datetime_add(h.timestamp, @total_deregistration_debounce, "millisecond") and
            h.agent_id == ^host_id
      )

    if Repo.exists?(query), do: {:error, :host_alive}, else: :ok
  end
end
