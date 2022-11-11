defmodule TrentoWeb.ClusterView do
  use TrentoWeb, :view

  def render("clusters.json", %{clusters: clusters}) do
    render_many(clusters, __MODULE__, "cluster.json")
  end

  def render("cluster.json", %{cluster: cluster}), do: cluster

  def render("cluster_registered.json", %{cluster: cluster}) do
    cluster
    |> Map.from_struct()
    |> Map.delete(:__meta__)
    |> Map.delete(:tags)
  end

  def render("settings.json", %{settings: settings}) do
    render_many(settings, __MODULE__, "setting.json", as: :setting)
  end

  def render("setting.json", %{
        setting: %{
          host_id: host_id,
          hostname: hostname,
          user: user,
          ssh_address: ssh_address,
          provider_data: provider_data
        }
      }) do
    %{
      host_id: host_id,
      hostname: hostname,
      user: user,
      ssh_address: ssh_address,
      default_user: determine_default_connection_user(provider_data)
    }
  end

  defp determine_default_connection_user(%{
         "admin_username" => admin_username
       }),
       do: admin_username

  defp determine_default_connection_user(_), do: "root"
end
