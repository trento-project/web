defmodule Trento.Hosts do
  @moduledoc """
  Provides a set of functions to interact with hosts.
  """

  import Ecto.Query

  alias Trento.{
    HostConnectionSettings,
    HostReadModel,
    SlesSubscriptionReadModel
  }

  alias Trento.Repo

  @spec get_all_hosts :: [HostReadModel.t()]
  def get_all_hosts do
    HostReadModel
    |> where([h], not is_nil(h.hostname))
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

  @spec get_connection_settings(String.t()) :: map | {:error, any}
  def get_connection_settings(host_id) do
    # TODO: refactor to a comon query
    query =
      from h in HostReadModel,
        left_join: s in HostConnectionSettings,
        on: h.id == s.id,
        select: %{
          host_id: h.id,
          hostname: h.hostname,
          user: s.user,
          ssh_address: h.ssh_address,
          provider: h.provider
        },
        where: h.id == ^host_id

    query
    |> Repo.one()
    |> enrich_with_default_user()
  end

  @spec get_all_connection_settings_by_cluster_id(String.t()) :: [
          %{
            host_id: String.t(),
            hostname: String.t(),
            user: String.t()
          }
        ]
  def get_all_connection_settings_by_cluster_id(cluster_id) do
    query =
      from(h in HostReadModel,
        left_join: s in HostConnectionSettings,
        on: h.id == s.id,
        select: %{
          host_id: h.id,
          hostname: h.hostname,
          user: s.user,
          ssh_address: h.ssh_address,
          provider: h.provider
        },
        where: h.cluster_id == ^cluster_id,
        order_by: [asc: h.hostname]
      )

    Repo.all(query)
    |> Enum.map(&enrich_with_default_user/1)
  end

  @spec save_hosts_connection_settings([
          %{
            host_id: String.t(),
            user: String.t()
          }
        ]) :: :ok
  def save_hosts_connection_settings(settings) do
    settings =
      Enum.map(settings, fn %{host_id: host_id, user: user} ->
        # TODO: use changeset to properly validate input
        %{
          id: host_id,
          user: user
        }
      end)

    Repo.insert_all(HostConnectionSettings, settings,
      on_conflict: :replace_all,
      conflict_target: [:id]
    )

    :ok
  end

  defp enrich_with_default_user(%{
         host_id: host_id,
         hostname: hostname,
         user: user,
         provider: provider,
         ssh_address: ssh_address
       }) do
    %{
      host_id: host_id,
      hostname: hostname,
      user: user,
      ssh_address: ssh_address,
      default_user: determine_default_connection_user(provider)
    }
  end

  defp determine_default_connection_user(:azure), do: "cloudadmin"
  defp determine_default_connection_user(_), do: "root"
end
