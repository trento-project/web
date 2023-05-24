defmodule Trento.Hosts do
  @moduledoc """
  Provides a set of functions to interact with hosts.
  """

  import Ecto.Query

  alias Trento.{
    Heartbeat,
    HostReadModel,
    Repo,
    SlesSubscriptionReadModel
  }

  alias Trento.Support.DateService

  alias Trento.Domain.Commands.RequestHostDeregistration

  @heartbeat_interval Application.compile_env!(:trento, Trento.Heartbeats)[:interval]
  @deregistration_debounce Application.compile_env!(
                             :trento,
                             :deregistration_debounce
                           )

  @spec get_all_hosts :: [HostReadModel.t()]
  def get_all_hosts do
    HostReadModel
    |> where([h], not is_nil(h.hostname) and is_nil(h.deregistered_at))
    |> order_by(asc: :hostname)
    |> Repo.all()
    |> Repo.preload([:sles_subscriptions, :tags, :heartbeat_timestamp])
  end

  @spec get_all_sles_subscriptions :: non_neg_integer()
  def get_all_sles_subscriptions do
    query =
      from s in SlesSubscriptionReadModel,
        where: s.identifier == "SLES_SAP",
        select: count()

    case Repo.one(query) do
      nil ->
        0

      subscription_count ->
        subscription_count
    end
  end

  @spec deregister_host(Ecto.UUID.t(), DateService) :: :ok | {:error, any}
  def deregister_host(host_id, date_service \\ DateService) do
    case Repo.get_by(HostReadModel, id: host_id) do
      nil ->
        {:error, :host_not_found}

      _ ->
        maybe_dispatch_host_deregistration_request(host_id, date_service)
    end
  end

  defp commanded,
    do: Application.fetch_env!(:trento, Trento.Commanded)[:adapter]

  defp maybe_dispatch_host_deregistration_request(host_id, date_service) do
    now = date_service.utc_now()
    total_deregistration_debounce = @heartbeat_interval + @deregistration_debounce

    query =
      from h in Heartbeat,
        where:
          h.timestamp >
            ^DateTime.add(now, -total_deregistration_debounce, :millisecond) and
            h.agent_id == ^host_id

    case Repo.exists?(query) do
      false ->
        commanded().dispatch(
          RequestHostDeregistration.new!(%{host_id: host_id, requested_at: now})
        )

      true ->
        {:error, :host_alive}
    end
  end
end
