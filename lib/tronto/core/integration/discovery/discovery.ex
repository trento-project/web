defmodule Tronto.Core.Integration.Discovery do
  @moduledoc false

  alias Tronto.Core.Domain.Commands

  @spec parse_discovery_event(map) :: Commands.DiscoverHost.t()
  def parse_discovery_event(%{
        "agent_id" => agent_id,
        "discovery_type" => "host_discovery",
        "payload" => %{
          "hostname" => hostname,
          "ip_addresses" => ip_addresses,
          "agent_version" => agent_version
        }
      })
      when is_list(ip_addresses) do
    %Commands.DiscoverHost{
      id: agent_id,
      hostname: hostname,
      ip_addresses: ip_addresses,
      agent_version: agent_version
    }
  end

  def parse_discovery_event(_) do
    {:error, :invalid_payload}
  end
end
