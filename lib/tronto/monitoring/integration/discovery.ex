defmodule Tronto.Monitoring.Integration.Discovery do
  @moduledoc """
  This module contains functions to handle integration events
  from the discovery bounded-context
  """

  @type command :: struct

  alias Tronto.Monitoring.Domain.Commands.{
    RegisterCluster,
    RegisterHost,
    UpdateProvider,
    UpdateSlesSubscriptions
  }

  alias Tronto.Monitoring.Domain.SlesSubscription

  @spec handle_discovery_event(map) :: {:error, any} | {:ok, command}
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
        "payload" => %{
          "Provider" => provider
        }
      }) do
    UpdateProvider.new(
      host_id: agent_id,
      provider: provider
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

  def handle_discovery_event(_) do
    {:error, :invalid_payload}
  end

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
end
