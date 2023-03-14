defmodule Trento.Hosts do
  @moduledoc """
  Provides a set of functions to interact with hosts.
  """

  import Ecto.Query

  alias Trento.{
    HostReadModel,
    SlesSubscriptionReadModel
  }

  alias Trento.Repo

  @spec get_all_hosts :: [HostReadModel.t()]
  def get_all_hosts do
    HostReadModel
    |> where([h], not is_nil(h.hostname) and is_nil(h.deregistered_at))
    |> order_by(asc: :hostname)
    |> Repo.all()
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
end
