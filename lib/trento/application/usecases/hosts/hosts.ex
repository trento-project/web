defmodule Trento.Hosts do
  @moduledoc """
  Provides a set of functions to interact with hosts.
  """

  import Ecto.Query

  alias Trento.{
    HostReadModel,
    Repo,
    SlesSubscriptionReadModel
  }

  alias Trento.Support.DateService

  alias Trento.Domain.Commands.RequestHostDeregistration

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

  @spec deregister_host(Ecto.UUID.t(), DateService) ::
          :ok | {:error, :host_alive} | {:error, :host_not_registered}
  def deregister_host(host_id, date_service \\ DateService) do
    commanded().dispatch(
      RequestHostDeregistration.new!(%{host_id: host_id, requested_at: date_service.utc_now()})
    )
  end

  defp commanded,
    do: Application.fetch_env!(:trento, Trento.Commanded)[:adapter]
end
