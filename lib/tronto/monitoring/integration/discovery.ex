defmodule Tronto.Monitoring.Integration.Discovery do
  @moduledoc """
  This module contains functions to handle integration events
  from the discovery bounded-context
  """

  @type command :: struct

  @database_type 1
  @application_type 2

  alias Tronto.Monitoring.Domain.Commands.{
    RegisterApplicationInstance,
    RegisterCluster,
    RegisterDatabaseInstance,
    RegisterHost,
    UpdateProvider,
    UpdateSlesSubscriptions
  }

  alias Tronto.Monitoring.Domain.{
    AzureProvider,
    SlesSubscription
  }

  @spec handle_discovery_event(map) :: {:ok, command} | {:ok, [command]} | {:error, any}
  def handle_discovery_event(%{
        "discovery_type" => "host_discovery",
        "agent_id" => agent_id,
        "payload" => %{
          "hostname" => hostname,
          "ip_addresses" => ip_addresses,
          "agent_version" => agent_version
        }
      }) do
    RegisterHost.new(
      host_id: agent_id,
      hostname: hostname,
      ip_addresses: Enum.filter(ip_addresses, &is_non_loopback_ipv4?/1),
      agent_version: agent_version
    )
  end

  def handle_discovery_event(%{
        "discovery_type" => "ha_cluster_discovery",
        "agent_id" => agent_id,
        "payload" =>
          %{
            "Id" => id,
            "Name" => name,
            "Crmmon" => %{
              "Summary" => %{
                "Resources" => %{"Number" => _resources_number},
                "Nodes" => %{"Number" => _hosts_number}
              }
            }
          } = payload
      }) do
    RegisterCluster.new(
      cluster_id: id,
      host_id: agent_id,
      name: name,
      sid: parse_cluster_sid(payload),
      type: detect_cluster_type(payload)
    )
  end

  def handle_discovery_event(%{
        "discovery_type" => "cloud_discovery",
        "agent_id" => agent_id,
        "payload" =>
          %{
            "Provider" => "azure"
          } = payload
      }) do
    UpdateProvider.new(
      host_id: agent_id,
      provider: :azure,
      provider_data: parse_azure_data(payload)
    )
  end

  def handle_discovery_event(%{
        "discovery_type" => "cloud_discovery",
        "agent_id" => agent_id
      }) do
    UpdateProvider.new(
      host_id: agent_id,
      provider: :unknown,
      provider_data: nil
    )
  end

  def handle_discovery_event(%{
        "discovery_type" => "subscription_discovery",
        "agent_id" => agent_id,
        "payload" => payload
      }) do
    subscriptions =
      Enum.map(payload, fn subscription -> parse_subscription_data(agent_id, subscription) end)

    UpdateSlesSubscriptions.new(host_id: agent_id, subscriptions: subscriptions)
  end

  def handle_discovery_event(%{
        "discovery_type" => "sap_system_discovery",
        "agent_id" => agent_id,
        "payload" => payload
      }) do
    payload
    |> Enum.flat_map(fn sap_system -> parse_sap_system(sap_system, agent_id) end)
    |> Enum.reduce_while(
      {:ok, []},
      fn
        {:ok, command}, {:ok, commands} -> {:cont, {:ok, commands ++ [command]}}
        {:error, _}, _ = error -> {:halt, error}
      end
    )
  end

  def handle_discovery_event(_), do: {:error, :invalid_payload}

  defp is_non_loopback_ipv4?("127.0.0.1"), do: false

  defp is_non_loopback_ipv4?(ip) do
    case :inet.parse_ipv4_address(String.to_charlist(ip)) do
      {:ok, _} ->
        true

      {:error, :einval} ->
        false
    end
  end

  defp detect_cluster_type(%{"Crmmon" => %{"Clones" => clones}}) do
    has_sap_hana_topology =
      Enum.any?(clones, fn %{"Resources" => resources} ->
        Enum.any?(resources, fn %{"Agent" => agent} -> agent == "ocf::suse:SAPHanaTopology" end)
      end)

    has_sap_hana =
      Enum.any?(clones, fn %{"Resources" => resources} ->
        Enum.any?(resources, fn %{"Agent" => agent} -> agent == "ocf::suse:SAPHana" end)
      end)

    has_sap_hana_controller =
      Enum.any?(clones, fn %{"Resources" => resources} ->
        Enum.any?(resources, fn %{"Agent" => agent} -> agent == "ocf::suse:SAPHanaController" end)
      end)

    do_detect_cluster_type(has_sap_hana_topology, has_sap_hana, has_sap_hana_controller)
  end

  defp do_detect_cluster_type(true, true, _), do: :hana_scale_up
  defp do_detect_cluster_type(true, _, true), do: :hana_scale_out
  defp do_detect_cluster_type(_, _, _), do: :unknown

  defp parse_cluster_sid(%{"Cib" => %{"Configuration" => %{"Resources" => %{"Clones" => clones}}}}) do
    clones
    |> Enum.find_value([], fn
      %{"Primitive" => %{"Type" => "SAPHanaTopology", "InstanceAttributes" => attributes}} ->
        attributes

      _ ->
        nil
    end)
    |> Enum.find_value(nil, fn
      %{"Name" => "SID", "Value" => value} when value != "" ->
        value

      _ ->
        nil
    end)
  end

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

  defp parse_azure_data(%{
         "Provider" => provider,
         "Metadata" => %{
           "compute" => %{
             "name" => name,
             "resourceId" => resource_group,
             "location" => location,
             "vmSize" => vm_size,
             "storageProfile" => %{
               "dataDisks" => data_disk
             },
             "offer" => offer,
             "sku" => sku
           }
         }
       }) do
    AzureProvider.new!(
      provider: provider,
      vm_name: name,
      resource_group: resource_group,
      location: location,
      vm_size: vm_size,
      data_disk_number: length(data_disk),
      offer: offer,
      sku: sku
    )
  end

  defp parse_sap_system(
         %{
           "Type" => @database_type,
           "Id" => id,
           "SID" => sid,
           "Databases" => databases,
           "Instances" => instances
         },
         host_id
       ) do
    Enum.flat_map(databases, fn %{"Database" => tenant} ->
      Enum.map(
        instances,
        fn {_, instance} ->
          instance_number = parse_instance_number(instance)

          RegisterDatabaseInstance.new(
            sap_system_id: UUID.uuid5(nil, "#{id}:#{tenant}"),
            sid: sid,
            tenant: tenant,
            host_id: host_id,
            instance_number: instance_number,
            features: parse_features(instance_number, instance)
          )
        end
      )
    end)
  end

  defp parse_sap_system(
         %{
           "Type" => @application_type,
           "SID" => sid,
           "Instances" => instances,
           "Profile" => %{
             "dbs/hdb/dbname" => tenant,
             "SAPDBHOST" => db_host
           }
         },
         host_id
       ) do
    Enum.map(instances, fn {_, instance} ->
      instance_number = parse_instance_number(instance)

      RegisterApplicationInstance.new(
        sid: sid,
        tenant: tenant,
        db_host: db_host,
        instance_number: instance_number,
        features: parse_features(instance_number, instance),
        host_id: host_id
      )
    end)
  end

  defp parse_features(instance_number, %{"SAPControl" => %{"Instances" => instances}}) do
    instances
    |> Map.values()
    |> Enum.find(fn %{"instanceNr" => number} ->
      number
      |> Integer.to_string()
      |> String.pad_leading(2, "0") == instance_number
    end)
    |> case do
      %{"features" => features} ->
        features

      _ ->
        []
    end
  end

  defp parse_instance_number(%{
         "SAPControl" => %{"Properties" => %{"SAPSYSTEM" => %{"value" => instance_number}}}
       }),
       do: instance_number
end
