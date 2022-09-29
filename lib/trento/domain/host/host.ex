defmodule Trento.Domain.Host do
  @moduledoc false

  require Trento.Domain.Enums.Provider, as: Provider

  alias Trento.Domain.Host

  alias Trento.Domain.{
    AwsProvider,
    AzureProvider,
    GcpProvider,
    SlesSubscription
  }

  alias Trento.Domain.Commands.{
    RegisterHost,
    UpdateHeartbeat,
    UpdateProvider,
    UpdateSlesSubscriptions
  }

  alias Trento.Domain.Events.{
    HeartbeatFailed,
    HeartbeatSucceded,
    HostDetailsUpdated,
    HostRegistered,
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
    field :ssh_address, :string
    field :agent_version, :string
    field :cpu_count, :integer
    field :total_memory_mb, :integer
    field :socket_count, :integer
    field :os_version, :string
    field :provider, Ecto.Enum, values: Provider.values()
    field :installation_source, Ecto.Enum, values: [:community, :suse, :unknown]
    field :heartbeat, Ecto.Enum, values: [:passing, :critical, :unknown]

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

  # New host registered
  def execute(
        %Host{host_id: nil},
        %RegisterHost{
          host_id: host_id,
          hostname: hostname,
          ip_addresses: ip_addresses,
          ssh_address: ssh_address,
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
      ssh_address: ssh_address,
      agent_version: agent_version,
      cpu_count: cpu_count,
      total_memory_mb: total_memory_mb,
      socket_count: socket_count,
      os_version: os_version,
      installation_source: installation_source,
      heartbeat: :unknown
    }
  end

  # Host exists but details didn't change
  def execute(
        %Host{
          hostname: hostname,
          ip_addresses: ip_addresses,
          ssh_address: ssh_address,
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
          ssh_address: ssh_address,
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
          ssh_address: ssh_address,
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
      ssh_address: ssh_address,
      agent_version: agent_version,
      cpu_count: cpu_count,
      total_memory_mb: total_memory_mb,
      socket_count: socket_count,
      os_version: os_version,
      installation_source: installation_source
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
          ssh_address: ssh_address,
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
        ssh_address: ssh_address,
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
          ssh_address: ssh_address,
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
        ssh_address: ssh_address,
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
end
