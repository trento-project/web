defmodule Trento.Integration.Discovery.SapSystemPolicy do
  @moduledoc """
  This module contains functions to trasnform SAP system related integration events into commands..
  """

  alias Trento.Domain.Commands.{
    RegisterApplicationInstance,
    RegisterDatabaseInstance
  }

  @uuid_namespace Application.compile_env!(:trento, :uuid_namespace)

  @database_type 1
  @application_type 2

  @spec handle(map) ::
          {:ok, [RegisterApplicationInstance.t() | RegisterDatabaseInstance.t()]} | {:error, any}
  def handle(%{
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
        {:error, _} = error, _ -> {:halt, error}
      end
    )
  end

  @spec parse_sap_system(map, String.t()) :: [
          {:ok, RegisterDatabaseInstance.t()}
          | {:ok, RegisterApplicationInstance.t()}
          | {:error, any}
        ]
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

          RegisterDatabaseInstance.new(%{
            sap_system_id: UUID.uuid5(@uuid_namespace, id),
            sid: sid,
            tenant: tenant,
            host_id: host_id,
            instance_number: instance_number,
            instance_hostname: parse_instance_hostname(instance, instance_number),
            features: parse_features(instance, instance_number),
            http_port: parse_http_port(instance, instance_number),
            https_port: parse_https_port(instance, instance_number),
            start_priority: parse_start_priority(instance, instance_number),
            health: parse_instance_health(instance, instance_number)
          })
        end
      )
    end)
  end

  defp parse_sap_system(
         %{
           "Type" => @application_type,
           "DBAddress" => db_host,
           "SID" => sid,
           "Instances" => instances,
           "Profile" => %{
             "dbs/hdb/dbname" => tenant
           }
         },
         host_id
       ) do
    Enum.map(instances, fn {_, instance} ->
      instance_number = parse_instance_number(instance)

      RegisterApplicationInstance.new(%{
        sid: sid,
        tenant: tenant,
        db_host: db_host,
        instance_number: instance_number,
        instance_hostname: parse_instance_hostname(instance, instance_number),
        features: parse_features(instance, instance_number),
        http_port: parse_http_port(instance, instance_number),
        https_port: parse_https_port(instance, instance_number),
        start_priority: parse_start_priority(instance, instance_number),
        host_id: host_id,
        health: parse_instance_health(instance, instance_number)
      })
    end)
  end

  defp parse_sap_system(
         %{
           "Type" => _
         },
         _
       ),
       do: []

  @spec parse_instance_hostname(map, String.t()) :: String.t()
  defp parse_instance_hostname(%{"SAPControl" => sap_control}, instance_number) do
    case extract_sap_control_instance_data(sap_control, instance_number, "hostname") do
      {:ok, instance_hostname} ->
        instance_hostname

      _ ->
        ""
    end
  end

  @spec parse_http_port(map, String.t()) :: integer() | nil
  defp parse_http_port(%{"SAPControl" => sap_control}, instance_number) do
    case extract_sap_control_instance_data(sap_control, instance_number, "httpPort") do
      {:ok, instance_http_port} ->
        instance_http_port

      _ ->
        nil
    end
  end

  @spec parse_https_port(map, String.t()) :: integer() | nil
  defp parse_https_port(%{"SAPControl" => sap_control}, instance_number) do
    case extract_sap_control_instance_data(sap_control, instance_number, "httpsPort") do
      {:ok, instance_https_port} ->
        instance_https_port

      _ ->
        nil
    end
  end

  @spec parse_start_priority(map, String.t()) :: String.t() | nil
  defp parse_start_priority(%{"SAPControl" => sap_control}, instance_number) do
    case extract_sap_control_instance_data(sap_control, instance_number, "startPriority") do
      {:ok, start_priority} ->
        start_priority

      _ ->
        nil
    end
  end

  @spec parse_features(map, String.t()) :: String.t()
  defp parse_features(%{"SAPControl" => sap_control}, instance_number) do
    case extract_sap_control_instance_data(sap_control, instance_number, "features") do
      {:ok, features} ->
        features

      _ ->
        ""
    end
  end

  @spec parse_instance_number(map) :: String.t()
  defp parse_instance_number(%{
         "SAPControl" => %{"Properties" => %{"SAPSYSTEM" => %{"value" => instance_number}}}
       }),
       do: instance_number

  @spec parse_instance_health(map, String.t()) :: :passing | :warning | :critical | :unknown
  defp parse_instance_health(%{"SAPControl" => sap_control}, instance_number) do
    case extract_sap_control_instance_data(sap_control, instance_number, "dispstatus") do
      {:ok, dispstatus} ->
        parse_dispstatus(dispstatus)

      _ ->
        :unknown
    end
  end

  defp parse_dispstatus("SAPControl-GREEN"), do: :passing
  defp parse_dispstatus("SAPControl-YELLOW"), do: :warning
  defp parse_dispstatus("SAPControl-RED"), do: :critical
  defp parse_dispstatus(_), do: :unknown

  @spec extract_sap_control_instance_data(map, String.t(), String.t()) ::
          {:ok, String.t()} | {:error, :key_not_found}
  defp extract_sap_control_instance_data(
         %{"Instances" => instances},
         instance_number,
         key
       ) do
    instances
    |> Map.values()
    |> Enum.find(fn %{"instanceNr" => number} ->
      number
      |> Integer.to_string()
      |> String.pad_leading(2, "0") == instance_number
    end)
    |> case do
      %{^key => value} ->
        {:ok, value}

      _ ->
        {:error, :key_not_found}
    end
  end
end
