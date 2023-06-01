defmodule Trento.Factory do
  @moduledoc """
  A simple Factory helper module to be used within tests to generate test data
  """

  require Trento.Domain.Enums.Provider, as: Provider
  require Trento.Domain.Enums.ClusterType, as: ClusterType
  require Trento.Domain.Enums.Health, as: Health

  alias Trento.Domain.{
    ClusterResource,
    HanaClusterDetails,
    HanaClusterNode,
    SapSystem,
    SbdDevice,
    SlesSubscription
  }

  alias Trento.Domain.Events.{
    ApplicationInstanceRegistered,
    ClusterRegistered,
    ClusterTombstoned,
    DatabaseInstanceRegistered,
    DatabaseRegistered,
    HostAddedToCluster,
    HostDetailsUpdated,
    HostRegistered,
    HostTombstoned,
    SapSystemRegistered,
    SapSystemTombstoned,
    SlesSubscriptionsUpdated
  }

  alias Trento.Domain.Commands.{
    RegisterApplicationInstance,
    RegisterClusterHost,
    RegisterDatabaseInstance
  }

  alias Trento.{
    ApplicationInstanceReadModel,
    ClusterEnrichmentData,
    ClusterReadModel,
    DatabaseInstanceReadModel,
    DatabaseReadModel,
    Heartbeat,
    HostReadModel,
    HostTelemetryReadModel,
    SapSystemReadModel,
    SlesSubscriptionReadModel,
    Tag
  }

  alias Trento.Integration.Discovery.{
    DiscardedDiscoveryEvent,
    DiscoveryEvent
  }

  use ExMachina.Ecto, repo: Trento.Repo

  def host_registered_event_factory do
    %HostRegistered{
      host_id: Faker.UUID.v4(),
      hostname: Faker.StarWars.character(),
      ip_addresses: [Faker.Internet.ip_v4_address()],
      agent_version: Faker.App.semver(),
      cpu_count: Enum.random(1..16),
      total_memory_mb: Enum.random(1..128),
      socket_count: Enum.random(1..16),
      os_version: Faker.App.semver(),
      installation_source: Enum.random([:community, :suse, :unknown]),
      heartbeat: :unknown
    }
  end

  def host_details_updated_event_factory do
    %HostDetailsUpdated{
      host_id: Faker.UUID.v4(),
      hostname: Faker.StarWars.character(),
      ip_addresses: [Faker.Internet.ip_v4_address()],
      agent_version: Faker.App.semver(),
      cpu_count: Enum.random(1..16),
      total_memory_mb: Enum.random(1..128),
      socket_count: Enum.random(1..16),
      os_version: Faker.App.semver(),
      installation_source: Enum.random([:community, :suse, :unknown])
    }
  end

  def host_factory do
    %HostReadModel{
      id: Faker.UUID.v4(),
      hostname: Faker.StarWars.character(),
      ip_addresses: [Faker.Internet.ip_v4_address()],
      agent_version: Faker.StarWars.planet(),
      cluster_id: Faker.UUID.v4(),
      heartbeat: :unknown,
      provider: Enum.random(Provider.values()),
      provider_data: nil
    }
  end

  def heartbeat_factory do
    %Heartbeat{
      agent_id: Faker.UUID.v4(),
      timestamp: DateTime.utc_now()
    }
  end

  def register_cluster_host_factory do
    %RegisterClusterHost{
      cluster_id: Faker.UUID.v4(),
      host_id: Faker.UUID.v4(),
      name: Faker.StarWars.character(),
      sid: Faker.StarWars.planet(),
      additional_sids: [],
      provider: Enum.random(Provider.values()),
      resources_number: 8,
      hosts_number: 2,
      details: hana_cluster_details_value_object(),
      type: ClusterType.hana_scale_up(),
      discovered_health: Health.passing(),
      designated_controller: true
    }
  end

  def cluster_registered_event_factory do
    %ClusterRegistered{
      cluster_id: Faker.UUID.v4(),
      name: Faker.StarWars.character(),
      sid: Faker.StarWars.planet(),
      additional_sids: [],
      provider: Enum.random(Provider.values()),
      resources_number: 8,
      hosts_number: 2,
      details: hana_cluster_details_value_object(),
      health: Health.passing(),
      type: ClusterType.hana_scale_up()
    }
  end

  def host_added_to_cluster_event_factory do
    %HostAddedToCluster{
      cluster_id: Faker.UUID.v4(),
      host_id: Faker.UUID.v4()
    }
  end

  def sles_subscription_factory do
    host = build(:host)

    %SlesSubscriptionReadModel{
      host_id: host.id,
      identifier: Faker.Airports.iata(),
      version: Faker.App.semver(),
      expires_at: DateTime.to_iso8601(Faker.DateTime.forward(2)),
      starts_at: DateTime.to_iso8601(Faker.DateTime.backward(2)),
      subscription_status: "ACTIVE",
      status: "Registered",
      type: "internal",
      arch: "x86_64"
    }
  end

  def host_telemetry_factory do
    %HostTelemetryReadModel{
      agent_id: Faker.UUID.v4(),
      hostname: Faker.StarWars.character(),
      cpu_count: Enum.random(0..100),
      socket_count: Enum.random(0..100),
      total_memory_mb: Enum.random(0..100),
      sles_version: Faker.App.version(),
      installation_source: Enum.random([:community, :suse, :unknown])
    }
  end

  def cluster_factory do
    %ClusterReadModel{
      id: Faker.UUID.v4(),
      name: Faker.StarWars.character(),
      sid: Faker.StarWars.planet(),
      additional_sids: [],
      provider: Enum.random(Provider.values()),
      type: ClusterType.hana_scale_up(),
      health: Health.passing(),
      selected_checks: Enum.map(0..4, fn _ -> Faker.StarWars.planet() end)
    }
  end

  def cluster_enrichment_data_factory do
    %ClusterEnrichmentData{
      cluster_id: Faker.UUID.v4(),
      cib_last_written: Date.to_string(Faker.Date.forward(0))
    }
  end

  def subscriptions_updated_event_factory do
    host_id = Faker.UUID.v4()

    %SlesSubscriptionsUpdated{
      host_id: host_id,
      subscriptions: [
        %SlesSubscription{
          host_id: host_id,
          identifier: Faker.StarWars.planet(),
          version: Faker.StarWars.character(),
          arch: "x86_64",
          status: "active"
        }
      ]
    }
  end

  def database_instance_registered_event_factory do
    %DatabaseInstanceRegistered{
      sap_system_id: Faker.UUID.v4(),
      sid: Faker.UUID.v4(),
      tenant: Faker.UUID.v4(),
      instance_number: "00",
      instance_hostname: "an-instance-name",
      features: Faker.Pokemon.name(),
      http_port: 8080,
      https_port: 8443,
      start_priority: "0.3",
      host_id: Faker.UUID.v4(),
      system_replication: "Primary",
      system_replication_status: "ACTIVE",
      health: Health.passing()
    }
  end

  def application_instance_registered_event_factory do
    %ApplicationInstanceRegistered{
      sap_system_id: Faker.UUID.v4(),
      sid: Faker.UUID.v4(),
      instance_number: "00",
      instance_hostname: "an-instance-name",
      features: Faker.Pokemon.name(),
      http_port: 8080,
      https_port: 8443,
      start_priority: "0.3",
      host_id: Faker.UUID.v4(),
      health: Health.passing()
    }
  end

  def database_registered_event_factory do
    %DatabaseRegistered{
      sap_system_id: Faker.UUID.v4(),
      sid: Faker.UUID.v4(),
      health: Health.passing()
    }
  end

  def sap_system_registered_event_factory do
    %SapSystemRegistered{
      sap_system_id: Faker.UUID.v4(),
      sid: Faker.UUID.v4(),
      db_host: Faker.Internet.ip_v4_address(),
      tenant: Faker.Beer.hop(),
      health: Health.passing()
    }
  end

  def hana_cluster_details_value_object do
    %HanaClusterDetails{
      fencing_type: "external/sbd",
      nodes: [
        %HanaClusterNode{
          attributes: %{"attribute" => Faker.Beer.name()},
          hana_status: "Secondary",
          name: Faker.StarWars.character(),
          resources: [
            %ClusterResource{
              fail_count: Enum.random(0..100),
              id: Faker.Pokemon.name(),
              role: "Started",
              status: "Active",
              type: "ocf::heartbeat:Dummy"
            }
          ],
          site: Faker.StarWars.planet()
        }
      ],
      sbd_devices: [
        %SbdDevice{
          device: "/dev/vdc",
          status: "healthy"
        }
      ],
      secondary_sync_state: "SOK",
      sr_health_state: "4",
      stopped_resources: [
        %ClusterResource{
          fail_count: nil,
          id: Faker.Pokemon.name(),
          role: "Stopped",
          status: nil,
          type: "ocf::heartbeat:Dummy"
        }
      ],
      system_replication_mode: "sync",
      system_replication_operation_mode: "logreplay"
    }
  end

  def database_factory do
    %DatabaseReadModel{
      id: Faker.UUID.v4(),
      sid: Faker.StarWars.planet()
    }
  end

  def sap_system_factory do
    %SapSystemReadModel{
      id: Faker.UUID.v4(),
      sid: Faker.StarWars.planet(),
      tenant: Faker.Beer.hop(),
      db_host: Faker.Internet.ip_v4_address(),
      health: Health.unknown(),
      deregistered_at: nil
    }
  end

  def database_instance_without_host_factory do
    %DatabaseInstanceReadModel{
      sap_system_id: Faker.UUID.v4(),
      sid: Faker.UUID.v4(),
      tenant: Faker.UUID.v4(),
      instance_number: "00",
      features: Faker.Pokemon.name(),
      host_id: Faker.UUID.v4(),
      system_replication: "",
      system_replication_status: "",
      health: Health.unknown()
    }
  end

  def database_instance_factory do
    host = build(:host)
    build(:database_instance_without_host, host_id: host.id, host: host)
  end

  def application_instance_without_host_factory do
    %ApplicationInstanceReadModel{
      sap_system_id: Faker.UUID.v4(),
      sid: Faker.UUID.v4(),
      instance_number: "00",
      features: Faker.Pokemon.name(),
      host_id: Faker.UUID.v4(),
      health: Health.unknown()
    }
  end

  def application_instance_factory do
    host = build(:host)
    build(:application_instance_without_host, host_id: host.id, host: host)
  end

  def sap_system_instance_factory do
    %SapSystem.Instance{
      sid: Faker.UUID.v4(),
      instance_number: String.pad_leading(sequence(:instance_number, &"#{&1}"), 2, "0"),
      features: Faker.Pokemon.name(),
      host_id: Faker.UUID.v4(),
      health: Health.passing()
    }
  end

  def discovery_event_factory do
    %DiscoveryEvent{
      agent_id: Faker.UUID.v4(),
      discovery_type: Faker.Pokemon.name(),
      payload: %{},
      inserted_at: DateTime.utc_now()
    }
  end

  def discarded_discovery_event_factory do
    %DiscardedDiscoveryEvent{
      payload: %{},
      reason: Faker.Beer.hop(),
      inserted_at: DateTime.utc_now()
    }
  end

  def tag_factory do
    %Tag{
      value: sequence(:value, &"#{Faker.Beer.hop()}0#{&1}"),
      resource_id: Faker.UUID.v4(),
      resource_type: :host
    }
  end

  def register_application_instance_command_factory do
    RegisterApplicationInstance.new!(%{
      sap_system_id: Faker.UUID.v4(),
      sid: Faker.StarWars.planet(),
      db_host: Faker.Internet.ip_v4_address(),
      tenant: Faker.Beer.hop(),
      instance_number: "00",
      instance_hostname: "an-instance-name",
      features: Faker.Pokemon.name(),
      http_port: 8080,
      https_port: 8443,
      start_priority: "0.3",
      host_id: Faker.UUID.v4(),
      health: Health.passing()
    })
  end

  def register_database_instance_command_factory do
    RegisterDatabaseInstance.new!(%{
      sap_system_id: Faker.UUID.v4(),
      sid: Faker.StarWars.planet(),
      tenant: Faker.Beer.hop(),
      instance_number: "00",
      instance_hostname: "an-instance-name",
      features: Faker.Pokemon.name(),
      http_port: 8080,
      https_port: 8443,
      start_priority: "0.3",
      host_id: Faker.UUID.v4(),
      system_replication: "Primary",
      system_replication_status: "ACTIVE",
      health: Health.passing()
    })
  end

  def cib_resource_factory do
    %{
      "Id" => Faker.UUID.v4(),
      "Type" => Faker.StarWars.planet(),
      "Class" => "ocf",
      "Provider" => "heartbeat",
      "Operations" => [],
      "MetaAttributes" => %{},
      "InstanceAttributes" => []
    }
  end

  def crm_resource_factory do
    %{
      "Id" => Faker.UUID.v4(),
      "Node" => %{
        "Id" => "1",
        "Name" => Faker.StarWars.planet(),
        "Cached" => true
      },
      "Role" => "Started",
      "Agent" => Faker.Pokemon.name(),
      "Active" => true,
      "Failed" => false,
      "Blocked" => false,
      "Managed" => true,
      "Orphaned" => false,
      "FailureIgnored" => false,
      "NodesRunningOn" => 1
    }
  end

  def host_tombstoned_event_factory do
    HostTombstoned.new!(%{
      host_id: Faker.UUID.v4()
    })
  end

  def cluster_tombstoned_event_factory do
    ClusterTombstoned.new!(%{
      cluster_id: Faker.UUID.v4()
    })
  end

  def sap_system_tombstoned_event_factory do
    SapSystemTombstoned.new!(%{
      sap_system_id: Faker.UUID.v4()
    })
  end
end
