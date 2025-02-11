defmodule TrentoWeb.V1.HostJSON do
  def hosts(%{hosts: hosts}), do: Enum.map(hosts, &host(%{host: &1}))

  def host(%{host: %{sles_subscriptions: sles_subscriptions} = host}) do
    sles_subscriptions =
      Enum.map(sles_subscriptions, &sles_subscription(%{sles_subscription: &1}))

    host
    |> Map.from_struct()
    |> Map.put(:sles_subscriptions, sles_subscriptions)
    |> Map.delete(:fully_qualified_domain_name)
    |> Map.delete(:prometheus_targets)
    |> Map.delete(:cluster)
    |> Map.delete(:application_instances)
    |> Map.delete(:database_instances)
    |> Map.delete(:__meta__)
  end

  def sles_subscription(%{sles_subscription: sles_subscription}) do
    sles_subscription
    |> Map.from_struct()
    |> Map.delete(:__meta__)
    |> Map.delete(:inserted_at)
    |> Map.delete(:updated_at)
  end

  def sles_subscription(_), do: nil

  def broadcast_host(%{host: host}) do
    host
    |> Map.from_struct()
    |> Map.delete(:cluster)
    |> Map.delete(:application_instances)
    |> Map.delete(:database_instances)
    |> Map.delete(:__meta__)
  end

  def host_details_updated(%{host: host}) do
    broadcast_host(%{host: host})
    |> Map.delete(:sles_subscriptions)
    |> Map.delete(:tags)
    |> Map.delete(:cluster_id)
    |> Map.delete(:heartbeat)
    |> Map.delete(:health)
    |> Map.delete(:provider)
  end

  def host_registered(%{host: host}) do
    broadcast_host(%{host: host})
    |> Map.delete(:sles_subscriptions)
    |> Map.delete(:tags)
  end

  def host_restored(%{host: host}) do
    broadcast_host(%{host: host})
  end

  def heartbeat_result(%{host: %{id: id, hostname: hostname}}), do: %{id: id, hostname: hostname}

  def saptune_status_updated(%{
        host: %{id: id, saptune_status: status, hostname: hostname}
      }),
      do: %{id: id, status: status, hostname: hostname}

  def host_health_changed(%{host: %{id: id, hostname: hostname, health: health}}),
    do: %{id: id, hostname: hostname, health: health}
end
