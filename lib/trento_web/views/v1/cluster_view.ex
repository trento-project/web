defmodule TrentoWeb.V1.ClusterView do
  use TrentoWeb, :view

  def render("clusters.json", %{clusters: clusters}) do
    render_many(clusters, __MODULE__, "cluster.json")
  end

  def render("cluster.json", %{cluster: cluster}) do
    cluster
    |> Map.from_struct()
    |> Map.delete(:__meta__)
    |> adapt_v1()
  end

  def render("cluster_registered.json", %{cluster: cluster}) do
    Map.delete(render("cluster.json", %{cluster: cluster}), :tags)
  end

  def render("cluster_details_updated.json", %{data: data}) do
    data
    |> Map.from_struct()
    |> Map.delete(:cluster_id)
    |> Map.put(:id, data.cluster_id)
  end

  def render("settings.json", %{settings: settings}) do
    render_many(settings, __MODULE__, "setting.json", as: :setting)
  end

  def render("setting.json", %{
        setting: %{
          host_id: host_id,
          hostname: hostname,
          user: user,
          provider_data: provider_data
        }
      }) do
    %{
      host_id: host_id,
      hostname: hostname,
      user: user,
      default_user: determine_default_connection_user(provider_data)
    }
  end

  defp determine_default_connection_user(%{
         "admin_username" => admin_username
       }),
       do: admin_username

  defp determine_default_connection_user(_), do: "root"

  defp adapt_v1(%{type: type} = cluster) when type in [:hana_scale_up, :hana_scale_out, :unknown],
    do: cluster

  defp adapt_v1(cluster) do
    cluster
    |> Map.replace(:type, :unknown)
    |> Map.replace(:details, nil)
  end
end
