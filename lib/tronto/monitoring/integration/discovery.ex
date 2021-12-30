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
      ip_addresses: ip_addresses,
      agent_version: agent_version
    )
  end

  def handle_discovery_event(_) do
    {:error, :invalid_payload}
  end
end
