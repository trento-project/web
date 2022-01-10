defmodule Tronto.Monitoring.Integration.Discovery do
  @moduledoc """
  This module contains functions to handle integration events
  from the discovery bounded-context
  """

  alias Tronto.Monitoring.Domain.Commands.RegisterHost

  @spec handle_discovery_event(map) :: {:error, any} | {:ok, struct}
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
      id_host: agent_id,
      hostname: hostname,
      ip_addresses: Enum.filter(ip_addresses, &is_ipv4?/1),
      agent_version: agent_version
    )
  end

  def handle_discovery_event(_) do
    {:error, :invalid_payload}
  end

  defp is_ipv4?("127.0.0.1"), do: false

  defp is_ipv4?(ip) do
    case :inet.parse_ipv4_address(String.to_charlist(ip)) do
      {:ok, _} ->
        true

      {:error, :einval} ->
        false
    end
  end
end
