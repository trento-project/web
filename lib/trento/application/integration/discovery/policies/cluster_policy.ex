defmodule Trento.Integration.Discovery.ClusterPolicy do
  @moduledoc """
  This module contains functions to trasnform cluster related integration events into commands.
  """

  alias Trento.Domain.Commands.RegisterClusterHost

  @uuid_namespace Application.compile_env!(:trento, :uuid_namespace)

  def handle(%{
        "discovery_type" => "ha_cluster_discovery",
        "agent_id" => agent_id,
        "payload" =>
          %{
            "Id" => id,
            "Name" => name,
            "DC" => designated_controller,
            "Crmmon" => %{
              "Summary" => %{
                "LastChange" => %{"Time" => cib_last_written},
                "Resources" => %{"Number" => _resources_number},
                "Nodes" => %{"Number" => _hosts_number}
              }
            }
          } = payload
      }) do
    cluster_type = detect_cluster_type(payload)
    sid = parse_cluster_sid(payload)
    details = parse_cluster_details(payload, cluster_type, sid)

    RegisterClusterHost.new(%{
      cluster_id: UUID.uuid5(@uuid_namespace, id),
      host_id: agent_id,
      name: name,
      sid: sid,
      type: cluster_type,
      designated_controller: designated_controller,
      details: details,
      discovered_health: parse_cluster_health(details, cluster_type),
      cib_last_written: cib_last_written
    })
  end

  defp detect_cluster_type(%{"Crmmon" => %{"Clones" => nil}}), do: :unknown

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

  defp parse_cluster_sid(%{"Cib" => %{"Configuration" => %{"Resources" => %{"Clones" => nil}}}}),
    do: nil

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

  defp parse_cluster_details(
         %{"Crmmon" => crmmon, "SBD" => sbd} = payload,
         cluster_type,
         sid
       )
       when cluster_type in [:hana_scale_up, :hana_scale_out] do
    nodes = parse_cluster_nodes(payload, sid)

    %{
      "system_replication_mode" => parse_system_replication_mode(nodes, sid),
      "system_replication_operation_mode" => parse_system_replication_operation_mode(nodes, sid),
      "secondary_sync_state" => parse_secondary_sync_state(nodes, sid),
      "sr_health_state" => parse_hana_sr_health_state(nodes, sid),
      "fencing_type" => parse_cluster_fencing_type(crmmon),
      "stopped_resources" => parse_cluster_stopped_resources(crmmon),
      "nodes" => nodes,
      "sbd_devices" => parse_sbd_devices(sbd)
    }
  end

  defp parse_cluster_details(_, _, _), do: nil

  defp parse_cluster_nodes(
         %{
           "Crmmon" =>
             %{
               "NodeAttributes" => %{
                 "Nodes" => nodes
               }
             } = crmmon
         },
         sid
       ) do
    Enum.map(nodes, fn %{"Name" => name, "Attributes" => attributes} ->
      attributes =
        Enum.reduce(attributes, %{}, fn %{"Name" => name, "Value" => value}, acc ->
          Map.put(acc, name, value)
        end)

      node = %{
        name: name,
        attributes: attributes,
        resources: parse_node_resources(name, crmmon),
        site: Map.get(attributes, "hana_#{String.downcase(sid)}_site", ""),
        hana_status: "Unknown"
      }

      %{node | hana_status: parse_hana_status(node, sid)}
    end)
  end

  defp parse_node_resources(node_name, crmmon) do
    crmmon
    |> extract_cluster_resources()
    |> Enum.filter(fn
      %{"Node" => %{"Name" => ^node_name}} ->
        true

      _ ->
        false
    end)
    |> Enum.map(fn %{"Id" => id, "Agent" => type, "Role" => role} = resource ->
      %{
        id: id,
        type: type,
        role: role,
        status: parse_resource_status(resource),
        fail_count: parse_fail_count(node_name, id, crmmon)
      }
    end)
  end

  defp parse_system_replication_mode([%{attributes: attributes} | _], sid) do
    Map.get(attributes, "hana_#{String.downcase(sid)}_srmode", "")
  end

  defp parse_system_replication_mode(_, _), do: ""

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

  defp do_parse_hana_status(nil, _), do: "Unknown"
  defp do_parse_hana_status(_, nil), do: "Unknown"
  # Noraml primary state
  defp do_parse_hana_status("P", "PRIM"), do: "Primary"
  # This happens when there is an initial failover
  defp do_parse_hana_status("P", _), do: "Failed"
  # Normal secondary state
  defp do_parse_hana_status("S", "SOK"), do: "Secondary"
  # Abnormal secondary state
  defp do_parse_hana_status("S", _), do: "Failed"
  defp do_parse_hana_status(_, _), do: "Unknown"

  defp parse_cluster_fencing_type(%{"Resources" => resources}) do
    Enum.find_value(resources, "", fn
      %{"Agent" => "stonith:" <> fencing_type} ->
        fencing_type

      _ ->
        false
    end)
  end

  defp extract_cluster_resources(%{
         "Resources" => resources,
         "Groups" => groups,
         "Clones" => clones
       }) do
    resources ++
      Enum.flat_map(clones, &Map.get(&1, "Resources", [])) ++
      Enum.flat_map(groups, &Map.get(&1, "Resources", []))
  end

  defp parse_fail_count(node_name, resource_id, %{
         "NodeHistory" => %{
           "Nodes" => nodes
         }
       }) do
    nodes
    |> Enum.find_value([], fn
      %{"Name" => ^node_name, "ResourceHistory" => resource_history} ->
        resource_history

      _ ->
        false
    end)
    |> Enum.find_value(nil, fn
      %{"Name" => ^resource_id, "FailCount" => fail_count} ->
        fail_count

      _ ->
        false
    end)
  end

  defp parse_resource_status(%{"Active" => true}), do: "Active"
  defp parse_resource_status(%{"Blocked" => true}), do: "Blocked"
  defp parse_resource_status(%{"Failed" => true}), do: "Failed"
  defp parse_resource_status(%{"FailureIgnored" => true}), do: "FailureIgnored"
  defp parse_resource_status(%{"Orphaned" => true}), do: "Orphaned"
  defp parse_resource_status(_), do: ""

  defp parse_cluster_stopped_resources(crmmon) do
    crmmon
    |> extract_cluster_resources()
    |> Enum.filter(fn
      %{"NodesRunningOn" => 0, "Active" => false} ->
        true

      _ ->
        false
    end)
    |> Enum.map(fn %{"Id" => id, "Agent" => type, "Role" => role} ->
      %{id: id, type: type, role: role}
    end)
  end

  defp parse_sbd_devices(%{"Devices" => devices}) do
    Enum.map(devices, fn %{"Device" => device, "Status" => status} ->
      %{
        device: device,
        status: status
      }
    end)
  end

  defp parse_cluster_health(details, cluster_type)
       when cluster_type in [:hana_scale_up, :hana_scale_out],
       do: parse_hana_cluster_health(details)

  defp parse_cluster_health(_, _), do: :unknown

  # Passing state if SR Health state is 4 and Sync state is SOK, everything else is critical
  # If data is not present for some reason the state goes to unknown
  defp parse_hana_cluster_health(%{"sr_health_state" => "4", "secondary_sync_state" => "SOK"}),
    do: :passing

  defp parse_hana_cluster_health(%{"sr_health_state" => "", "secondary_sync_state" => ""}),
    do: :unknown

  defp parse_hana_cluster_health(%{"sr_health_state" => _, "secondary_sync_state" => _}),
    do: :critical
end
