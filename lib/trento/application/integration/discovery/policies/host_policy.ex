defmodule Trento.Integration.Discovery.HostPolicy do
  @moduledoc """
  This module contains functions to trasnform host related integration events into commands.
  """

  alias Trento.Domain.Commands.{
    RegisterHost,
    UpdateProvider,
    UpdateSlesSubscriptions
  }

  alias Trento.Domain.{
    AzureProvider,
    SlesSubscription
  }

  @spec handle(map) ::
          {:ok, RegisterHost.t() | UpdateProvider.t() | UpdateSlesSubscriptions.t()}
          | {:error, any}
  def handle(%{
        "discovery_type" => "host_discovery",
        "agent_id" => agent_id,
        "payload" => %{
          "hostname" => hostname,
          "ip_addresses" => ip_addresses,
          "agent_version" => agent_version,
          "cpu_count" => cpu_count,
          "total_memory_mb" => total_memory_mb,
          "socket_count" => socket_count,
          "os_version" => os_version
        }
      }) do
    RegisterHost.new(
      host_id: agent_id,
      hostname: hostname,
      ip_addresses: Enum.filter(ip_addresses, &is_non_loopback_ipv4?/1),
      agent_version: agent_version,
      cpu_count: cpu_count,
      total_memory_mb: total_memory_mb,
      socket_count: socket_count,
      os_version: os_version
    )
  end

  def handle(%{
        "discovery_type" => "cloud_discovery",
        "agent_id" => agent_id,
        "payload" =>
          %{
            "Provider" => "azure"
          } = payload
      }) do
    with {:ok, azure_data} <- parse_azure_data(payload) do
      UpdateProvider.new(
        host_id: agent_id,
        provider: :azure,
        provider_data: azure_data
      )
    end
  end

  def handle(%{
        "discovery_type" => "cloud_discovery",
        "agent_id" => agent_id
      }) do
    UpdateProvider.new(
      host_id: agent_id,
      provider: :unknown,
      provider_data: nil
    )
  end

  def handle(%{
        "discovery_type" => "subscription_discovery",
        "agent_id" => agent_id,
        "payload" => payload
      }) do
    subscriptions =
      Enum.map(payload, fn subscription -> parse_subscription_data(agent_id, subscription) end)

    UpdateSlesSubscriptions.new(host_id: agent_id, subscriptions: subscriptions)
  end

  @spec is_non_loopback_ipv4?(String.t()) :: boolean
  defp is_non_loopback_ipv4?("127.0.0.1"), do: false

  defp is_non_loopback_ipv4?(ip) do
    case :inet.parse_ipv4_address(String.to_charlist(ip)) do
      {:ok, _} ->
        true

      {:error, :einval} ->
        false
    end
  end

  @spec parse_subscription_data(String.t(), map) :: SlesSubscription.t()
  defp parse_subscription_data(host_id, %{
         "arch" => arch,
         "expires_at" => expires_at,
         "identifier" => identifier,
         "starts_at" => starts_at,
         "status" => status,
         "subscription_status" => subscription_status,
         "type" => type,
         "version" => version
       }) do
    SlesSubscription.new!(
      host_id: host_id,
      arch: arch,
      expires_at: expires_at,
      identifier: identifier,
      starts_at: starts_at,
      status: status,
      subscription_status: subscription_status,
      type: type,
      version: version
    )
  end

  defp parse_subscription_data(host_id, %{
         "arch" => arch,
         "identifier" => identifier,
         "status" => status,
         "version" => version
       }) do
    SlesSubscription.new!(
      host_id: host_id,
      arch: arch,
      identifier: identifier,
      status: status,
      version: version
    )
  end

  @spec parse_azure_data(map) :: {:ok, AzureProvider.t()} | {:error, any}
  defp parse_azure_data(%{
         "Metadata" => %{
           "compute" => %{
             "name" => name,
             "resourceId" => resource_group,
             "location" => location,
             "vmSize" => vm_size,
             "storageProfile" => storage_profile,
             "offer" => offer,
             "sku" => sku
           }
         }
       }) do
    AzureProvider.new(
      vm_name: name,
      resource_group: resource_group,
      location: location,
      vm_size: vm_size,
      data_disk_number: parse_data_disk_number(storage_profile),
      offer: offer,
      sku: sku
    )
  end

  @spec parse_data_disk_number(map) :: non_neg_integer()
  defp parse_data_disk_number(%{"dataDisks" => data_disks}), do: length(data_disks)

  defp parse_data_disk_number(_), do: 0
end
