defmodule Tronto.Monitoring.Domain.Host do
  @moduledoc false

  alias Tronto.Monitoring.Domain.Host

  alias Tronto.Monitoring.Domain.{
    AzureProvider,
    SlesSubscription
  }

  alias Tronto.Monitoring.Domain.Commands.{
    RegisterHost,
    UpdateHeartbeat,
    UpdateProvider,
    UpdateSlesSubscriptions
  }

  alias Tronto.Monitoring.Domain.Events.{
    HeartbeatFailed,
    HeartbeatSucceded,
    HostDetailsUpdated,
    HostRegistered,
    ProviderUpdated,
    SlesSubscriptionsUpdated
  }

  defstruct [
    :host_id,
    :hostname,
    :ip_addresses,
    :agent_version,
    :provider,
    :heartbeat,
    :subscriptions,
    :provider_data
  ]

  @type t :: %__MODULE__{
          host_id: String.t(),
          hostname: String.t(),
          ip_addresses: [String.t()],
          agent_version: String.t(),
          provider: :azure | :unknown,
          subscriptions: [SlesSubscription.t()],
          provider_data: AzureProvider.t() | nil,
          heartbeat: :passing | :critical | :unknown
        }

  # New host registered
  def execute(
        %Host{host_id: nil},
        %RegisterHost{
          host_id: host_id,
          hostname: hostname,
          ip_addresses: ip_addresses,
          agent_version: agent_version
        }
      ) do
    %HostRegistered{
      host_id: host_id,
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
          host_id: host_id,
          hostname: hostname,
          ip_addresses: ip_addresses,
          agent_version: agent_version
        }
      ) do
    %HostDetailsUpdated{
      host_id: host_id,
      hostname: hostname,
      ip_addresses: ip_addresses,
      agent_version: agent_version
    }
  end

  # Heartbeat received
  def execute(
        %Host{host_id: nil},
        %UpdateHeartbeat{}
      ) do
    {:error, :host_not_registered}
  end

  def execute(
        %Host{host_id: host_id, heartbeat: heartbeat},
        %UpdateHeartbeat{heartbeat: :passing}
      )
      when heartbeat != :passing do
    %HeartbeatSucceded{host_id: host_id}
  end

  def execute(
        %Host{host_id: host_id, heartbeat: heartbeat},
        %UpdateHeartbeat{heartbeat: :critical}
      )
      when heartbeat != :critical do
    %HeartbeatFailed{host_id: host_id}
  end

  def execute(
        %Host{},
        %UpdateHeartbeat{}
      ) do
    []
  end

  # Update provider received
  def execute(
        %Host{host_id: nil},
        %UpdateProvider{}
      ) do
    {:error, :host_not_registered}
  end

  def execute(
        %Host{provider: provider, provider_data: provider_data},
        %UpdateProvider{provider: provider, provider_data: provider_data}
      ) do
    []
  end

  def execute(
        %Host{},
        %UpdateProvider{host_id: host_id, provider: provider, provider_data: provider_data}
      ) do
    %ProviderUpdated{
      host_id: host_id,
      provider: provider,
      provider_data: provider_data
    }
  end

  def execute(
        %Host{host_id: nil},
        %UpdateSlesSubscriptions{}
      ) do
    {:error, :host_not_registered}
  end

  def execute(%Host{subscriptions: subscriptions}, %UpdateSlesSubscriptions{
        subscriptions: subscriptions
      }) do
    []
  end

  def execute(%Host{}, %UpdateSlesSubscriptions{
        host_id: host_id,
        subscriptions: subscriptions
      }) do
    %SlesSubscriptionsUpdated{
      host_id: host_id,
      subscriptions: subscriptions
    }
  end

  def apply(
        %Host{} = host,
        %HostRegistered{
          host_id: host_id,
          hostname: hostname,
          ip_addresses: ip_addresses,
          agent_version: agent_version,
          heartbeat: heartbeat
        }
      ) do
    %Host{
      host
      | host_id: host_id,
        hostname: hostname,
        ip_addresses: ip_addresses,
        agent_version: agent_version,
        heartbeat: heartbeat
    }
  end

  def apply(
        %Host{} = host,
        %HostDetailsUpdated{
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

  def apply(
        %Host{} = host,
        %HeartbeatSucceded{host_id: host_id}
      ) do
    %Host{
      host
      | host_id: host_id,
        heartbeat: :passing
    }
  end

  def apply(
        %Host{} = host,
        %HeartbeatFailed{host_id: host_id}
      ) do
    %Host{
      host
      | host_id: host_id,
        heartbeat: :critical
    }
  end

  def apply(
        %Host{} = host,
        %ProviderUpdated{provider: provider, provider_data: provider_data}
      ) do
    %Host{
      host
      | provider: provider,
        provider_data: provider_data
    }
  end

  def apply(%Host{} = host, %SlesSubscriptionsUpdated{
        subscriptions: subscriptions
      }) do
    %Host{host | subscriptions: subscriptions}
  end
end
