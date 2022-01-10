defmodule Tronto.Monitoring.Domain.Host do
  @moduledoc false

  alias Tronto.Monitoring.Domain.Host

  alias Tronto.Monitoring.Domain.Commands.{
    RegisterHost,
    UpdateHeartbeat
  }

  alias Tronto.Monitoring.Domain.Events.{
    HeartbeatFailed,
    HeartbeatSucceded,
    HostDetailsUpdated,
    HostRegistered
  }

  defstruct [
    :id_host,
    :hostname,
    :ip_addresses,
    :agent_version,
    :heartbeat
  ]

  @type t :: %__MODULE__{
          id_host: String.t(),
          hostname: String.t(),
          ip_addresses: [String.t()],
          agent_version: String.t(),
          heartbeat: :passing | :critical | :unknown
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
      agent_version: agent_version,
      heartbeat: :unknown
    }
  end

  # Host exists but details didn't change
  def execute(
        %Host{
          hostname: hostname,
          ip_addresses: ip_addresses,
          agent_version: agent_version
        },
        %RegisterHost{
          hostname: hostname,
          ip_addresses: ip_addresses,
          agent_version: agent_version
        }
      ) do
    []
  end

  def execute(
        %Host{},
        %RegisterHost{
          id_host: id_host,
          hostname: hostname,
          ip_addresses: ip_addresses,
          agent_version: agent_version
        }
      ) do
    %HostDetailsUpdated{
      id_host: id_host,
      hostname: hostname,
      ip_addresses: ip_addresses,
      agent_version: agent_version
    }
  end

  # Heartbeat received
  def execute(
        %Host{id_host: nil},
        %UpdateHeartbeat{}
      ) do
    {:error, :host_not_registered}
  end

  def execute(
        %Host{id_host: id_host, heartbeat: heartbeat},
        %UpdateHeartbeat{heartbeat: :passing}
      )
      when heartbeat != :passing do
    %HeartbeatSucceded{id_host: id_host}
  end

  def execute(
        %Host{id_host: id_host, heartbeat: heartbeat},
        %UpdateHeartbeat{heartbeat: :critical}
      )
      when heartbeat != :critical do
    %HeartbeatFailed{id_host: id_host}
  end

  def execute(
        %Host{},
        %UpdateHeartbeat{}
      ) do
    []
  end

  def apply(
        %Host{} = host,
        %HostRegistered{
          id_host: id_host,
          hostname: hostname,
          ip_addresses: ip_addresses,
          agent_version: agent_version,
          heartbeat: heartbeat
        }
      ) do
    %Host{
      host
      | id_host: id_host,
        hostname: hostname,
        ip_addresses: ip_addresses,
        agent_version: agent_version,
        heartbeat: heartbeat
    }
  end

  def apply(
        %Host{} = host,
        %HostDetailsUpdated{
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

  def apply(
        %Host{} = host,
        %HeartbeatSucceded{id_host: id_host}
      ) do
    %Host{
      host
      | id_host: id_host,
        heartbeat: :passing
    }
  end

  def apply(
        %Host{} = host,
        %HeartbeatFailed{id_host: id_host}
      ) do
    %Host{
      host
      | id_host: id_host,
        heartbeat: :critical
    }
  end
end
