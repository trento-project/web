defmodule Trento.Factory do
  @moduledoc """
  A simple Factory helper module to be used within tests to generate test data
  """

  alias Trento.Domain.{
    ClusterNode,
    ClusterResource,
    HanaClusterDetails,
    SbdDevice,
    SlesSubscription
  }

  alias Trento.Domain.Events.{
    ApplicationInstanceRegistered,
    ChecksExecutionRequested,
    ClusterRegistered,
    DatabaseInstanceRegistered,
    DatabaseRegistered,
    HostAddedToCluster,
    HostDetailsUpdated,
    HostRegistered,
    SapSystemRegistered,
    SlesSubscriptionsUpdated
  }

  alias Trento.Domain.Commands.{
    RegisterApplicationInstance,
    RegisterClusterHost,
    RegisterDatabaseInstance
  }

  alias Trento.{
    ApplicationInstanceReadModel,
    CheckResultReadModel,
    ClusterReadModel,
    DatabaseInstanceReadModel,
    DatabaseReadModel,
    HostChecksExecutionsReadModel,
    HostConnectionSettings,
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
      ssh_address: Faker.Internet.ip_v4_address(),
      agent_version: Faker.App.semver(),
      cpu_count: Enum.random(1..16),
      total_memory_mb: Enum.random(1..128),
      socket_count: Enum.random(1..16),
      os_version: Faker.App.semver(),
      heartbeat: :unknown
    }
  end

  def host_details_updated_event_factory do
    %HostDetailsUpdated{
      host_id: Faker.UUID.v4(),
      hostname: Faker.StarWars.character(),
      ip_addresses: [Faker.Internet.ip_v4_address()],
      ssh_address: Faker.Internet.ip_v4_address(),
      agent_version: Faker.App.semver(),
      cpu_count: Enum.random(1..16),
      total_memory_mb: Enum.random(1..128),
      socket_count: Enum.random(1..16),
      os_version: Faker.App.semver()
    }
  end

  def host_factory do
    %HostReadModel{
      id: Faker.UUID.v4(),
      hostname: Faker.StarWars.character(),
      ip_addresses: [Faker.Internet.ip_v4_address()],
      ssh_address: Faker.Internet.ip_v4_address(),
      agent_version: Faker.StarWars.planet(),
      cluster_id: Faker.UUID.v4(),
      heartbeat: :unknown,
      provider: :unknown,
      provider_data: nil
    }
  end

  def host_connection_settings_factory do
    %HostConnectionSettings{
      id: Faker.UUID.v4(),
      user: Faker.StarWars.character()
    }
  end

  def register_cluster_host_factory do
    %RegisterClusterHost{
      cluster_id: Faker.UUID.v4(),
      host_id: Faker.UUID.v4(),
      name: Faker.StarWars.character(),
      sid: Faker.StarWars.planet(),
      provider: :azure,
      resources_number: 8,
      hosts_number: 2,
      details: hana_cluster_details_value_object(),
      type: :hana_scale_up,
      discovered_health: :passing,
      designated_controller: true,
      cib_last_written: Date.to_string(Faker.Date.forward(0))
    }
  end

  def cluster_registered_event_factory do
    %ClusterRegistered{
      cluster_id: Faker.UUID.v4(),
      name: Faker.StarWars.character(),
      sid: Faker.StarWars.planet(),
      provider: :azure,
      resources_number: 8,
      hosts_number: 2,
      details: hana_cluster_details_value_object(),
      health: :passing,
      type: :hana_scale_up,
      cib_last_written: Date.to_string(Faker.Date.forward(0))
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
      version: Faker.App.semver()
    }
  end

  def host_telemetry_factory do
    %HostTelemetryReadModel{
      agent_id: Faker.UUID.v4(),
      hostname: Faker.StarWars.character(),
      cpu_count: Enum.random(0..100),
      socket_count: Enum.random(0..100),
      total_memory_mb: Enum.random(0..100),
      sles_version: Faker.App.version()
    }
  end

  def cluster_factory do
    %ClusterReadModel{
      id: Faker.UUID.v4(),
      name: Faker.StarWars.character(),
      sid: Faker.StarWars.planet(),
      provider: :azure,
      type: :hana_scale_up,
      health: :passing
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
      health: :passing
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
      health: :passing
    }
  end

  def database_registered_event_factory do
    %DatabaseRegistered{
      sap_system_id: Faker.UUID.v4(),
      sid: Faker.UUID.v4(),
      health: :passing
    }
  end

  def sap_system_registered_event_factory do
    %SapSystemRegistered{
      sap_system_id: Faker.UUID.v4(),
      sid: Faker.UUID.v4(),
      db_host: Faker.Internet.ip_v4_address(),
      tenant: Faker.Beer.hop(),
      health: :passing
    }
  end

  def hana_cluster_details_value_object do
    %HanaClusterDetails{
      fencing_type: "external/sbd",
      nodes: [
        %ClusterNode{
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
      health: :unknown
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
      health: :unknown
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
      health: :unknown
    }
  end

  def application_instance_factory do
    host = build(:host)
    build(:application_instance_without_host_factory, host_id: host.id, host: host)
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
      value: Faker.Beer.hop(),
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
      health: :passing
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
      health: :passing
    })
  end

  def checks_execution_requested_event_factory do
    %ChecksExecutionRequested{
      cluster_id: Faker.UUID.v4(),
      hosts: [Faker.UUID.v4()],
      checks: Enum.map(0..4, fn _ -> Faker.UUID.v4() end)
    }
  end

  def check_result_factory do
    %CheckResultReadModel{
      cluster_id: Faker.UUID.v4(),
      host_id: Faker.UUID.v4(),
      check_id: Faker.UUID.v4(),
      result: :passing
    }
  end

  def host_checks_result_factory do
    %HostChecksExecutionsReadModel{
      cluster_id: Faker.UUID.v4(),
      host_id: Faker.UUID.v4(),
      reachable: true,
      msg: Faker.StarWars.planet()
    }
  end

  def sap_system_with_cluster_and_hosts do
    %ClusterReadModel{id: cluster_id} = insert(:cluster, type: :hana_scale_up, health: :passing)

    %ClusterReadModel{id: another_cluster_id} =
      insert(:cluster, type: :hana_scale_up, health: :warning)

    %HostReadModel{id: host_1_id} = insert(:host, cluster_id: cluster_id, heartbeat: :unknown)

    %HostReadModel{id: host_2_id} =
      insert(:host, cluster_id: another_cluster_id, heartbeat: :passing)

    database_sid = "HDD"

    %SapSystemReadModel{
      id: sap_system_id,
      sid: sid
    } = insert(:sap_system, health: :passing)

    insert(
      :database_instance_without_host,
      sap_system_id: sap_system_id,
      sid: database_sid,
      host_id: host_1_id,
      health: :warning
    )

    insert(
      :database_instance_without_host,
      sap_system_id: sap_system_id,
      sid: database_sid,
      host_id: host_2_id,
      health: :critical
    )

    insert(
      :application_instance_without_host,
      sap_system_id: sap_system_id,
      sid: sid,
      host_id: host_1_id,
      health: :passing
    )

    insert(
      :application_instance_without_host,
      sap_system_id: sap_system_id,
      sid: sid,
      host_id: host_2_id,
      health: :warning
    )

    %{
      sap_system_id: sap_system_id,
      sid: sid
    }
  end
end
