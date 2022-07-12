defmodule Trento.Integration.Discovery.SapSystemPolicy do
  @moduledoc """
  This module contains functions to trasnform SAP system related integration events into commands..
  """

  alias Trento.Domain.Commands.{
    RegisterApplicationInstance,
    RegisterDatabaseInstance
  }

  alias Trento.Integration.Discovery.SapSystemDiscoveryPayload

  alias SapSystemDiscoveryPayload.{
    Instance,
    Profile,
    SapControl,
    SystemReplication
  }

  @uuid_namespace Application.compile_env!(:trento, :uuid_namespace)

  @unknown_type 0
  @database_type 1
  @application_type 2
  @diagnostics_type 3

  @spec handle(map) ::
          {:ok, [RegisterApplicationInstance.t() | RegisterDatabaseInstance.t()]} | {:error, any}
  def handle(%{
        "discovery_type" => "sap_system_discovery",
        "agent_id" => agent_id,
        "payload" => payload
      }) do
    case SapSystemDiscoveryPayload.new(payload) do
      {:ok, sap_systems} ->
        sap_systems
        |> Enum.flat_map(fn sap_system -> build_commands(sap_system, agent_id) end)
        |> Enum.reduce_while(
          {:ok, []},
          fn
            {:ok, command}, {:ok, commands} -> {:cont, {:ok, commands ++ [command]}}
            {:error, _} = error, _ -> {:halt, error}
          end
        )

      error ->
        error
    end
  end

  defp build_commands(
         %SapSystemDiscoveryPayload{
           Id: id,
           SID: sid,
           Type: @database_type,
           Databases: databases,
           Instances: instances
         },
         host_id
       ) do
    Enum.flat_map(databases, fn %{:Database => tenant} ->
      Enum.map(instances, fn instance ->
        RegisterDatabaseInstance.new(%{
          sap_system_id: UUID.uuid5(@uuid_namespace, id),
          sid: sid,
          tenant: tenant,
          host_id: host_id,
          instance_number: parse_instance_number(instance),
          instance_hostname: parse_instance_hostname(instance),
          features: parse_features(instance),
          http_port: parse_http_port(instance),
          https_port: parse_https_port(instance),
          start_priority: parse_start_priority(instance),
          system_replication: parse_system_replication(instance),
          system_replication_status: parse_system_replication_status(instance),
          health: parse_dispstatus(instance)
        })
      end)
    end)
  end

  defp build_commands(
         %SapSystemDiscoveryPayload{
           SID: sid,
           Type: @application_type,
           Instances: instances,
           DBAddress: db_host,
           Profile: %Profile{
             "dbs/hdb/dbname": tenant
           }
         },
         host_id
       ) do
    Enum.map(instances, fn instance ->
      RegisterApplicationInstance.new(%{
        sid: sid,
        tenant: tenant,
        db_host: db_host,
        instance_number: parse_instance_number(instance),
        instance_hostname: parse_instance_hostname(instance),
        features: parse_features(instance),
        http_port: parse_http_port(instance),
        https_port: parse_https_port(instance),
        start_priority: parse_start_priority(instance),
        host_id: host_id,
        health: parse_dispstatus(instance)
      })
    end)
  end

  defp build_commands(%SapSystemDiscoveryPayload{Type: @diagnostics_type}, _), do: []
  defp build_commands(%SapSystemDiscoveryPayload{Type: @unknown_type}, _), do: []

  defp parse_instance_number(instance), do: parse_sap_control_property("SAPSYSTEM", instance)

  defp parse_instance_hostname(instance), do: parse_sap_control_property("SAPLOCALHOST", instance)

  defp parse_sap_control_property(property, %Instance{
         SAPControl: %SapControl{Properties: properties}
       }) do
    properties
    |> Enum.find_value(fn
      %{property: ^property, value: value} -> value
      _ -> nil
    end)
  end

  defp parse_sap_control_instance_value(
         %Instance{SAPControl: %SapControl{Instances: instances}},
         key
       ) do
    instances
    |> Enum.find_value(fn
      %{current_instance: true} = current_instance -> Map.get(current_instance, key)
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
         SystemReplication: %SystemReplication{local_site_id: local_site_id} = system_replication
       }) do
    case Map.get(system_replication, :"site/#{local_site_id}/REPLICATION_MODE") do
      "PRIMARY" ->
        "Primary"

      mode when mode in ["SYNC", "SYNCMEM", "ASYNC", "UNKNOWN"] ->
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
end
