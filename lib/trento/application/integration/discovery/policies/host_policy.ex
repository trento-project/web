defmodule Trento.Integration.Discovery.HostPolicy do
  @moduledoc """
  This module contains functions to trasnform host related integration events into commands.
  """

  alias Trento.Domain.Commands.{
    RegisterHost,
    UpdateProvider,
    UpdateSlesSubscriptions
  }

  alias Trento.Integration.Discovery.{CloudDiscoveryPayload, HostDiscoveryPayload}

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
    subscriptions =
      Enum.map(payload, fn subscription -> parse_subscription_data(agent_id, subscription) end)

    UpdateSlesSubscriptions.new(%{host_id: agent_id, subscriptions: subscriptions})
  end

  defp build_register_host_command(agent_id, %HostDiscoveryPayload{
         hostname: hostname,
         ip_addresses: ip_addresses,
         ssh_address: ssh_address,
         agent_version: agent_version,
         cpu_count: cpu_count,
         total_memory_mb: total_memory_mb,
         socket_count: socket_count,
         os_version: os_version
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
           os_version: os_version
         })

  defp build_update_provider_command(agent_id, %CloudDiscoveryPayload{
         provider: provider,
         metadata: metadata
       }) do
    UpdateProvider.new(%{
      host_id: agent_id,
      provider: provider,
      provider_data:
        case metadata do
          %{
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
          } ->
            %{
              vm_name: name,
              resource_group: resource_group,
              location: location,
              vm_size: vm_size,
              data_disk_number:
                case storage_profile do
                  %{data_disks: nil} -> 0
                  %{data_disks: data_disks} -> length(data_disks)
                  _ -> 0
                end,
              offer: offer,
              sku: sku,
              admin_username: admin_username
            }

          generic_metadata ->
            generic_metadata
        end
    })
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

  @spec parse_subscription_data(String.t(), map) :: map
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
    %{
      host_id: host_id,
      arch: arch,
      expires_at: expires_at,
      identifier: identifier,
      starts_at: starts_at,
      status: status,
      subscription_status: subscription_status,
      type: type,
      version: version
    }
  end

  defp parse_subscription_data(host_id, %{
         "arch" => arch,
         "identifier" => identifier,
         "status" => status,
         "version" => version
       }) do
    %{
      host_id: host_id,
      arch: arch,
      identifier: identifier,
      status: status,
      version: version
    }
  end
end
