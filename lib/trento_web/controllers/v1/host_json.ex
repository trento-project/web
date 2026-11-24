# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule TrentoWeb.V1.HostJSON do
  alias Trento.Support.StructHelper

  def hosts(%{hosts: hosts}), do: Enum.map(hosts, &host(%{host: &1}))

  def host(%{host: %{sles_subscriptions: sles_subscriptions} = host}) do
    sles_subscriptions =
      Enum.map(sles_subscriptions, &sles_subscription(%{sles_subscription: &1}))

    host
    |> StructHelper.to_atomized_map()
    |> Map.put(:sles_subscriptions, sles_subscriptions)
    |> Map.delete(:fully_qualified_domain_name)
    |> Map.delete(:prometheus_targets)
    |> Map.delete(:prometheus_mode)
    |> Map.delete(:cluster)
    |> Map.delete(:application_instances)
    |> Map.delete(:database_instances)
    |> remove_reason_from_health_details()
  end

  def sles_subscription(%{sles_subscription: sles_subscription}) do
    sles_subscription
    |> StructHelper.to_atomized_map()
    |> Map.delete(:inserted_at)
    |> Map.delete(:updated_at)
  end

  def sles_subscription(_), do: nil

  def broadcast_host(%{host: host}) do
    host
    |> StructHelper.to_atomized_map()
    |> Map.delete(:cluster)
    |> Map.delete(:application_instances)
    |> Map.delete(:database_instances)
    |> Map.delete(:prometheus_targets)
    |> Map.delete(:prometheus_mode)
    |> remove_reason_from_health_details()
  end

  def host_details_updated(%{host: host}) do
    broadcast_host(%{host: host})
    |> Map.delete(:sles_subscriptions)
    |> Map.delete(:tags)
    |> Map.delete(:cluster_id)
    |> Map.delete(:heartbeat)
    |> Map.delete(:health)
    |> Map.delete(:health_details)
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

  def heartbeat_result(%{host: %{id: id, hostname: hostname, stale_at: nil}}),
    do: %{id: id, hostname: hostname}

  def heartbeat_result(%{host: %{id: id, hostname: hostname, stale_at: stale_at}}),
    do: %{id: id, hostname: hostname, stale_at: stale_at}

  def saptune_status_updated(%{
        host: %{id: id, saptune_status: status, hostname: hostname}
      }),
      do: %{id: id, status: status, hostname: hostname}

  def host_health_changed(%{host: %{id: id, hostname: hostname, health: health}}),
    do: %{id: id, hostname: hostname, health: health}

  def host_health_details_changed(data) do
    data
    |> StructHelper.to_atomized_map()
    |> remove_reason_from_health_details()
    |> Map.take([:id, :health_details])
  end

  defp remove_reason_from_health_details(%{health_details: nil} = data), do: data

  defp remove_reason_from_health_details(data) do
    Map.update!(data, :health_details, fn health_details ->
      health_details
      |> Enum.map(fn {key, details} -> {key, Map.delete(details, :reason)} end)
      |> Map.new()
    end)
  end
end
