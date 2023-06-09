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

  @spec get_all_hosts :: [HostReadModel.t()]
  def get_all_hosts do
    HostReadModel
    |> where([h], not is_nil(h.hostname) and is_nil(h.deregistered_at))
    |> order_by(asc: :hostname)
    |> enrich_host_read_model_query()
    |> Repo.all()
    |> Repo.preload([:sles_subscriptions, :tags])
  end

  @spec get_host_by_id(Ecto.UUID.t()) :: HostReadModel.t() | nil
  def get_host_by_id(id) do
    HostReadModel
    |> where([h], h.id == ^id and is_nil(h.deregistered_at))
    |> enrich_host_read_model_query()
    |> Repo.one()
    |> Repo.preload([:sles_subscriptions, :tags])
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

  @spec enrich_host_read_model_query(Ecto.Query.t()) :: Ecto.Query.t()
  defp enrich_host_read_model_query(query) do
    query
    |> join(:left, [h], hb in Heartbeat, on: type(h.id, :string) == hb.agent_id)
    |> select_merge([h, hb], %{last_heartbeat_timestamp: hb.timestamp})
  end

  defp commanded,
    do: Application.fetch_env!(:trento, Trento.Commanded)[:adapter]
end
