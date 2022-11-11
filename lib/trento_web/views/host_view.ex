defmodule TrentoWeb.HostView do
  use TrentoWeb, :view

  def render("hosts.json", %{hosts: hosts}) do
    render_many(hosts, __MODULE__, "host.json")
  end

  def render("host.json", %{host: host}), do: host

  def render("host_details_updated.json", %{host: host}) do
    host
    |> Map.from_struct()
    |> Map.delete(:__meta__)
    |> Map.delete(:sles_subscriptions)
    |> Map.delete(:tags)
    |> Map.delete(:cluster_id)
    |> Map.delete(:heartbeat)
    |> Map.delete(:provider)
  end

  def render("host_registered.json", %{host: host}) do
    host
    |> Map.from_struct()
    |> Map.delete(:__meta__)
    |> Map.delete(:sles_subscriptions)
    |> Map.delete(:tags)
  end
end
