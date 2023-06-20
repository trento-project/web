defmodule Trento.Domain.Host do
  @moduledoc """
  The host aggregate manages all the domain logic related to individual hosts
  (agent, in other term) that compose the target infrastructure running SAP systems.

  Each host running a Trento agent is registered as a new aggregate entry.
  New host discovery messages update the aggregate values if there is some difference.
  The host aggregate stores information such as:

  - Host basic information as the hostname and ip addresses
  - Hardware specifications
  - Platform where the host is running (the cloud provider for instance)
  - Registered SLES4SAP subscriptions

  Besides these mostly static values, the aggregate takes care of detecting the host availability
  using a heartbeat system. If each host does not send its heartbeat within a 10 seconds period
  (configurable), a heartbeat failed event is raised setting the host as not available.
  """

  require Trento.Domain.Enums.Provider, as: Provider

  alias Trento.Domain.Host

  alias Trento.Domain.{
    AwsProvider,
    AzureProvider,
    GcpProvider,
    SlesSubscription
  }

  alias Trento.Domain.Commands.{
    DeregisterHost,
    RegisterHost,
    RequestHostDeregistration,
    RollUpHost,
    UpdateHeartbeat,
    UpdateProvider,
    UpdateSlesSubscriptions
  }

  alias Trento.Domain.Events.{
    HeartbeatFailed,
    HeartbeatSucceded,
    HostDeregistered,
    HostDeregistrationRequested,
    HostDetailsUpdated,
    HostRegistered,
    HostRestored,
    HostRolledUp,
    HostRollUpRequested,
    HostTombstoned,
    ProviderUpdated,
    SlesSubscriptionsUpdated
  }

  @required_fields []

  use Trento.Type

  import PolymorphicEmbed, only: [cast_polymorphic_embed: 3]

  deftype do
    field :host_id, Ecto.UUID
    field :hostname, :string
    field :ip_addresses, {:array, :string}
    field :agent_version, :string
    field :cpu_count, :integer
    field :total_memory_mb, :integer
    field :socket_count, :integer
    field :os_version, :string
    field :provider, Ecto.Enum, values: Provider.values()
    field :installation_source, Ecto.Enum, values: [:community, :suse, :unknown]
    field :heartbeat, Ecto.Enum, values: [:passing, :critical, :unknown]
    field :rolling_up, :boolean, default: false
    field :deregistered_at, :utc_datetime_usec, default: nil

    embeds_many :subscriptions, SlesSubscription

    field :provider_data, PolymorphicEmbed,
      types: [
        azure: [module: AzureProvider, identify_by_fields: [:resource_group]],
        aws: [module: AwsProvider, identify_by_fields: [:ami_id]],
        gcp: [module: GcpProvider, identify_by_fields: [:project_id]]
      ],
      on_replace: :update
  end

  def changeset(event, attrs) do
    event
    |> cast(attrs, [:host_id, :provider])
    |> cast_polymorphic_embed(:provider_data, required: false)
  end

  # Stop everything during the rollup process
  def execute(%Host{rolling_up: true}, _), do: {:error, :host_rolling_up}

  # New host registered
  def execute(
        %Host{host_id: nil},
        %RegisterHost{
          host_id: host_id,
          hostname: hostname,
          ip_addresses: ip_addresses,
          agent_version: agent_version,
          cpu_count: cpu_count,
          total_memory_mb: total_memory_mb,
          socket_count: socket_count,
          os_version: os_version,
          installation_source: installation_source
        }
      ) do
    %HostRegistered{
      host_id: host_id,
      hostname: hostname,
      ip_addresses: ip_addresses,
      agent_version: agent_version,
      cpu_count: cpu_count,
      total_memory_mb: total_memory_mb,
      socket_count: socket_count,
      os_version: os_version,
      installation_source: installation_source,
      heartbeat: :unknown
    }
  end

  # Reject all the commands, except for the registration ones when the host_id does not exists
  def execute(
        %Host{host_id: nil},
        _
      ) do
    {:error, :host_not_registered}
  end

  # Restore the host when a RegisterHost command is received for a deregistered host
  def execute(
        %Host{
          host_id: host_id,
          hostname: hostname,
          ip_addresses: ip_addresses,
          agent_version: agent_version,
          cpu_count: cpu_count,
          total_memory_mb: total_memory_mb,
          socket_count: socket_count,
          os_version: os_version,
          installation_source: installation_source,
          deregistered_at: deregistered_at
        },
        %RegisterHost{
          hostname: hostname,
          ip_addresses: ip_addresses,
          agent_version: agent_version,
          cpu_count: cpu_count,
          total_memory_mb: total_memory_mb,
          socket_count: socket_count,
          os_version: os_version,
          installation_source: installation_source
        }
      )
      when not is_nil(deregistered_at) do
    %HostRestored{
      host_id: host_id
    }
  end

  def execute(
        %Host{
          host_id: host_id,
          deregistered_at: deregistered_at
        },
        %RegisterHost{
          hostname: hostname,
          ip_addresses: ip_addresses,
          agent_version: agent_version,
          cpu_count: cpu_count,
          total_memory_mb: total_memory_mb,
          socket_count: socket_count,
          os_version: os_version,
          installation_source: installation_source
        }
      )
      when not is_nil(deregistered_at) do
    [
      %HostRestored{
        host_id: host_id
      },
      %HostDetailsUpdated{
        host_id: host_id,
        hostname: hostname,
        ip_addresses: ip_addresses,
        agent_version: agent_version,
        cpu_count: cpu_count,
        total_memory_mb: total_memory_mb,
        socket_count: socket_count,
        os_version: os_version,
        installation_source: installation_source
      }
    ]
  end

  def execute(
        %Host{host_id: host_id} = snapshot,
        %RollUpHost{}
      ) do
    %HostRollUpRequested{
      host_id: host_id,
      snapshot: snapshot
    }
  end

  def execute(
        %Host{deregistered_at: deregistered_at},
        _
      )
      when not is_nil(deregistered_at) do
    {:error, :host_not_registered}
  end

  # Host exists but details didn't change
  def execute(
        %Host{
          hostname: hostname,
          ip_addresses: ip_addresses,
          agent_version: agent_version,
          cpu_count: cpu_count,
          total_memory_mb: total_memory_mb,
          socket_count: socket_count,
          os_version: os_version,
          installation_source: installation_source
        },
        %RegisterHost{
          hostname: hostname,
          ip_addresses: ip_addresses,
          agent_version: agent_version,
          cpu_count: cpu_count,
          total_memory_mb: total_memory_mb,
          socket_count: socket_count,
          os_version: os_version,
          installation_source: installation_source
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
          agent_version: agent_version,
          cpu_count: cpu_count,
          total_memory_mb: total_memory_mb,
          socket_count: socket_count,
          os_version: os_version,
          installation_source: installation_source
        }
      ) do
    %HostDetailsUpdated{
      host_id: host_id,
      hostname: hostname,
      ip_addresses: ip_addresses,
      agent_version: agent_version,
      cpu_count: cpu_count,
      total_memory_mb: total_memory_mb,
      socket_count: socket_count,
      os_version: os_version,
      installation_source: installation_source
    }
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

  def execute(
        %Host{host_id: host_id},
        %RequestHostDeregistration{requested_at: requested_at}
      ) do
    %HostDeregistrationRequested{
      host_id: host_id,
      requested_at: requested_at
    }
  end

  def execute(
        %Host{host_id: host_id},
        %DeregisterHost{deregistered_at: deregistered_at}
      ) do
    [
      %HostDeregistered{
        host_id: host_id,
        deregistered_at: deregistered_at
      },
      %HostTombstoned{
        host_id: host_id
      }
    ]
  end

  def apply(
        %Host{} = host,
        %HostRegistered{
          host_id: host_id,
          hostname: hostname,
          ip_addresses: ip_addresses,
          agent_version: agent_version,
          cpu_count: cpu_count,
          total_memory_mb: total_memory_mb,
          socket_count: socket_count,
          os_version: os_version,
          installation_source: installation_source,
          heartbeat: heartbeat
        }
      ) do
    %Host{
      host
      | host_id: host_id,
        hostname: hostname,
        ip_addresses: ip_addresses,
        agent_version: agent_version,
        cpu_count: cpu_count,
        total_memory_mb: total_memory_mb,
        socket_count: socket_count,
        os_version: os_version,
        installation_source: installation_source,
        heartbeat: heartbeat
    }
  end

  def apply(
        %Host{} = host,
        %HostDetailsUpdated{
          hostname: hostname,
          ip_addresses: ip_addresses,
          agent_version: agent_version,
          cpu_count: cpu_count,
          total_memory_mb: total_memory_mb,
          socket_count: socket_count,
          os_version: os_version,
          installation_source: installation_source
        }
      ) do
    %Host{
      host
      | hostname: hostname,
        ip_addresses: ip_addresses,
        agent_version: agent_version,
        cpu_count: cpu_count,
        total_memory_mb: total_memory_mb,
        socket_count: socket_count,
        os_version: os_version,
        installation_source: installation_source
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

  # Aggregate to rolling up state
  def apply(%Host{} = host, %HostRollUpRequested{}) do
    %Host{host | rolling_up: true}
  end

  # Hydrate the aggregate with a rollup snapshot after rollup ends
  def apply(%Host{}, %HostRolledUp{
        snapshot: snapshot
      }) do
    snapshot
  end

  # Deregistration

  def apply(%Host{} = host, %HostDeregistered{
        deregistered_at: deregistered_at
      }) do
    %Host{host | deregistered_at: deregistered_at}
  end

  def apply(%Host{} = host, %HostDeregistrationRequested{}), do: host
  def apply(%Host{} = host, %HostTombstoned{}), do: host

  # Restoration
  def apply(%Host{} = host, %HostRestored{}) do
    %Host{host | deregistered_at: nil}
  end
end
