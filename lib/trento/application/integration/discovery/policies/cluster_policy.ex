defmodule Trento.Integration.Discovery.ClusterPolicy do
  @moduledoc """
  This module contains functions to transform cluster related integration events into commands.
  """

  require Trento.Domain.Enums.Provider, as: Provider
  require Trento.Domain.Enums.ClusterType, as: ClusterType

  alias Trento.{
    Domain.Commands.RegisterClusterHost,
    Integration.Discovery.ClusterDiscoveryPayload
  }

  @uuid_namespace Application.compile_env!(:trento, :uuid_namespace)

  def handle(%{
        "discovery_type" => "ha_cluster_discovery",
        "agent_id" => agent_id,
        "payload" => payload
      }) do
    payload
    |> ProperCase.to_snake_case()
    |> ClusterDiscoveryPayload.new()
    |> case do
      {:ok, decoded_payload} -> build_register_cluster_host_command(agent_id, decoded_payload)
      error -> error
    end
  end

  defp build_register_cluster_host_command(
         agent_id,
         %ClusterDiscoveryPayload{
           id: id,
           name: name,
           dc: designated_controller,
           provider: provider,
           cluster_type: cluster_type,
           sid: sid
         } = payload
       ) do
    cluster_details = parse_cluster_details(payload)

    RegisterClusterHost.new(%{
      cluster_id: generate_cluster_id(id),
      host_id: agent_id,
      name: name,
      sid: sid,
      type: cluster_type,
      designated_controller: designated_controller,
      resources_number: parse_resources_number(payload),
      hosts_number: parse_hosts_number(payload),
      details: cluster_details,
      discovered_health: parse_cluster_health(cluster_details, cluster_type),
      cib_last_written: parse_cib_last_written(payload),
      provider: provider
    })
  end

  defp parse_resources_number(%{
         crmmon: %{summary: %{resources: %{number: resources_number}}}
       }),
       do: resources_number

  defp parse_hosts_number(%{
         crmmon: %{summary: %{nodes: %{number: nodes_number}}}
       }),
       do: nodes_number

  defp parse_cluster_details(
         %{crmmon: crmmon, sbd: sbd, cluster_type: cluster_type, sid: sid} = payload
       )
       when cluster_type in [ClusterType.hana_scale_up(), ClusterType.hana_scale_out()] do
    nodes = parse_cluster_nodes(payload, sid)

    %{
      system_replication_mode: parse_system_replication_mode(nodes, sid),
      system_replication_operation_mode: parse_system_replication_operation_mode(nodes, sid),
      secondary_sync_state: parse_secondary_sync_state(nodes, sid),
      sr_health_state: parse_hana_sr_health_state(nodes, sid),
      fencing_type: parse_cluster_fencing_type(crmmon),
      stopped_resources: parse_cluster_stopped_resources(crmmon),
      nodes: nodes,
      sbd_devices: parse_sbd_devices(sbd)
    }
  end

  defp parse_cluster_details(_) do
    nil
  end

  defp parse_cluster_nodes(
         %{
           provider: provider,
           cib: %{
             configuration: %{
               resources: resources
             }
           },
           crmmon:
             %{
               node_attributes: %{
                 nodes: nodes
               }
             } = crmmon
         },
         sid
       ) do
    Enum.map(nodes, fn %{name: name, attributes: attributes} ->
      attributes =
        Enum.reduce(attributes, %{}, fn %{name: name, value: value}, acc ->
          Map.put(acc, name, value)
        end)

      node_resources = parse_node_resources(name, crmmon)

      virtual_ip =
        resources
        |> extract_cluster_primitives_from_cib
        |> parse_virtual_ip(node_resources, provider)

      node = %{
        name: name,
        attributes: attributes,
        resources: node_resources,
        site: Map.get(attributes, "hana_#{String.downcase(sid)}_site", ""),
        hana_status: "Unknown",
        virtual_ip: virtual_ip
      }

      %{node | hana_status: parse_hana_status(node, sid)}
    end)
  end

  defp parse_system_replication_mode([%{attributes: attributes} | _], sid) do
    Map.get(attributes, "hana_#{String.downcase(sid)}_srmode", "")
  end

  defp parse_system_replication_operation_mode(
         [%{attributes: attributes} | _],
         sid
       ) do
    Map.get(attributes, "hana_#{String.downcase(sid)}_op_mode", "")
  end

  # parse_secondary_sync_state returns the secondary sync state of the HANA cluster
  defp parse_secondary_sync_state(nodes, sid) do
    nodes
    |> Enum.find_value(fn %{attributes: attributes} = node ->
      case parse_hana_status(node, sid) do
        status when status in ["Secondary", "Failed"] ->
          Map.get(attributes, "hana_#{String.downcase(sid)}_sync_state")

        _ ->
          nil
      end
    end)
    |> case do
      nil -> "Unknown"
      sync_state -> sync_state
    end
  end

  # parse_hana_sr_health_state returns the secondary sync state of the HANA cluster
  defp parse_hana_sr_health_state(nodes, sid) do
    nodes
    |> Enum.find_value(fn %{attributes: attributes} = node ->
      case parse_hana_status(node, sid) do
        status when status in ["Secondary", "Failed"] ->
          attributes
          |> Map.get("hana_#{String.downcase(sid)}_roles")
          |> String.split(":")
          |> Enum.at(0)

        _ ->
          nil
      end
    end)
    |> case do
      nil -> "Unknown"
      sync_state -> sync_state
    end
  end

  defp parse_cluster_fencing_type(%{resources: resources}) do
    Enum.find_value(resources, "", fn
      %{agent: "stonith:" <> fencing_type} ->
        fencing_type

      _ ->
        false
    end)
  end

  defp parse_cluster_stopped_resources(crmmon) do
    crmmon
    |> extract_cluster_resources()
    |> Enum.filter(fn
      %{nodes_running_on: 0, active: false} ->
        true

      _ ->
        false
    end)
    |> Enum.map(fn %{id: id, agent: type, role: role} ->
      %{id: id, type: type, role: role}
    end)
  end

  defp parse_sbd_devices(%{devices: devices}) do
    Enum.map(devices, fn %{device: device, status: status} ->
      %{
        device: device,
        status: status
      }
    end)
  end

  defp parse_node_resources(node_name, crmmon) do
    crmmon
    |> extract_cluster_resources()
    |> Enum.filter(fn
      %{node: %{name: ^node_name}} ->
        true

      _ ->
        false
    end)
    |> Enum.map(fn %{id: id, agent: type, role: role} = resource ->
      %{
        id: id,
        type: type,
        role: role,
        status: parse_resource_status(resource),
        fail_count: parse_fail_count(node_name, id, crmmon)
      }
    end)
  end

  defp extract_cluster_primitives_from_cib(%{
         primitives: primitives,
         groups: groups,
         clones: clones
       }) do
    Enum.concat(
      primitives,
      Enum.flat_map(clones, &Map.get(&1, :primitives, [])) ++
        Enum.flat_map(groups, &Map.get(&1, :primitives, []))
    )
  end

  defp parse_virtual_ip(primitives, node_resources, provider) do
    virtual_ip_type_suffix = get_virtual_ip_type_suffix_by_provider(provider)

    virtual_ip_resource_id =
      Enum.find_value(node_resources, nil, fn %{type: virtual_ip_type, id: id} ->
        if String.ends_with?(virtual_ip_type, virtual_ip_type_suffix), do: id
      end)

    primitives
    |> Enum.find_value([], fn
      %{
        type: virtual_ip_type,
        id: ^virtual_ip_resource_id,
        instance_attributes: attributes
      } ->
        if String.ends_with?(virtual_ip_type, virtual_ip_type_suffix), do: attributes

      _ ->
        nil
    end)
    |> Enum.find_value(nil, fn
      %{name: "ip", value: value} when value != "" ->
        value

      _ ->
        nil
    end)
  end

  # parses the hana_<SID>_roles and hana_<SID>_sync_state strings and returns the SAPHanaSR Health state
  # Possible values: Primary, Secondary, Failed, Unknown
  # e.g. 4:P:master1:master:worker:master returns Primary (second element)
  # e.g. PRIM
  defp parse_hana_status(%{attributes: attributes}, sid) do
    status =
      case Map.get(attributes, "hana_#{String.downcase(sid)}_roles") do
        nil ->
          nil

        status ->
          status |> String.split(":") |> Enum.at(1)
      end

    sync_state = Map.get(attributes, "hana_#{String.downcase(sid)}_sync_state")
    do_parse_hana_status(status, sync_state)
  end

  defp extract_cluster_resources(%{
         resources: resources,
         groups: groups,
         clones: clones
       }) do
    Enum.concat(
      resources,
      Enum.flat_map(clones, &Map.get(&1, :resources, [])) ++
        Enum.flat_map(groups, &Map.get(&1, :resources, []))
    )
  end

  defp parse_resource_status(%{active: true}), do: "Active"
  defp parse_resource_status(%{blocked: true}), do: "Blocked"
  defp parse_resource_status(%{failed: true}), do: "Failed"
  defp parse_resource_status(%{failure_ignored: true}), do: "FailureIgnored"
  defp parse_resource_status(%{orphaned: true}), do: "Orphaned"
  defp parse_resource_status(_), do: ""

  defp parse_fail_count(node_name, resource_id, %{
         node_history: %{
           nodes: nodes
         }
       }) do
    nodes
    |> Enum.find_value([], fn
      %{name: ^node_name, resource_history: resource_history} ->
        resource_history

      _ ->
        false
    end)
    |> Enum.find_value(nil, fn
      %{name: ^resource_id, fail_count: fail_count} ->
        fail_count

      _ ->
        false
    end)
  end

  defp get_virtual_ip_type_suffix_by_provider(Provider.azure()), do: "IPaddr2"
  defp get_virtual_ip_type_suffix_by_provider(Provider.aws()), do: "aws-vpc-move-ip"
  defp get_virtual_ip_type_suffix_by_provider(Provider.gcp()), do: "IPaddr2"
  defp get_virtual_ip_type_suffix_by_provider(_), do: "IPaddr2"

  defp do_parse_hana_status(nil, _), do: "Unknown"
  defp do_parse_hana_status(_, nil), do: "Unknown"
  # Normal primary state
  defp do_parse_hana_status("P", "PRIM"), do: "Primary"
  # This happens when there is an initial failover
  defp do_parse_hana_status("P", _), do: "Failed"
  # Normal secondary state
  defp do_parse_hana_status("S", "SOK"), do: "Secondary"
  # Abnormal secondary state
  defp do_parse_hana_status("S", _), do: "Failed"
  defp do_parse_hana_status(_, _), do: "Unknown"

  defp parse_cib_last_written(%{
         crmmon: %{summary: %{last_change: %{time: cib_last_written}}}
       }),
       do: cib_last_written

  defp generate_cluster_id(id), do: UUID.uuid5(@uuid_namespace, id)

  defp parse_cluster_health(details, cluster_type)
       when cluster_type in [ClusterType.hana_scale_up(), ClusterType.hana_scale_out()],
       do: parse_hana_cluster_health(details)

  defp parse_cluster_health(_, _), do: :unknown

  # Passing state if SR Health state is 4 and Sync state is SOK, everything else is critical
  # If data is not present for some reason the state goes to unknown
  defp parse_hana_cluster_health(%{sr_health_state: "4", secondary_sync_state: "SOK"}),
    do: :passing

  defp parse_hana_cluster_health(%{sr_health_state: "", secondary_sync_state: ""}),
    do: :unknown

  defp parse_hana_cluster_health(%{sr_health_state: _, secondary_sync_state: _}),
    do: :critical
end
