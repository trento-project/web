defmodule Trento.Discovery.Policies.ClusterPolicy do
  @moduledoc """
  This module contains functions to transform cluster related integration events into commands.
  """

  require Trento.Enums.Provider, as: Provider
  require Trento.Clusters.Enums.ClusterType, as: ClusterType
  require Trento.Clusters.Enums.HanaArchitectureType, as: HanaArchitectureType
  require Trento.Enums.Health, as: Health
  require Trento.Clusters.Enums.AscsErsClusterRole, as: AscsErsClusterRole
  require Trento.Clusters.Enums.HanaScenario, as: HanaScenario
  require Trento.Clusters.Enums.SapInstanceResourceType, as: SapInstanceResourceType

  alias Trento.Clusters.Commands.{
    DeregisterClusterHost,
    RegisterClusterHost
  }

  alias Trento.Discovery.Payloads.Cluster.ClusterDiscoveryPayload

  alias Trento.Discovery.Payloads.Cluster.CrmmonDiscoveryPayload.{
    CrmmonClone,
    CrmmonGroup,
    CrmmonResource
  }

  alias Trento.Clusters.ValueObjects.SapInstance

  @uuid_namespace Application.compile_env!(:trento, :uuid_namespace)

  # If hana_<sid>_glob_srmode or hana_<sid>_glob_op_mode attributes are not present
  # for scale out clusters the default value is being used by the resource agent
  @default_hana_scale_out_replication_mode "sync"
  @default_hana_scale_out_operation_mode "logreplay"
  @default_maintenance_mode "false"
  @unknown_fencing_type "Unknown"
  @diskless_sbd_fencing_type "Diskless SBD"

  def handle(
        %{
          "discovery_type" => "ha_cluster_discovery",
          "agent_id" => agent_id,
          "payload" => nil
        },
        current_cluster_id
      ) do
    {:ok,
     Enum.reject(
       [
         build_deregister_cluster_host_command(agent_id, nil, current_cluster_id)
       ],
       &is_nil/1
     )}
  end

  def handle(
        %{
          "discovery_type" => "ha_cluster_discovery",
          "agent_id" => agent_id,
          "payload" => payload
        },
        current_cluster_id
      ) do
    with {:ok, %ClusterDiscoveryPayload{id: cluster_id} = decoded_payload} <-
           payload
           |> ProperCase.to_snake_case()
           |> ClusterDiscoveryPayload.new(),
         {:ok, register_cluster_host_command} <-
           build_register_cluster_host_command(agent_id, decoded_payload) do
      {:ok,
       Enum.reject(
         [
           build_deregister_cluster_host_command(agent_id, cluster_id, current_cluster_id),
           register_cluster_host_command
         ],
         &is_nil/1
       )}
    end
  end

  defp build_deregister_cluster_host_command(_, _, nil),
    do: nil

  defp build_deregister_cluster_host_command(agent_id, cluster_id, current_cluster_id) do
    if generate_cluster_id(cluster_id) != current_cluster_id do
      DeregisterClusterHost.new!(%{
        host_id: agent_id,
        cluster_id: current_cluster_id,
        deregistered_at: DateTime.utc_now()
      })
    end
  end

  defp build_register_cluster_host_command(
         agent_id,
         %ClusterDiscoveryPayload{
           id: id,
           name: name,
           dc: designated_controller,
           provider: provider,
           cluster_type: cluster_type
         } = payload
       ) do
    sap_instances = get_sap_instances(payload)
    cluster_details = parse_cluster_details(payload, sap_instances)

    RegisterClusterHost.new(%{
      cluster_id: generate_cluster_id(id),
      host_id: agent_id,
      name: name,
      sap_instances: sap_instances,
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

  defp get_sap_instances(%{
         cib: %{configuration: %{resources: resources}}
       }) do
    all_primitives = extract_cluster_primitives_from_cib(resources)

    hana_instance_sids = parse_resource_by_type(all_primitives, "SAPHanaTopology", "SID")

    hana_instances =
      all_primitives
      |> parse_resource_by_type("SAPHanaTopology", "InstanceNumber")
      |> Enum.zip_with(hana_instance_sids, fn instance_number, sid ->
        %{
          name: "HDB#{instance_number}",
          sid: sid,
          instance_number: instance_number,
          resource_type: SapInstanceResourceType.sap_hana_topology()
        }
      end)

    sap_instances =
      all_primitives
      |> parse_resource_by_type("SAPInstance", "InstanceName")
      |> Enum.map(fn intstance_name ->
        instance_data = String.split(intstance_name, "_")
        instance_name = Enum.at(instance_data, 1)

        %{
          name: instance_name,
          sid: Enum.at(instance_data, 0),
          instance_number: String.slice(instance_name, -2, 2),
          hostname: Enum.at(instance_data, 2),
          resource_type: SapInstanceResourceType.sap_instance()
        }
      end)

    Enum.concat(hana_instances, sap_instances)
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
         %{
           crmmon: crmmon,
           sbd: sbd,
           cluster_type: ClusterType.hana_scale_up(),
           hana_architecture_type: HanaArchitectureType.classic(),
           cib: cib
         } = payload,
         sap_instances
       ) do
    hana_sid = SapInstance.get_hana_instance_sid(sap_instances)
    sap_instance_sids = SapInstance.get_sap_instance_sids(sap_instances)
    nodes = parse_cluster_nodes(payload, hana_sid)

    %{
      architecture_type: HanaArchitectureType.classic(),
      hana_scenario: parse_hana_scenario(sap_instance_sids),
      system_replication_mode: parse_hana_scale_up_system_replication_mode(nodes, hana_sid),
      system_replication_operation_mode:
        parse_hana_scale_up_system_replication_operation_mode(nodes, hana_sid),
      secondary_sync_state: parse_hana_scale_up_secondary_sync_state(nodes, hana_sid),
      sr_health_state: parse_hana_scale_up_sr_health_state(nodes, hana_sid),
      fencing_type: parse_cluster_fencing_type(crmmon, sbd),
      maintenance_mode: parse_maintenance_mode(cib),
      stopped_resources: parse_cluster_stopped_resources(crmmon),
      nodes: nodes,
      sbd_devices: parse_sbd_devices(sbd),
      sites: parse_hana_scale_up_sites(nodes, hana_sid)
    }
  end

  defp parse_cluster_details(
         %{
           crmmon: crmmon,
           cib: cib,
           sbd: sbd,
           cluster_type: ClusterType.hana_scale_out(),
           hana_architecture_type: HanaArchitectureType.classic()
         } = payload,
         sap_instances
       ) do
    hana_sid = SapInstance.get_hana_instance_sid(sap_instances)
    sap_instance_sids = SapInstance.get_sap_instance_sids(sap_instances)

    %{
      architecture_type: HanaArchitectureType.classic(),
      hana_scenario: parse_hana_scenario(sap_instance_sids),
      system_replication_mode: parse_hana_scale_out_system_replication_mode(cib, hana_sid),
      system_replication_operation_mode:
        parse_hana_scale_out_system_replication_operation_mode(cib, hana_sid),
      secondary_sync_state: parse_hana_scale_out_secondary_sync_state(cib, hana_sid),
      sr_health_state: parse_hana_scale_out_sr_health_state(cib, hana_sid),
      fencing_type: parse_cluster_fencing_type(crmmon, sbd),
      maintenance_mode: parse_maintenance_mode(cib),
      stopped_resources: parse_cluster_stopped_resources(crmmon),
      nodes: parse_cluster_nodes(payload, hana_sid),
      sbd_devices: parse_sbd_devices(sbd),
      sites: parse_hana_scale_out_sites(HanaArchitectureType.classic(), cib, hana_sid)
    }
  end

  # angi architecture follows a really similar configuration to the scale out one.
  # That's why some functions are shared with classic scale out setup
  defp parse_cluster_details(
         %{
           crmmon: crmmon,
           cib: cib,
           sbd: sbd,
           hana_architecture_type: HanaArchitectureType.angi()
         } = payload,
         sap_instances
       ) do
    hana_sid = SapInstance.get_hana_instance_sid(sap_instances)
    sap_instance_sids = SapInstance.get_sap_instance_sids(sap_instances)

    %{
      architecture_type: HanaArchitectureType.angi(),
      hana_scenario: parse_hana_scenario(sap_instance_sids),
      system_replication_mode: parse_hana_angi_system_replication_mode(cib, hana_sid),
      system_replication_operation_mode:
        parse_hana_angi_system_replication_operation_mode(cib, hana_sid),
      secondary_sync_state: parse_hana_angi_secondary_sync_state(cib, hana_sid),
      sr_health_state: parse_hana_scale_out_sr_health_state(cib, hana_sid),
      fencing_type: parse_cluster_fencing_type(crmmon, sbd),
      maintenance_mode: parse_maintenance_mode(cib),
      stopped_resources: parse_cluster_stopped_resources(crmmon),
      nodes: parse_cluster_nodes(payload, hana_sid),
      sbd_devices: parse_sbd_devices(sbd),
      sites: parse_hana_scale_out_sites(HanaArchitectureType.angi(), cib, hana_sid)
    }
  end

  defp parse_cluster_details(
         %{
           crmmon: crmmon,
           sbd: sbd,
           cluster_type: ClusterType.ascs_ers(),
           cib: cib
         } = payload,
         sap_instances
       ) do
    sap_instance_sids = SapInstance.get_sap_instance_sids(sap_instances)

    %{
      sap_systems: Enum.map(sap_instance_sids, &parse_ascs_ers_cluster_sap_system(payload, &1)),
      fencing_type: parse_cluster_fencing_type(crmmon, sbd),
      stopped_resources: parse_cluster_stopped_resources(crmmon),
      sbd_devices: parse_sbd_devices(sbd),
      maintenance_mode: parse_maintenance_mode(cib)
    }
  end

  defp parse_cluster_details(_, _) do
    nil
  end

  defp parse_cluster_nodes(
         %{
           provider: provider,
           cluster_type: cluster_type,
           hana_architecture_type: hana_architecture_type,
           cib: %{
             configuration: %{
               resources: resources,
               crm_config: %{cluster_properties: cluster_properties}
             }
           },
           crmmon:
             %{
               nodes: nodes,
               node_attributes: %{
                 nodes: nodes_with_attributes
               }
             } = crmmon
         },
         sid
       ) do
    Enum.map(nodes, fn %{name: name} = node ->
      attributes =
        nodes_with_attributes
        |> Enum.find_value([], fn
          %{name: ^name, attributes: attributes} -> attributes
          _ -> nil
        end)
        |> Enum.into(%{}, fn %{name: name, value: value} ->
          {name, value}
        end)

      node_resources = parse_node_resources(name, crmmon)

      virtual_ip =
        resources
        |> extract_cluster_primitives_from_cib
        |> parse_virtual_ip(node_resources, provider)

      site = Map.get(attributes, "hana_#{String.downcase(sid)}_site", "")

      %{
        indexserver_actual_role: indexserver_actual_role,
        nameserver_actual_role: nameserver_actual_role
      } =
        attributes
        |> Map.get("hana_#{String.downcase(sid)}_roles", "")
        |> String.split(":")
        |> parse_nodes_actual_roles(cluster_type, hana_architecture_type)

      node = %{
        name: name,
        attributes: attributes,
        resources: node_resources,
        site: site,
        hana_status: "Unknown",
        virtual_ip: virtual_ip,
        nameserver_actual_role: nameserver_actual_role,
        indexserver_actual_role: indexserver_actual_role,
        status: parse_node_status(node)
      }

      hana_status =
        case [cluster_type, hana_architecture_type] do
          [ClusterType.hana_scale_up(), HanaArchitectureType.classic()] ->
            parse_hana_scale_up_status(node, sid)

          [_, _] ->
            parse_hana_scale_out_status(hana_architecture_type, cluster_properties, site, sid)
        end

      %{node | hana_status: hana_status}
    end)
  end

  # parse_nodes_actual_roles parses each node roles depending on the cluster and architecture type
  # 1st param is the roles array, 2nd param is the cluster type and the 3rd the hana architecture
  # In classic scale out, the roles string has 6 values: 4:P:master1:master:worker:master
  # In scale out and angi architecture, the roles have only 4 values: "master1:master:worker:master"
  defp parse_nodes_actual_roles(
         [_, _, _, nameserver_actual_role, _, indexserver_actual_role],
         ClusterType.hana_scale_up(),
         HanaArchitectureType.classic()
       ) do
    %{
      indexserver_actual_role: indexserver_actual_role,
      nameserver_actual_role: nameserver_actual_role
    }
  end

  defp parse_nodes_actual_roles(
         [_, nameserver_actual_role, _, indexserver_actual_role],
         _,
         _
       ) do
    %{
      indexserver_actual_role: indexserver_actual_role,
      nameserver_actual_role: nameserver_actual_role
    }
  end

  defp parse_nodes_actual_roles(_, _, _) do
    %{indexserver_actual_role: "", nameserver_actual_role: ""}
  end

  defp parse_node_status(%{online: false}), do: "Offline"
  defp parse_node_status(%{unclean: true}), do: "Unclean"
  defp parse_node_status(%{standby: true}), do: "Standby"
  defp parse_node_status(%{maintenance: true}), do: "Maintenance"
  defp parse_node_status(%{shutdown: true}), do: "Shutdown"
  defp parse_node_status(%{pending: true}), do: "Pending"
  defp parse_node_status(%{standby_on_fail: true}), do: "Standby on fail"
  defp parse_node_status(%{online: true}), do: "Online"
  defp parse_node_status(_), do: "Unknown"

  defp parse_hana_scale_up_system_replication_mode([%{attributes: attributes} | _], sid) do
    Map.get(attributes, "hana_#{String.downcase(sid)}_srmode", "")
  end

  defp parse_hana_scale_up_system_replication_operation_mode(
         [%{attributes: attributes} | _],
         sid
       ) do
    Map.get(attributes, "hana_#{String.downcase(sid)}_op_mode", "")
  end

  defp parse_hana_scale_out_system_replication_mode(
         %{configuration: %{crm_config: %{cluster_properties: cluster_properties}}},
         sid
       ) do
    parse_crm_cluster_property(
      cluster_properties,
      "hana_#{String.downcase(sid)}_glob_srmode",
      @default_hana_scale_out_replication_mode
    )
  end

  defp parse_hana_angi_system_replication_mode(
         %{configuration: %{crm_config: %{cluster_properties: cluster_properties}}},
         sid
       ) do
    primary_site = get_primary_site(cluster_properties, sid)

    parse_crm_cluster_property(
      cluster_properties,
      "hana_#{String.downcase(sid)}_site_srMode_#{primary_site}",
      @default_hana_scale_out_replication_mode
    )
  end

  defp parse_hana_scale_out_system_replication_operation_mode(
         %{configuration: %{crm_config: %{cluster_properties: cluster_properties}}},
         sid
       ) do
    parse_crm_cluster_property(
      cluster_properties,
      "hana_#{String.downcase(sid)}_glob_op_mode",
      @default_hana_scale_out_operation_mode
    )
  end

  defp parse_hana_angi_system_replication_operation_mode(
         %{configuration: %{crm_config: %{cluster_properties: cluster_properties}}},
         sid
       ) do
    primary_site = get_primary_site(cluster_properties, sid)

    parse_crm_cluster_property(
      cluster_properties,
      "hana_#{String.downcase(sid)}_site_opMode_#{primary_site}",
      @default_hana_scale_out_operation_mode
    )
  end

  # parse_hana_scale_up_secondary_sync_state returns the secondary sync state of the HANA scale up cluster
  defp parse_hana_scale_up_secondary_sync_state(nodes, sid) do
    nodes
    |> Enum.find_value(fn %{attributes: attributes} = node ->
      case parse_hana_scale_up_status(node, sid) do
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

  # parse_hana_scale_up_secondary_sync_state returns the secondary sync state of the HANA scale out cluster
  defp parse_hana_scale_out_secondary_sync_state(
         %{configuration: %{crm_config: %{cluster_properties: cluster_properties}}},
         sid
       ) do
    parse_crm_cluster_property(
      cluster_properties,
      "hana_#{String.downcase(sid)}_glob_sync_state",
      "Unknown"
    )
  end

  defp parse_hana_angi_secondary_sync_state(
         %{configuration: %{crm_config: %{cluster_properties: cluster_properties}}},
         sid
       ) do
    secondary_site = get_secondary_site(cluster_properties, sid)

    parse_crm_cluster_property(
      cluster_properties,
      "hana_#{String.downcase(sid)}_site_srPoll_#{secondary_site}",
      "Unknown"
    )
  end

  defp parse_hana_scale_up_sites(nodes, sid) do
    nodes
    |> Enum.filter(fn %{site: site} -> site != "" end)
    |> Enum.map(fn %{site: site, hana_status: hana_status, attributes: attributes} ->
      %{
        name: site,
        state: hana_status,
        sr_health_state:
          attributes
          |> Map.get("hana_#{String.downcase(sid)}_roles")
          |> String.split(":")
          |> Enum.at(0)
      }
    end)
  end

  defp parse_hana_scale_out_sites(
         architecture_type,
         %{
           configuration: %{crm_config: %{cluster_properties: cluster_properties}}
         },
         sid
       ) do
    primary_site = get_primary_site(cluster_properties, sid)
    secondary_site = get_secondary_site(cluster_properties, sid)

    [
      %{
        name: primary_site,
        state:
          parse_hana_scale_out_status(architecture_type, cluster_properties, primary_site, sid),
        sr_health_state:
          parse_crm_cluster_property(
            cluster_properties,
            "hana_#{String.downcase(sid)}_site_lss_#{primary_site}",
            "Unknown"
          )
      },
      %{
        name: secondary_site,
        state:
          parse_hana_scale_out_status(
            architecture_type,
            cluster_properties,
            secondary_site,
            sid
          ),
        sr_health_state:
          parse_crm_cluster_property(
            cluster_properties,
            "hana_#{String.downcase(sid)}_site_lss_#{secondary_site}",
            "Unknown"
          )
      }
    ]
  end

  defp parse_maintenance_mode(%{
         configuration: %{crm_config: %{cluster_properties: cluster_properties}}
       }) do
    cluster_properties
    |> parse_crm_cluster_property(
      "maintenance-mode",
      @default_maintenance_mode
    )
    |> maintenance_mode_enabled?()
  end

  defp maintenance_mode_enabled?("true"), do: true
  defp maintenance_mode_enabled?(_), do: false

  # parse_hana_scale_up_sr_health_state returns the secondary sync state of the HANA scale up cluster
  defp parse_hana_scale_up_sr_health_state(nodes, sid) do
    nodes
    |> Enum.find_value(fn %{attributes: attributes} = node ->
      case parse_hana_scale_up_status(node, sid) do
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

  # parse_hana_scale_out_sr_health_state returns the secondary sync state of the HANA scale out cluster
  defp parse_hana_scale_out_sr_health_state(
         %{configuration: %{crm_config: %{cluster_properties: cluster_properties}}},
         sid
       ) do
    glob_sec =
      parse_crm_cluster_property(
        cluster_properties,
        "hana_#{String.downcase(sid)}_glob_sec",
        nil
      )

    # _glob_sec attribute doesn't exist. Find secondary discarding primary site
    # This scenario might happen if the SAPHanaSrMultiTarget.py hook is not present
    secondary_site =
      case glob_sec do
        nil -> get_secondary_site(cluster_properties, sid)
        site -> site
      end

    parse_crm_cluster_property(
      cluster_properties,
      "hana_#{String.downcase(sid)}_site_lss_#{secondary_site}",
      "Unknown"
    )
  end

  defp get_primary_site(cluster_properties, sid) do
    parse_crm_cluster_property(
      cluster_properties,
      "hana_#{String.downcase(sid)}_glob_prim",
      "Unknown"
    )
  end

  # get_secondary_site gets the secondary site discarding the primary site name
  defp get_secondary_site(cluster_properties, sid) do
    primary_site = get_primary_site(cluster_properties, sid)

    cluster_properties
    |> Enum.filter(fn
      %{name: name} -> String.starts_with?(name, "hana_#{String.downcase(sid)}_site_lss_")
    end)
    |> Enum.map(fn %{name: name} -> name |> String.split("_site_lss_") |> Enum.at(-1) end)
    |> Enum.find("Unknown", fn site -> site != primary_site end)
  end

  defp parse_cluster_fencing_type(%{resources: resources}, sbd) do
    resources
    |> Enum.find_value(nil, fn
      %{agent: "stonith:" <> fencing_type} ->
        fencing_type

      _ ->
        false
    end)
    |> extract_fencing_type(sbd)
  end

  defp extract_fencing_type(nil, %{config: %{"sbd_device" => _}}), do: @unknown_fencing_type

  defp extract_fencing_type(nil, %{config: %{"sbd_watchdog_dev" => _}, devices: []}),
    do: @diskless_sbd_fencing_type

  defp extract_fencing_type(fencing_type, _), do: fencing_type

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

  defp parse_sbd_devices(_), do: []

  defp parse_node_resources(node_name, crmmon) do
    crmmon
    |> extract_cluster_resources()
    |> Enum.filter(fn
      %{node: %{name: ^node_name}} ->
        true

      _ ->
        false
    end)
    |> Enum.map(fn %{id: id, agent: type, role: role, parent: parent} = resource ->
      %{
        id: id,
        type: type,
        role: role,
        status: parse_resource_status(resource),
        fail_count: parse_fail_count(node_name, id, crmmon),
        managed: parse_managed(resource),
        parent: parent
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
      Enum.flat_map(clones, &(&1 |> Map.get(:primitive, []) |> List.wrap())) ++
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
  defp parse_hana_scale_up_status(%{attributes: attributes}, sid) do
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

  defp parse_hana_scale_out_status(
         HanaArchitectureType.classic(),
         cluster_properties,
         site,
         sid
       ) do
    status =
      parse_crm_cluster_property(
        cluster_properties,
        "hana_#{String.downcase(sid)}_site_srr_#{site}",
        "Unknown"
      )

    sr_hook =
      parse_crm_cluster_property(
        cluster_properties,
        "hana_#{String.downcase(sid)}_site_srHook_#{site}",
        nil
      )

    # If SAPHanaSR.py is used, and srHook_ attributes are not present
    sync_state =
      case sr_hook do
        nil -> parse_single_target_status(cluster_properties, sid, site)
        state -> state
      end

    do_parse_hana_status(status, sync_state)
  end

  defp parse_hana_scale_out_status(HanaArchitectureType.angi(), cluster_properties, site, sid) do
    status =
      parse_crm_cluster_property(
        cluster_properties,
        "hana_#{String.downcase(sid)}_site_srr_#{site}",
        "Unknown"
      )

    sync_state =
      parse_crm_cluster_property(
        cluster_properties,
        "hana_#{String.downcase(sid)}_site_srPoll_#{site}",
        "Unknown"
      )

    do_parse_hana_status(status, sync_state)
  end

  def parse_single_target_status(cluster_properties, sid, site) do
    secondary_site = get_secondary_site(cluster_properties, sid)

    case site do
      ^secondary_site ->
        parse_crm_cluster_property(
          cluster_properties,
          "hana_#{String.downcase(sid)}_glob_sync_state",
          "Unknown"
        )

      _ ->
        "PRIM"
    end
  end

  defp parse_crm_cluster_property(cluster_properties, property_name, default_value) do
    Enum.find_value(cluster_properties, default_value, fn
      %{name: ^property_name, value: value} ->
        value

      _ ->
        false
    end)
  end

  defp extract_cluster_resources(%{
         resources: resources,
         groups: groups,
         clones: clones
       }) do
    enriched_resources = enrich_parent(resources)
    enriched_clones = enrich_parent(clones)
    enriched_groups = enrich_parent(groups)

    Enum.concat([enriched_resources, enriched_clones, enriched_groups])
  end

  defp enrich_parent(resource_group) do
    Enum.flat_map(resource_group, fn
      %CrmmonClone{id: id, managed: managed, multi_state: multi_state, resources: resources} ->
        Enum.map(resources, fn resource ->
          put_parent(resource, %{id: id, managed: managed, multi_state: multi_state})
        end)

      %CrmmonGroup{id: id, resources: resources} ->
        Enum.map(resources, fn resource ->
          put_parent(resource, %{id: id, managed: nil, multi_state: nil})
        end)

      %CrmmonResource{} = resource ->
        [put_parent(resource, nil)]
    end)
  end

  defp put_parent(resource, parent) do
    resource
    |> Map.from_struct()
    |> Map.put(:parent, parent)
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

  defp parse_managed(%{managed: managed}), do: managed

  defp get_virtual_ip_type_suffix_by_provider(Provider.azure()), do: "IPaddr2"
  defp get_virtual_ip_type_suffix_by_provider(Provider.aws()), do: "aws-vpc-move-ip"
  defp get_virtual_ip_type_suffix_by_provider(Provider.gcp()), do: "IPaddr2"
  defp get_virtual_ip_type_suffix_by_provider(_), do: "IPaddr2"

  defp do_parse_hana_status(nil, _), do: "Unknown"
  defp do_parse_hana_status(_, nil), do: "Unknown"
  defp do_parse_hana_status(_, "Unknown"), do: "Unknown"
  # Normal primary state
  defp do_parse_hana_status("P", "PRIM"), do: "Primary"
  # This happens when there is an initial failover
  defp do_parse_hana_status("P", _), do: "Failed"
  # Normal secondary state
  defp do_parse_hana_status("S", "SOK"), do: "Secondary"
  # Abnormal secondary state
  defp do_parse_hana_status("S", _), do: "Failed"
  defp do_parse_hana_status(_, _), do: "Unknown"

  defp parse_ascs_ers_cluster_sap_system(payload, sid) do
    resources_by_sid = get_resources_by_sid(payload, sid)

    is_filesystem_resource_based =
      Enum.count(resources_by_sid, fn
        %{type: "Filesystem"} -> true
        _ -> false
      end) == 2

    %{
      sid: sid,
      filesystem_resource_based: is_filesystem_resource_based,
      distributed: distributed?(payload, resources_by_sid),
      nodes: parse_ascs_ers_cluster_nodes(payload, resources_by_sid)
    }
  end

  defp get_resources_by_sid(%{cib: %{configuration: %{resources: %{groups: groups}}}}, sid) do
    Enum.flat_map(groups, fn
      %{primitives: primitives} ->
        primitives
        |> Enum.find_value([], fn
          %{type: "SAPInstance", instance_attributes: attributes} ->
            attributes

          _ ->
            nil
        end)
        |> Enum.find_value([], fn
          %{name: "InstanceName", value: value} ->
            # The nesting level looks reasonable to avoid having a new function
            # credo:disable-for-next-line /\.Nesting/
            if value |> String.split("_") |> Enum.at(0) == sid, do: primitives

          _ ->
            nil
        end)
    end)
  end

  # Check if the SAPInstance resource is running in different nodes only using
  # the resources belonging to a specific SAP system.
  # The next conditions must met for the SAPInstance resources:
  # - Role is Started
  # - Failed is false
  # - The nodes are in a clean state
  # - The 2 SAPInstance resources are running in different nodes
  defp distributed?(%{crmmon: %{nodes: nodes, groups: groups}}, resources) do
    resource_ids = Enum.map(resources, fn %{id: id} -> id end)

    clean_nodes =
      Enum.flat_map(nodes, fn
        %{name: name, online: true, unclean: false} -> [name]
        _ -> []
      end)

    groups
    |> Enum.flat_map(fn
      %{resources: resources} -> resources
      _ -> []
    end)
    |> Enum.filter(fn
      %{
        id: id,
        agent: "ocf::heartbeat:SAPInstance",
        role: "Started",
        failed: false,
        node: %{name: name}
      } ->
        id in resource_ids and name in clean_nodes

      _ ->
        false
    end)
    |> Enum.uniq_by(fn
      %{node: %{name: name}} -> name
    end)
    |> Enum.count() == 2
  end

  # Parse details from each node for a specific sid.
  # The runtime information of where the resource is running belongs to crmmon payload,
  # but the data itself is in the cib payload, so both payloads must be crossed.
  defp parse_ascs_ers_cluster_nodes(
         %{
           provider: provider,
           crmmon: %{nodes: nodes, node_attributes: %{nodes: node_attributes}} = crmmon
         },
         cib_resources_by_sid
       ) do
    Enum.map(nodes, fn %{name: node_name} = node ->
      cib_resource_ids = Enum.map(cib_resources_by_sid, fn %{id: id} -> id end)

      crm_node_resources =
        node_name
        |> parse_node_resources(crmmon)
        |> Enum.filter(fn %{id: id} -> id in cib_resource_ids end)

      crm_node_resource_ids = Enum.map(crm_node_resources, fn %{id: id} -> id end)

      cib_node_resources =
        Enum.filter(cib_resources_by_sid, fn %{id: id} -> id in crm_node_resource_ids end)

      attributes =
        node_attributes
        |> Enum.find_value([], fn
          %{name: ^node_name, attributes: attributes} -> attributes
          _ -> false
        end)
        |> Enum.into(%{}, fn %{name: name, value: value} ->
          {name, value}
        end)

      roles =
        cib_node_resources
        |> parse_resource_by_type("SAPInstance", "IS_ERS")
        |> Enum.map(fn
          "true" -> AscsErsClusterRole.ers()
          _ -> AscsErsClusterRole.ascs()
        end)

      virtual_ip_type = get_virtual_ip_type_suffix_by_provider(provider)

      %{
        name: node_name,
        roles: roles,
        virtual_ips: parse_resource_by_type(cib_node_resources, virtual_ip_type, "ip"),
        filesystems: parse_resource_by_type(cib_node_resources, "Filesystem", "directory"),
        attributes: attributes,
        resources: crm_node_resources,
        status: parse_node_status(node)
      }
    end)
  end

  defp parse_resource_by_type(resources, type, attribute_name) do
    resources
    |> Enum.filter(fn
      %{type: ^type} -> true
      _ -> false
    end)
    |> Enum.map(fn %{instance_attributes: instance_attributes} ->
      Enum.find_value(instance_attributes, nil, fn
        %{name: ^attribute_name, value: value} -> value
        _ -> nil
      end)
    end)
  end

  defp parse_cib_last_written(%{
         crmmon: %{summary: %{last_change: %{time: cib_last_written}}}
       }),
       do: cib_last_written

  defp generate_cluster_id(nil), do: nil
  defp generate_cluster_id(id), do: UUID.uuid5(@uuid_namespace, id)

  defp parse_cluster_health(details, cluster_type)
       when cluster_type in [ClusterType.hana_scale_up(), ClusterType.hana_scale_out()],
       do: parse_hana_cluster_health(details)

  defp parse_cluster_health(%{sap_systems: sap_systems}, ClusterType.ascs_ers()) do
    Enum.find_value(sap_systems, Health.passing(), fn %{distributed: distributed} ->
      if not distributed, do: Health.critical()
    end)
  end

  defp parse_cluster_health(_, _), do: Health.unknown()

  # Passing state if SR Health state is 4 and Sync state is SOK, everything else is critical
  # If data is not present for some reason the state goes to unknown
  defp parse_hana_cluster_health(%{sr_health_state: "4", secondary_sync_state: "SOK"}),
    do: Health.passing()

  defp parse_hana_cluster_health(%{sr_health_state: "", secondary_sync_state: ""}),
    do: Health.unknown()

  defp parse_hana_cluster_health(%{sr_health_state: _, secondary_sync_state: _}),
    do: Health.critical()

  defp parse_hana_scenario([]), do: HanaScenario.performance_optimized()

  defp parse_hana_scenario(_), do: HanaScenario.cost_optimized()
end
