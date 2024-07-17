defmodule Trento.Discovery.Policies.HostPolicy do
  @moduledoc """
  This module contains functions to transform host related integration events into commands.
  """

  require Trento.Enums.Provider, as: Provider

  alias Trento.Hosts.Commands.{
    RegisterHost,
    UpdateProvider,
    UpdateSaptuneStatus,
    UpdateSlesSubscriptions
  }

  alias Trento.Discovery.Payloads.{
    CloudDiscoveryPayload,
    CloudDiscoveryPayload.AwsMetadata,
    CloudDiscoveryPayload.AzureMetadata,
    CloudDiscoveryPayload.GcpMetadata,
    HostDiscoveryPayload,
    SaptuneDiscoveryPayload,
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

  @spec handle(map, boolean) ::
          {:ok, UpdateSaptuneStatus.t()}
          | {:error, any}
  def handle(
        %{
          "discovery_type" => "saptune_discovery",
          "agent_id" => agent_id,
          "payload" => %{
            "status" => nil,
            "saptune_installed" => saptune_installed,
            "package_version" => package_version
          }
        },
        sap_running
      ) do
    build_update_saptune_command(
      agent_id,
      package_version,
      saptune_installed,
      sap_running,
      nil
    )
  end

  def handle(
        %{
          "discovery_type" => "saptune_discovery",
          "agent_id" => agent_id,
          "payload" => %{
            "status" => status,
            "saptune_installed" => saptune_installed,
            "package_version" => package_version
          }
        },
        sap_running
      ) do
    status
    |> format_saptune_payload_keys()
    |> SaptuneDiscoveryPayload.new()
    |> case do
      {:ok, decoded_payload} ->
        build_update_saptune_command(
          agent_id,
          package_version,
          saptune_installed,
          sap_running,
          decoded_payload
        )

      error ->
        error
    end
  end

  defp build_register_host_command(
         agent_id,
         %HostDiscoveryPayload{
           hostname: hostname,
           agent_version: agent_version,
           cpu_count: cpu_count,
           total_memory_mb: total_memory_mb,
           socket_count: socket_count,
           os_version: os_version,
           installation_source: installation_source,
           fully_qualified_domain_name: fqdn
         } = payload
       ),
       do:
         RegisterHost.new(%{
           host_id: agent_id,
           hostname: hostname,
           ip_addresses: build_ip_addresses(payload),
           agent_version: agent_version,
           cpu_count: cpu_count,
           total_memory_mb: total_memory_mb,
           socket_count: socket_count,
           os_version: os_version,
           installation_source: installation_source,
           fully_qualified_domain_name: fqdn
         })

  defp build_ip_addresses(%{ip_addresses: ip_addresses, netmasks: nil}) do
    Enum.filter(ip_addresses, &non_loopback_ipv4?/1)
  end

  defp build_ip_addresses(%{ip_addresses: ip_addresses, netmasks: netmasks}) do
    [ip_addresses, netmasks]
    |> Enum.zip_with(fn [address, netmask] -> %{address: address, netmask: netmask} end)
    |> Enum.filter(fn %{address: address} -> non_loopback_ipv4?(address) end)
    |> Enum.map(fn %{address: address, netmask: netmask} -> "#{address}/#{netmask}" end)
  end

  @spec non_loopback_ipv4?(String.t()) :: boolean
  defp non_loopback_ipv4?("127.0.0.1"), do: false

  defp non_loopback_ipv4?(address) do
    case :inet.parse_ipv4_address(String.to_charlist(address)) do
      {:ok, _} ->
        true

      {:error, :einval} ->
        false
    end
  end

  defp build_update_saptune_command(
         agent_id,
         package_version,
         saptune_installed,
         sap_running,
         nil
       ),
       do:
         UpdateSaptuneStatus.new(%{
           host_id: agent_id,
           saptune_installed: saptune_installed,
           package_version: package_version,
           sap_running: sap_running,
           status: nil
         })

  defp build_update_saptune_command(
         agent_id,
         package_version,
         saptune_installed,
         sap_running,
         %SaptuneDiscoveryPayload{
           result: %{
             package_version: package_version,
             configured_version: configured_version,
             tuning_state: tuning_state,
             services: services,
             notes_enabled_by_solution: notes_enabled_by_solution,
             notes_applied_by_solution: notes_applied_by_solution,
             notes_enabled_additionally: notes_enabled_additionally,
             solution_enabled: solution_enabled,
             solution_applied: solution_applied,
             notes_enabled: notes_enabled,
             notes_applied: notes_applied,
             staging: staging
           }
         }
       ) do
    UpdateSaptuneStatus.new(%{
      host_id: agent_id,
      package_version: package_version,
      saptune_installed: saptune_installed,
      sap_running: sap_running,
      status: %{
        package_version: package_version,
        configured_version: configured_version,
        tuning_state: tuning_state,
        services: format_saptune_services_list(services),
        enabled_notes: format_saptune_notes(notes_enabled, notes_enabled_additionally),
        applied_notes: format_saptune_notes(notes_applied, notes_enabled_additionally),
        enabled_solution: format_enabled_solution(solution_enabled, notes_enabled_by_solution),
        applied_solution: format_applied_solution(solution_applied, notes_applied_by_solution),
        staging: format_saptune_staging(staging)
      }
    })
  end

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

  # Saptune payload

  defp format_saptune_payload_keys(map) when is_map(map) do
    for {key, val} <- map,
        into: %{},
        do: {snake_case(key), format_saptune_payload_keys(val)}
  rescue
    Protocol.UndefinedError -> map
  end

  defp format_saptune_payload_keys(list) when is_list(list) do
    Enum.map(list, &format_saptune_payload_keys/1)
  end

  defp format_saptune_payload_keys(other_types), do: other_types

  defp snake_case(payload) when is_binary(payload) do
    payload |> String.replace(" ", "_") |> String.downcase()
  end

  defp format_saptune_services_list(service_map) do
    Enum.map(service_map, &format_saptune_service_status/1)
  end

  defp format_saptune_service_status({service_name, []}),
    do: %{"name" => service_name, "enabled" => nil, "active" => nil}

  defp format_saptune_service_status({service_name, [enabled, active]}),
    do: %{"name" => service_name, "enabled" => enabled, "active" => active}

  defp format_enabled_solution([solution_enabled], [%{"note_list" => note_list}]) do
    format_solution(%{
      "solution_id" => solution_enabled,
      "note_list" => note_list,
      "applied_partially" => false
    })
  end

  defp format_enabled_solution(_, _), do: nil

  defp format_applied_solution([solution_applied], [%{"note_list" => note_list}]) do
    format_solution(Map.put(solution_applied, "note_list", note_list))
  end

  defp format_applied_solution(_, _), do: nil

  defp format_solution(%{
         "solution_id" => solution_id,
         "note_list" => note_list,
         "applied_partially" => partially_applied
       }),
       do: %{"id" => solution_id, "notes" => note_list, "partial" => partially_applied}

  defp format_saptune_staging(%{
         "staging_enabled" => staging_enabled,
         "notes_staged" => notes_staged,
         "solutions_staged" => solutions_staged
       }) do
    %{
      "enabled" => staging_enabled,
      "notes" => notes_staged,
      "solutions_ids" => solutions_staged
    }
  end

  defp format_saptune_notes(notes, additional_notes) do
    Enum.map(notes, fn note ->
      %{
        "id" => note,
        "additionally_enabled" => Enum.member?(additional_notes, note)
      }
    end)
  end
end
