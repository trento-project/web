defmodule TrentoWeb.V1.HostView do
  use TrentoWeb, :view

  def render("hosts.json", %{hosts: hosts}) do
    render_many(hosts, __MODULE__, "host.json")
  end

  def render("host.json", %{host: host}) do
    host
    |> Map.from_struct()
    |> Map.delete(:__meta__)
  end

  def render("host_details_updated.json", %{host: host}) do
    render("host.json", %{host: host})
    |> Map.delete(:sles_subscriptions)
    |> Map.delete(:tags)
    |> Map.delete(:cluster_id)
    |> Map.delete(:heartbeat)
    |> Map.delete(:provider)
  end

  def render("host_registered.json", %{host: host}) do
    render("host.json", %{host: host})
    |> Map.delete(:sles_subscriptions)
    |> Map.delete(:tags)
  end

  def render("host_restored.json", %{host: host}) do
    render("host.json", %{host: host})
  end

  def render("heartbeat_result.json", %{host: %{id: id, hostname: hostname}}) do
    %{id: id, hostname: hostname}
  end

  def render("saptune_status_updated.json", %{
        host: %{id: id, saptune_status: status, hostname: hostname}
      }) do
    %{id: id, status: status, hostname: hostname}
  end
end
