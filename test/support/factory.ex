defmodule Trento.Factory do
  @moduledoc """
  A simple Factory helper module to be used within tests to generate test data
  """

  alias Trento.Repo

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
    RegisterDatabaseInstance
  }

  alias Trento.{
    ApplicationInstanceReadModel,
    CheckResultReadModel,
    ClusterReadModel,
    DatabaseInstanceReadModel,
    DatabaseReadModel,
    HostReadModel,
    HostTelemetryReadModel,
    SapSystemReadModel,
    SlesSubscriptionReadModel,
    Tag
  }

  alias Trento.Integration.Discovery.DiscoveryEvent

  def host_registered_event(attrs \\ []) do
    %HostRegistered{
      host_id: Keyword.get(attrs, :host_id, Faker.UUID.v4()),
      hostname: Keyword.get(attrs, :hostname, Faker.StarWars.character()),
      ip_addresses: Keyword.get(attrs, :ip_addresses, [Faker.Internet.ip_v4_address()]),
      ssh_address: Keyword.get(attrs, :ssh_address, Faker.Internet.ip_v4_address()),
      agent_version: Keyword.get(attrs, :agent_version, Faker.App.semver()),
      cpu_count: Keyword.get(attrs, :cpu_count, Enum.random(1..16)),
      total_memory_mb: Keyword.get(attrs, :total_memory_mb, Enum.random(1..128)),
      socket_count: Keyword.get(attrs, :socket_count, Enum.random(1..16)),
      os_version: Keyword.get(attrs, :agent_version, Faker.App.semver()),
      heartbeat: :unknown
    }
  end

  def host_details_updated_event(attrs \\ []) do
    %HostDetailsUpdated{
      host_id: Keyword.get(attrs, :host_id, Faker.UUID.v4()),
      hostname: Keyword.get(attrs, :hostname, Faker.StarWars.character()),
      ip_addresses: Keyword.get(attrs, :ip_addresses, [Faker.Internet.ip_v4_address()]),
      ssh_address: Keyword.get(attrs, :ssh_address, Faker.Internet.ip_v4_address()),
      agent_version: Keyword.get(attrs, :agent_version, Faker.App.semver()),
      cpu_count: Keyword.get(attrs, :cpu_count, Enum.random(1..16)),
      total_memory_mb: Keyword.get(attrs, :total_memory_mb, Enum.random(1..128)),
      socket_count: Keyword.get(attrs, :socket_count, Enum.random(1..16)),
      os_version: Keyword.get(attrs, :agent_version, Faker.App.semver())
    }
  end

  def host_projection(attrs \\ []) do
    Repo.insert!(%HostReadModel{
      id: Keyword.get(attrs, :id, Faker.UUID.v4()),
      hostname: Keyword.get(attrs, :hostname, Faker.StarWars.character()),
      ip_addresses: [Faker.Internet.ip_v4_address()],
      ssh_address: Faker.Internet.ip_v4_address(),
      agent_version: Faker.StarWars.planet(),
      cluster_id: Keyword.get(attrs, :cluster_id, Faker.UUID.v4()),
      heartbeat: :unknown
    })
  end

  def cluster_registered_event(attrs \\ []) do
    %ClusterRegistered{
      cluster_id: Keyword.get(attrs, :cluster_id, Faker.UUID.v4()),
      name: Keyword.get(attrs, :name, Faker.StarWars.character()),
      sid: Keyword.get(attrs, :sid, Faker.StarWars.planet()),
      details: Keyword.get(attrs, :details, hana_cluster_details_value_object()),
      type: Keyword.get(attrs, :type, :hana_scale_up)
    }
  end

  def host_added_to_cluster_event(attrs \\ []) do
    %HostAddedToCluster{
      cluster_id: Keyword.get(attrs, :cluster_id, Faker.UUID.v4()),
      host_id: Keyword.get(attrs, :host_id, Faker.UUID.v4())
    }
  end

  def subscription_projection(attrs \\ []) do
    host_projection = host_projection(id: Keyword.get(attrs, :host_id, Faker.UUID.v4()))

    Repo.insert!(%SlesSubscriptionReadModel{
      host_id: host_projection.id,
      identifier: Keyword.get(attrs, :identifier, Faker.Airports.iata()),
      version: Keyword.get(attrs, :version, Faker.App.semver())
    })
  end

  def host_telemetry_projection(attrs \\ []) do
    Repo.insert!(%HostTelemetryReadModel{
      agent_id: Keyword.get(attrs, :agent_id, Faker.UUID.v4()),
      hostname: Keyword.get(attrs, :hostname, Faker.StarWars.character()),
      cpu_count: Keyword.get(attrs, :cpu_usage, Enum.random(0..100)),
      socket_count: Keyword.get(attrs, :memory_usage, Enum.random(0..100)),
      total_memory_mb: Keyword.get(attrs, :total_memory_mb, Enum.random(0..100)),
      sles_version: Keyword.get(attrs, :total_memory_mb, Faker.App.version())
    })
  end

  def cluster_projection(attrs \\ []) do
    Repo.insert!(%ClusterReadModel{
      id: Keyword.get(attrs, :id, Faker.UUID.v4()),
      name: Keyword.get(attrs, :name, Faker.StarWars.character()),
      sid: Keyword.get(attrs, :sid, Faker.StarWars.planet()),
      type: Keyword.get(attrs, :type, :hana_scale_up),
      health: Keyword.get(attrs, :health, :passing)
    })
  end

  def subscriptions_updated_event(attrs \\ []) do
    host_id = Keyword.get(attrs, :host_id, Faker.UUID.v4())

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

  def database_instance_registered_event(attrs \\ []) do
    %DatabaseInstanceRegistered{
      sap_system_id: Keyword.get(attrs, :sap_system_id, Faker.UUID.v4()),
      sid: Keyword.get(attrs, :sid, Faker.UUID.v4()),
      tenant: Keyword.get(attrs, :tenant, Faker.UUID.v4()),
      instance_number: Keyword.get(attrs, :instance_number, "00"),
      instance_hostname: Keyword.get(attrs, :instance_hostname, "an-instance-name"),
      features: Keyword.get(attrs, :features, Faker.Pokemon.name()),
      http_port: Keyword.get(attrs, :http_port, 8080),
      https_port: Keyword.get(attrs, :https_port, 8443),
      start_priority: Keyword.get(attrs, :start_priority, "0.3"),
      host_id: Keyword.get(attrs, :host_id, Faker.UUID.v4()),
      health: Keyword.get(attrs, :health, :passing)
    }
  end

  def application_instance_registered_event(attrs \\ []) do
    %ApplicationInstanceRegistered{
      sap_system_id: Keyword.get(attrs, :sap_system_id, Faker.UUID.v4()),
      sid: Keyword.get(attrs, :sid, Faker.UUID.v4()),
      instance_number: Keyword.get(attrs, :instance_number, "00"),
      instance_hostname: Keyword.get(attrs, :instance_hostname, "an-instance-name"),
      features: Keyword.get(attrs, :features, Faker.Pokemon.name()),
      http_port: Keyword.get(attrs, :http_port, 8080),
      https_port: Keyword.get(attrs, :https_port, 8443),
      start_priority: Keyword.get(attrs, :start_priority, "0.3"),
      host_id: Keyword.get(attrs, :host_id, Faker.UUID.v4()),
      health: Keyword.get(attrs, :health, :passing)
    }
  end

  def database_registered_event(attrs \\ []) do
    %DatabaseRegistered{
      sap_system_id: Keyword.get(attrs, :sap_system_id, Faker.UUID.v4()),
      sid: Keyword.get(attrs, :sid, Faker.UUID.v4()),
      health: Keyword.get(attrs, :health, :passing)
    }
  end

  def sap_system_registered_event(attrs \\ []) do
    %SapSystemRegistered{
      sap_system_id: Keyword.get(attrs, :sap_system_id, Faker.UUID.v4()),
      sid: Keyword.get(attrs, :sid, Faker.UUID.v4()),
      db_host: Faker.Internet.ip_v4_address(),
      tenant: Faker.Beer.hop(),
      health: Keyword.get(attrs, :health, :passing)
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

  def database_projection(attrs \\ []) do
    Repo.insert!(%DatabaseReadModel{
      id: Keyword.get(attrs, :id, Faker.UUID.v4()),
      sid: Keyword.get(attrs, :sid, Faker.StarWars.planet())
    })
  end

  def sap_system_projection(attrs \\ []) do
    Repo.insert!(%SapSystemReadModel{
      id: Keyword.get(attrs, :id, Faker.UUID.v4()),
      sid: Keyword.get(attrs, :sid, Faker.StarWars.planet()),
      tenant: Keyword.get(attrs, :sid, Faker.Beer.hop()),
      db_host: Keyword.get(attrs, :sid, Faker.Internet.ip_v4_address())
    })
  end

  def database_instance_projection_without_host(attrs \\ []) do
    Repo.insert!(%DatabaseInstanceReadModel{
      sap_system_id: Keyword.get(attrs, :sap_system_id, Faker.UUID.v4()),
      sid: Keyword.get(attrs, :sid, Faker.UUID.v4()),
      tenant: Keyword.get(attrs, :tenant, Faker.UUID.v4()),
      instance_number: Keyword.get(attrs, :instance_number, "00"),
      features: Keyword.get(attrs, :features, Faker.Pokemon.name()),
      host_id: Keyword.get(attrs, :host_id, Faker.UUID.v4())
    })
  end

  def database_instance_projection(attrs \\ []) do
    host_projection = host_projection()

    Repo.insert!(%DatabaseInstanceReadModel{
      sap_system_id: Keyword.get(attrs, :sap_system_id, Faker.UUID.v4()),
      sid: Keyword.get(attrs, :sid, Faker.UUID.v4()),
      tenant: Keyword.get(attrs, :tenant, Faker.UUID.v4()),
      instance_number: Keyword.get(attrs, :instance_number, "00"),
      features: Keyword.get(attrs, :features, Faker.Pokemon.name()),
      host_id: host_projection.id,
      host: host_projection
    })
  end

  def application_instance_projection_without_host(attrs \\ []) do
    Repo.insert!(%ApplicationInstanceReadModel{
      sap_system_id: Keyword.get(attrs, :sap_system_id, Faker.UUID.v4()),
      sid: Keyword.get(attrs, :sid, Faker.UUID.v4()),
      instance_number: Keyword.get(attrs, :instance_number, "00"),
      features: Keyword.get(attrs, :features, Faker.Pokemon.name()),
      host_id: Keyword.get(attrs, :host_id, Faker.UUID.v4())
    })
  end

  def application_instance_projection(attrs \\ []) do
    host_projection = host_projection()

    Repo.insert!(%ApplicationInstanceReadModel{
      sap_system_id: Keyword.get(attrs, :sap_system_id, Faker.UUID.v4()),
      sid: Keyword.get(attrs, :sid, Faker.UUID.v4()),
      instance_number: Keyword.get(attrs, :instance_number, "00"),
      features: Keyword.get(attrs, :features, Faker.Pokemon.name()),
      host_id: host_projection.id,
      host: host_projection
    })
  end

  def discovery_event(attrs \\ []) do
    Repo.insert!(%DiscoveryEvent{
      agent_id: Keyword.get(attrs, :agent_id, Faker.UUID.v4()),
      discovery_type: Keyword.get(attrs, :discovery_type, Faker.Pokemon.name()),
      payload: Keyword.get(attrs, :payload, %{})
    })
  end

  def tag(attrs \\ []) do
    Repo.insert!(%Tag{
      value: Keyword.get(attrs, :value, Faker.Beer.hop()),
      resource_id: Keyword.get(attrs, :resource_id, Faker.UUID.v4()),
      resource_type: Keyword.get(attrs, :resource_type, "resource")
    })
  end

  def register_application_instance_command(attrs \\ []) do
    RegisterApplicationInstance.new!(%{
      sap_system_id: Keyword.get(attrs, :sap_system_id, Faker.UUID.v4()),
      sid: Keyword.get(attrs, :sid, Faker.StarWars.planet()),
      db_host: Keyword.get(attrs, :db_host, Faker.Internet.ip_v4_address()),
      tenant: Keyword.get(attrs, :tenant, Faker.Beer.hop()),
      instance_number: Keyword.get(attrs, :instance_number, "00"),
      instance_hostname: Keyword.get(attrs, :instance_hostname, "an-instance-name"),
      features: Keyword.get(attrs, :features, Faker.Pokemon.name()),
      http_port: Keyword.get(attrs, :http_port, 8080),
      https_port: Keyword.get(attrs, :https_port, 8443),
      start_priority: Keyword.get(attrs, :start_priority, "0.3"),
      host_id: Keyword.get(attrs, :host_id, Faker.UUID.v4()),
      health: Keyword.get(attrs, :health, :passing)
    })
  end

  def register_database_instance_command(attrs \\ []) do
    RegisterDatabaseInstance.new!(%{
      sap_system_id: Keyword.get(attrs, :sap_system_id, Faker.UUID.v4()),
      sid: Keyword.get(attrs, :sid, Faker.StarWars.planet()),
      tenant: Keyword.get(attrs, :tenant, Faker.Beer.hop()),
      instance_number: Keyword.get(attrs, :instance_number, "00"),
      instance_hostname: Keyword.get(attrs, :instance_hostname, "an-instance-name"),
      features: Keyword.get(attrs, :features, Faker.Pokemon.name()),
      http_port: Keyword.get(attrs, :http_port, 8080),
      https_port: Keyword.get(attrs, :https_port, 8443),
      start_priority: Keyword.get(attrs, :start_priority, "0.3"),
      host_id: Keyword.get(attrs, :host_id, Faker.UUID.v4()),
      health: Keyword.get(attrs, :health, :passing)
    })
  end

  def checks_execution_requested_event(attrs \\ []) do
    %ChecksExecutionRequested{
      cluster_id: Keyword.get(attrs, :cluster_id, Faker.UUID.v4()),
      hosts: Keyword.get(attrs, :hosts, [Faker.UUID.v4()]),
      checks: Keyword.get(attrs, :checks, Enum.map(0..4, fn _ -> Faker.UUID.v4() end))
    }
  end

  def check_result_projection(attrs \\ []) do
    Repo.insert!(%CheckResultReadModel{
      cluster_id: Keyword.get(attrs, :cluster_id, Faker.UUID.v4()),
      host_id: Keyword.get(attrs, :host_id, Faker.UUID.v4()),
      check_id: Keyword.get(attrs, :check_id, Faker.UUID.v4()),
      result: Keyword.get(attrs, :result, :passing)
    })
  end
end
