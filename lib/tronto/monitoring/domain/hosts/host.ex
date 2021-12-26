defmodule Tronto.Monitoring.Domain.Host do
  @moduledoc false

  alias Tronto.Monitoring.Domain.Host

  alias Tronto.Monitoring.Domain.Commands.{
    RegisterHost
  }

  alias Tronto.Monitoring.Domain.Events.{
    HostRegistered
  }

  defstruct [
    :id_host,
    :hostname,
    :ip_addresses,
    :agent_version
  ]

  @type t :: %__MODULE__{
          id_host: String.t(),
          hostname: String.t(),
          ip_addresses: [String.t()],
          agent_version: String.t()
        }

  # New host registered
  def execute(
        %Host{id_host: nil},
        %RegisterHost{
          id_host: id_host,
          hostname: hostname,
          ip_addresses: ip_addresses,
          agent_version: agent_version
        }
      ) do
    %HostRegistered{
      id_host: id_host,
      hostname: hostname,
      ip_addresses: ip_addresses,
      agent_version: agent_version
    }
  end

  def execute(
        %Host{id_host: _},
        %RegisterHost{}
      ) do
    []
  end

  def apply(
        %Host{} = host,
        %HostRegistered{
          id_host: id_host,
          hostname: hostname,
          ip_addresses: ip_addresses,
          agent_version: agent_version
        }
      ) do
    %Host{
      host
      | id_host: id_host,
        hostname: hostname,
        ip_addresses: ip_addresses,
        agent_version: agent_version
    }
  end
end
