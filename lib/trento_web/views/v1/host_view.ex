defmodule TrentoWeb.V1.HostView do
  use TrentoWeb, :view

  def render("hosts.json", %{hosts: hosts}) do
    render_many(hosts, __MODULE__, "host.json")
  end

  def render("host.json", %{host: %{sles_subscriptions: sles_subscriptions} = host}) do
    sles_subscriptions =
      render_many(sles_subscriptions, __MODULE__, "sles_subscription.json",
        as: :sles_subscription
      )

    host
    |> Map.from_struct()
    |> Map.put(:sles_subscriptions, sles_subscriptions)
    |> Map.delete(:fully_qualified_domain_name)
    |> Map.delete(:health)
    |> Map.delete(:selected_checks)
    |> Map.delete(:inserted_at)
    |> Map.delete(:__meta__)
  end

  def render("sles_subscription.json", %{sles_subscription: sles_subscription}) do
    sles_subscription
    |> Map.from_struct()
    |> Map.delete(:__meta__)
    |> Map.delete(:inserted_at)
    |> Map.delete(:updated_at)
  end

  def render("sles_subscription.json", _), do: nil

  def render("broadcast_host.json", %{host: host}) do
    host
    |> Map.from_struct()
    |> Map.delete(:__meta__)
  end

  def render("host_details_updated.json", %{host: host}) do
    render("broadcast_host.json", %{host: host})
    |> Map.delete(:sles_subscriptions)
    |> Map.delete(:tags)
    |> Map.delete(:cluster_id)
    |> Map.delete(:heartbeat)
    |> Map.delete(:health)
    |> Map.delete(:provider)
  end

  def render("host_registered.json", %{host: host}) do
    render("broadcast_host.json", %{host: host})
    |> Map.delete(:sles_subscriptions)
    |> Map.delete(:tags)
  end

  def render("host_restored.json", %{host: host}) do
    render("broadcast_host.json", %{host: host})
  end

  def render("heartbeat_result.json", %{host: %{id: id, hostname: hostname}}) do
    %{id: id, hostname: hostname}
  end

  def render("saptune_status_updated.json", %{
        host: %{id: id, saptune_status: status, hostname: hostname}
      }) do
    %{id: id, status: status, hostname: hostname}
  end

  def render("host_health_changed.json", %{host: %{id: id, hostname: hostname, health: health}}) do
    %{id: id, hostname: hostname, health: health}
  end
end
