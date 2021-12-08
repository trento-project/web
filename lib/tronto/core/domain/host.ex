defmodule Tronto.Core.Domain.Host do
  @moduledoc false

  alias Tronto.Core.Domain.Host

  alias Tronto.Core.Domain.Commands.{
    DiscoverHost
  }

  alias Tronto.Core.Domain.Events.{
    HostDiscovered,
    HostUpdated
  }

  defstruct [
    :id,
    :hostname,
    :ip_addresses,
    :agent_version
  ]

  @type t :: %__MODULE__{
          id: String.t(),
          hostname: String.t(),
          ip_addresses: [String.t()],
          agent_version: String.t()
        }

  # Host newly discovered
  def execute(
        %Host{id: nil},
        %DiscoverHost{
          id: id,
          hostname: hostname,
          ip_addresses: ip_addresses,
          agent_version: agent_version
        }
      ) do
    %HostDiscovered{
      id: id,
      hostname: hostname,
      ip_addresses: ip_addresses,
      agent_version: agent_version
    }
  end

  # Host already exists
  def execute(
        %Host{id: id},
        %DiscoverHost{
          hostname: hostname,
          ip_addresses: ip_addresses,
          agent_version: agent_version
        }
      ) do
    %HostUpdated{
      id: id,
      hostname: hostname,
      ip_addresses: ip_addresses,
      agent_version: agent_version
    }
  end

  def apply(
        %Host{} = host,
        %HostDiscovered{
          id: id,
          hostname: hostname,
          ip_addresses: ip_addresses,
          agent_version: agent_version
        }
      ) do
    %Host{
      host
      | id: id,
        hostname: hostname,
        ip_addresses: ip_addresses,
        agent_version: agent_version
    }
  end

  def apply(
        %Host{} = host,
        %HostUpdated{
          hostname: hostname,
          ip_addresses: ip_addresses,
          agent_version: agent_version
        }
      ) do
    %Host{
      host
      | hostname: hostname,
        ip_addresses: ip_addresses,
        agent_version: agent_version
    }
  end
end
