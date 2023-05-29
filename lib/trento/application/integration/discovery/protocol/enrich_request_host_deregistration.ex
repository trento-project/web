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
    host_exists = Repo.exists?(HostReadModel, id: host_id)

    query =
      from(h in Heartbeat,
        where:
          h.timestamp >
            ^DateTime.add(DateTime.utc_now(), -@total_deregistration_debounce, :millisecond) and
            h.agent_id == ^host_id
      )

    heartbeat_invalid = Repo.exists?(query)

    cond do
      host_exists and heartbeat_invalid ->
        {:error, :host_alive}

      host_exists and not heartbeat_invalid ->
        {:ok, command}

      true ->
        {:error, :host_not_registered}
    end
  end
end
