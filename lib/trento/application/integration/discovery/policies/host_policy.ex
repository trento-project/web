defmodule Trento.Integration.Discovery.HostPolicy do
  @moduledoc """
  This module contains functions to transform host related integration events into commands.
  """

  require Trento.Domain.Enums.Provider, as: Provider

  alias Trento.Domain.Commands.{
    RegisterHost,
    UpdateProvider,
    UpdateSlesSubscriptions
  }

  alias Trento.Integration.Discovery.{
    CloudDiscoveryPayload,
    CloudDiscoveryPayload.AwsMetadata,
    CloudDiscoveryPayload.AzureMetadata,
    CloudDiscoveryPayload.GcpMetadata,
    HostDiscoveryPayload,
    SlesSubscriptionDiscoveryPayload
  }

  @spec handle(map) ::
          {:ok, RegisterHost.t() | UpdateProvider.t() | UpdateSlesSubscriptions.t()}
          | {:error, any}
  def handle(%{
        "discovery_type" => "host_discovery",
        "agent_id" => agent_id,
        "payload" => payload
      }) do
    case HostDiscoveryPayload.new(payload) do
      {:ok, decoded_payload} -> build_register_host_command(agent_id, decoded_payload)
      error -> error
    end
  end

  def handle(%{
        "discovery_type" => "cloud_discovery",
        "agent_id" => agent_id,
        "payload" => payload
      }) do
    payload
    |> ProperCase.to_snake_case()
    |> CloudDiscoveryPayload.new()
    |> case do
      {:ok, decoded_payload} -> build_update_provider_command(agent_id, decoded_payload)
      error -> error
    end
  end

  def handle(%{
        "discovery_type" => "cloud_discovery",
        "agent_id" => agent_id
      }) do
    UpdateProvider.new(%{
      host_id: agent_id,
      provider: :unknown,
      provider_data: nil
    })
  end

  def handle(%{
        "discovery_type" => "subscription_discovery",
        "agent_id" => agent_id,
        "payload" => payload
      }) do
    payload
    |> SlesSubscriptionDiscoveryPayload.new()
    |> case do
      {:ok, decoded_payload} -> build_update_sles_subscriptions_command(agent_id, decoded_payload)
      error -> error
    end
  end

  defp build_register_host_command(agent_id, %HostDiscoveryPayload{
         hostname: hostname,
         ip_addresses: ip_addresses,
         ssh_address: ssh_address,
         agent_version: agent_version,
         cpu_count: cpu_count,
         total_memory_mb: total_memory_mb,
         socket_count: socket_count,
         os_version: os_version,
         installation_source: installation_source
       }),
       do:
         RegisterHost.new(%{
           host_id: agent_id,
           hostname: hostname,
           ip_addresses: Enum.filter(ip_addresses, &is_non_loopback_ipv4?/1),
           ssh_address: ssh_address,
           agent_version: agent_version,
           cpu_count: cpu_count,
           total_memory_mb: total_memory_mb,
           socket_count: socket_count,
           os_version: os_version,
           installation_source: installation_source
         })

  defp build_update_provider_command(agent_id, %CloudDiscoveryPayload{
         provider: provider,
         metadata: metadata
       }) do
    UpdateProvider.new(%{
      host_id: agent_id,
      provider: provider,
      provider_data: parse_cloud_provider_metadata(provider, metadata)
    })
  end

  defp build_update_sles_subscriptions_command(agent_id, subscriptions),
    do:
      UpdateSlesSubscriptions.new(%{
        host_id: agent_id,
        subscriptions:
          Enum.map(subscriptions, fn subscription ->
            subscription |> Map.from_struct() |> Map.put(:host_id, agent_id)
          end)
      })

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

  @spec parse_cloud_provider_metadata(Provider.t(), map) ::
          map
  defp parse_cloud_provider_metadata(
         Provider.azure(),
         %AzureMetadata{
           compute: %{
             name: name,
             resource_group_name: resource_group,
             location: location,
             vm_size: vm_size,
             storage_profile: storage_profile,
             offer: offer,
             sku: sku,
             os_profile: %{admin_username: admin_username}
           }
         }
       ),
       do: %{
         vm_name: name,
         resource_group: resource_group,
         location: location,
         vm_size: vm_size,
         data_disk_number: parse_storage_profile(storage_profile),
         offer: offer,
         sku: sku,
         admin_username: admin_username
       }

  defp parse_cloud_provider_metadata(
         Provider.aws(),
         %AwsMetadata{
           account_id: account_id,
           ami_id: ami_id,
           availability_zone: availability_zone,
           data_disk_number: data_disk_number,
           instance_id: instance_id,
           instance_type: instance_type,
           region: region,
           vpc_id: vpc_id
         }
       ),
       do: %{
         account_id: account_id,
         ami_id: ami_id,
         availability_zone: availability_zone,
         data_disk_number: data_disk_number,
         instance_id: instance_id,
         instance_type: instance_type,
         region: region,
         vpc_id: vpc_id
       }

  defp parse_cloud_provider_metadata(
         Provider.gcp(),
         %GcpMetadata{
           disk_number: disk_number,
           image: image,
           instance_name: instance_name,
           machine_type: machine_type,
           network: network,
           project_id: project_id,
           zone: zone
         }
       ),
       do: %{
         disk_number: disk_number,
         image: image,
         instance_name: instance_name,
         machine_type: machine_type,
         network: network,
         project_id: project_id,
         zone: zone
       }

  defp parse_cloud_provider_metadata(_, generic_metadata), do: generic_metadata

  @spec parse_storage_profile(map) :: non_neg_integer()
  defp parse_storage_profile(%{data_disks: nil}), do: 0
  defp parse_storage_profile(%{data_disks: data_disks}), do: length(data_disks)
  defp parse_storage_profile(_), do: 0
end
