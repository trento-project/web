defmodule Trento.Discovery.Policies.SapSystemPolicy do
  @moduledoc """
  This module contains functions to transform SAP system related integration events into commands..
  """

  require Trento.SapSystems.Enums.EnsaVersion, as: EnsaVersion

  alias Trento.Databases.Commands.{
    MarkDatabaseInstanceAbsent,
    RegisterDatabaseInstance
  }

  alias Trento.SapSystems.Commands.{
    MarkApplicationInstanceAbsent,
    RegisterApplicationInstance
  }

  alias Trento.Databases.Projections.DatabaseInstanceReadModel

  alias Trento.SapSystems.Projections.ApplicationInstanceReadModel

  alias Trento.Discovery.Payloads.SapSystemDiscoveryPayload

  alias SapSystemDiscoveryPayload.{
    HdbnsutilSRstate,
    Instance,
    Profile,
    SapControl,
    SystemReplication
  }

  alias Trento.Clusters.ValueObjects.SapInstance

  @uuid_namespace Application.compile_env!(:trento, :uuid_namespace)

  @unknown_type 0
  @database_type 1
  @application_type 2
  @diagnostics_type 3

  @spec handle(
          map,
          [ApplicationInstanceReadModel.t() | DatabaseInstanceReadModel.t()],
          [SapInstance.t()]
        ) ::
          {:ok,
           [
             RegisterApplicationInstance.t()
             | RegisterDatabaseInstance.t()
           ]}
          | {:error, any}
  def handle(
        %{
          "discovery_type" => "sap_system_discovery",
          "agent_id" => agent_id,
          "payload" => payload
        },
        current_instances,
        sap_instances
      ) do
    with {:ok, sap_systems} <- SapSystemDiscoveryPayload.new(payload),
         {:ok, register_instance_commands} <-
           sap_systems
           |> Enum.flat_map(fn sap_system ->
             build_register_instances_commands(sap_system, agent_id, sap_instances)
           end)
           |> Enum.reduce_while(
             {:ok, []},
             fn
               {:ok, command}, {:ok, commands} -> {:cont, {:ok, commands ++ [command]}}
               {:error, _} = error, _ -> {:halt, error}
             end
           ) do
      # Build deregistration commands but only for instances that are not
      # present in the discovery payload anymore.
      deregister_instance_commands =
        current_instances
        |> Enum.reject(fn current_instance ->
          Enum.any?(register_instance_commands, fn instance ->
            instance.host_id == current_instance.host_id &&
              instance.instance_number == current_instance.instance_number
          end)
        end)
        |> build_deregister_instances_commands()

      {:ok, deregister_instance_commands ++ register_instance_commands}
    end
  end

  defp build_register_instances_commands(
         %SapSystemDiscoveryPayload{
           Id: id,
           SID: sid,
           Type: @database_type,
           Databases: databases,
           Instances: instances
         },
         host_id,
         _
       ) do
    # extract tenants name from the database
    tenants =
      Enum.map(databases, fn %{:Database => tenant} ->
        %{name: tenant}
      end)

    Enum.map(instances, fn instance ->
      RegisterDatabaseInstance.new(%{
        database_id: UUID.uuid5(@uuid_namespace, id),
        sid: sid,
        tenants: tenants,
        host_id: host_id,
        instance_number: parse_instance_number(instance),
        instance_hostname: parse_instance_hostname(instance),
        features: parse_features(instance),
        http_port: parse_http_port(instance),
        https_port: parse_https_port(instance),
        start_priority: parse_start_priority(instance),
        system_replication: parse_system_replication(instance),
        system_replication_status: parse_system_replication_status(instance),
        system_replication_site: parse_system_replication_site(instance),
        system_replication_mode: parse_system_replication_mode(instance),
        system_replication_operation_mode: parse_system_replication_operation_mode(instance),
        system_replication_source_site: parse_system_replication_source_site(instance),
        system_replication_tier: parse_system_replication_tier(instance),
        health: parse_dispstatus(instance)
      })
    end)
  end

  defp build_register_instances_commands(
         %SapSystemDiscoveryPayload{
           SID: sid,
           Type: @application_type,
           Instances: instances,
           DBAddress: db_host,
           Profile: %Profile{
             "dbs/hdb/dbname": tenant
           }
         },
         host_id,
         sap_instances
       ) do
    Enum.map(instances, fn instance ->
      instance_number = parse_instance_number(instance)

      clustered =
        Enum.any?(sap_instances, fn %{
                                      instance_number: inst_number,
                                      sid: inst_sid,
                                      mounted: mounted
                                    } ->
          inst_number == instance_number && inst_sid == sid && mounted
        end)

      RegisterApplicationInstance.new(%{
        sid: sid,
        tenant: tenant,
        db_host: db_host,
        instance_number: instance_number,
        instance_hostname: parse_instance_hostname(instance),
        features: parse_features(instance),
        http_port: parse_http_port(instance),
        https_port: parse_https_port(instance),
        start_priority: parse_start_priority(instance),
        host_id: host_id,
        health: parse_dispstatus(instance),
        ensa_version: parse_ensa_version(instance),
        clustered: clustered
      })
    end)
  end

  defp build_register_instances_commands(
         %SapSystemDiscoveryPayload{Type: @diagnostics_type},
         _,
         _
       ),
       do: []

  defp build_register_instances_commands(
         %SapSystemDiscoveryPayload{Type: @unknown_type},
         _,
         _
       ),
       do: []

  defp build_deregister_instances_commands(current_instances) do
    Enum.map(current_instances, fn
      %ApplicationInstanceReadModel{} = instance ->
        MarkApplicationInstanceAbsent.new!(%{
          host_id: instance.host_id,
          instance_number: instance.instance_number,
          sap_system_id: instance.sap_system_id,
          absent_at: DateTime.utc_now()
        })

      %DatabaseInstanceReadModel{} = instance ->
        MarkDatabaseInstanceAbsent.new!(%{
          host_id: instance.host_id,
          instance_number: instance.instance_number,
          database_id: instance.database_id,
          absent_at: DateTime.utc_now()
        })
    end)
  end

  defp parse_instance_number(instance), do: parse_sap_control_property("SAPSYSTEM", instance)

  defp parse_instance_hostname(instance), do: parse_sap_control_property("SAPLOCALHOST", instance)

  defp parse_sap_control_property(property, %Instance{
         SAPControl: %SapControl{Properties: properties}
       }) do
    Enum.find_value(properties, fn
      %{property: ^property, value: value} -> value
      _ -> nil
    end)
  end

  defp parse_sap_control_instance_value(
         %Instance{SAPControl: %SapControl{Instances: instances}},
         key
       ) do
    Enum.find_value(instances, fn
      %{currentInstance: true} = current_instance -> Map.get(current_instance, key)
      _ -> nil
    end)
  end

  defp parse_features(instance), do: parse_sap_control_instance_value(instance, :features)
  defp parse_http_port(instance), do: parse_sap_control_instance_value(instance, :httpPort)
  defp parse_https_port(instance), do: parse_sap_control_instance_value(instance, :httpsPort)

  defp parse_start_priority(instance),
    do: parse_sap_control_instance_value(instance, :startPriority)

  defp parse_dispstatus(instance),
    do:
      instance
      |> parse_sap_control_instance_value(:dispstatus)
      |> normalize_dispstatus

  defp normalize_dispstatus(:"SAPControl-GREEN"), do: :passing
  defp normalize_dispstatus(:"SAPControl-YELLOW"), do: :warning
  defp normalize_dispstatus(:"SAPControl-RED"), do: :critical
  defp normalize_dispstatus(_), do: :unknown

  defp parse_system_replication(%Instance{
         HdbnsutilSRstate: %HdbnsutilSRstate{mode: mode}
       }) do
    case mode do
      "primary" ->
        "Primary"

      mode when mode in ["sync", "syncmem", "async", "unknown"] ->
        "Secondary"

      _ ->
        ""
    end
  end

  # Find status information at:
  # https://help.sap.com/viewer/4e9b18c116aa42fc84c7dbfd02111aba/2.0.04/en-US/aefc55a27003440792e34ece2125dc89.html
  defp parse_system_replication_status(%Instance{
         SystemReplication: %SystemReplication{overall_replication_status: status}
       }),
       do: status

  defp parse_system_replication_site(%Instance{
         HdbnsutilSRstate: %HdbnsutilSRstate{site_name: site_name}
       }),
       do: site_name

  defp parse_system_replication_mode(%Instance{
         HdbnsutilSRstate: %HdbnsutilSRstate{mode: mode}
       }),
       do: mode

  defp parse_system_replication_operation_mode(%Instance{
         HdbnsutilSRstate: %HdbnsutilSRstate{operation_mode: operation_mode}
       }),
       do: operation_mode

  defp parse_system_replication_source_site(%Instance{
         HdbnsutilSRstate: %HdbnsutilSRstate{site_name: site_name, site_mapping: site_mapping}
       }),
       do: Map.get(site_mapping, site_name, nil)

  defp parse_system_replication_tier(%Instance{
         HdbnsutilSRstate: %HdbnsutilSRstate{site_name: site_name, tier_mapping: tier_mapping}
       }),
       do: Map.get(tier_mapping, site_name, nil)

  defp parse_ensa_version(%Instance{SAPControl: %SapControl{Processes: processes}}) do
    Enum.find_value(processes, EnsaVersion.no_ensa(), fn
      %{name: "enserver"} -> EnsaVersion.ensa1()
      %{name: "enrepserver"} -> EnsaVersion.ensa1()
      %{name: "enq_server"} -> EnsaVersion.ensa2()
      %{name: "enq_replicator"} -> EnsaVersion.ensa2()
      _ -> nil
    end)
  end

  defp parse_ensa_version(_), do: EnsaVersion.no_ensa()
end
