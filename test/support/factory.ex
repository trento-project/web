defmodule Trento.Factory do
  @moduledoc """
  A simple Factory helper module to be used within tests to generate test data
  """

  require Trento.Enums.Provider, as: Provider
  require Trento.Clusters.Enums.ClusterType, as: ClusterType
  require Trento.Clusters.Enums.ClusterHostStatus, as: ClusterHostStatus
  require Trento.Clusters.Enums.HanaArchitectureType, as: HanaArchitectureType
  require Trento.SapSystems.Enums.EnsaVersion, as: EnsaVersion
  require Trento.Enums.Health, as: Health
  require Trento.Hosts.Enums.Architecture, as: Architecture
  require Trento.SoftwareUpdates.Enums.AdvisoryType, as: AdvisoryType
  require Trento.SoftwareUpdates.Enums.SoftwareUpdatesHealth, as: SoftwareUpdatesHealth
  require Trento.ActivityLog.RetentionPeriodUnit, as: RetentionPeriodUnit
  require Trento.Clusters.Enums.HanaScenario, as: HanaScenario
  require Trento.Clusters.Enums.SapInstanceResourceType, as: SapInstanceResourceType

  alias Faker.Random.Elixir, as: RandomElixir

  alias Trento.Clusters.ValueObjects.{
    AscsErsClusterDetails,
    AscsErsClusterNode,
    AscsErsClusterSapSystem,
    ClusterResource,
    ClusterResourceParent,
    HanaClusterDetails,
    HanaClusterNode,
    HanaClusterSite,
    SapInstance,
    SbdDevice
  }

  alias Trento.Hosts.ValueObjects.{
    SaptuneSolution,
    SaptuneStaging,
    SaptuneStatus,
    SlesSubscription,
    SystemdUnit
  }

  alias Trento.SapSystems.Instance

  alias Trento.Hosts.Events.{
    HeartbeatFailed,
    HeartbeatSucceeded,
    HostChecksHealthChanged,
    HostChecksSelected,
    HostDetailsUpdated,
    HostHealthChanged,
    HostRegistered,
    HostSaptuneHealthChanged,
    HostTombstoned,
    SaptuneStatusUpdated,
    SlesSubscriptionsUpdated,
    SoftwareUpdatesDiscoveryCleared,
    SoftwareUpdatesDiscoveryRequested,
    SoftwareUpdatesHealthChanged
  }

  alias Trento.Databases.Events.{
    DatabaseDeregistered,
    DatabaseHealthChanged,
    DatabaseInstanceDeregistered,
    DatabaseInstanceMarkedAbsent,
    DatabaseInstanceRegistered,
    DatabaseRegistered,
    DatabaseRestored,
    DatabaseTenantsUpdated,
    DatabaseTombstoned
  }

  alias Trento.Databases.ValueObjects.Tenant

  alias Trento.SapSystems.Events.{
    ApplicationInstanceDeregistered,
    ApplicationInstanceMarkedAbsent,
    ApplicationInstanceMoved,
    ApplicationInstanceRegistered,
    SapSystemDeregistered,
    SapSystemHealthChanged,
    SapSystemRegistered,
    SapSystemRestored,
    SapSystemTombstoned
  }

  alias Trento.Clusters.Events.{
    ChecksSelected,
    ClusterChecksHealthChanged,
    ClusterDeregistered,
    ClusterDetailsUpdated,
    ClusterDiscoveredHealthChanged,
    ClusterHealthChanged,
    ClusterRegistered,
    ClusterTombstoned,
    HostAddedToCluster,
    HostRemovedFromCluster
  }

  alias Trento.Hosts.Commands.RegisterHost

  alias Trento.SapSystems.Commands.{
    DeregisterApplicationInstance,
    RegisterApplicationInstance,
    RollUpSapSystem
  }

  alias Trento.Databases.Commands.{
    DeregisterDatabaseInstance,
    RegisterDatabaseInstance
  }

  alias Trento.Clusters.Commands.{
    RegisterOfflineClusterHost,
    RegisterOnlineClusterHost
  }

  alias Trento.Hosts.Projections.{
    HostReadModel,
    SlesSubscriptionReadModel
  }

  alias Trento.Databases.Projections.{
    DatabaseInstanceReadModel,
    DatabaseReadModel
  }

  alias Trento.SapSystems.Projections.{
    ApplicationInstanceReadModel,
    SapSystemReadModel
  }

  alias Trento.Clusters.ClusterEnrichmentData
  alias Trento.Clusters.Projections.ClusterReadModel
  alias Trento.Heartbeats.Heartbeat
  alias Trento.Tags.Tag

  alias Trento.Discovery.{
    DiscardedDiscoveryEvent,
    DiscoveryEvent
  }

  alias Trento.Settings.{
    ActivityLogSettings,
    AlertingSettings,
    ApiKeySettings,
    InstallationSettings,
    SSOCertificatesSettings,
    SuseManagerSettings
  }

  alias Trento.ActivityLog.ActivityLog, as: ActivityLogEntry
  alias Trento.ActivityLog.RetentionTime
  alias Trento.ActivityLog.SeverityLevel

  alias Trento.Abilities.{
    Ability,
    UsersAbilities
  }

  alias Trento.SoftwareUpdates.Discovery.DiscoveryResult

  alias Trento.SoftwareUpdates.Discovery.DiscoveryResult.{
    RelevantPatch,
    UpgradablePackage
  }

  alias Trento.UserIdentities.UserIdentity
  alias Trento.Users.User

  alias Trento.Operations.V1.OperationCompleted

  alias Trento.Checks.V1.{CheckCustomizationApplied, CheckCustomizationReset}

  use ExMachina.Ecto, repo: Trento.Repo

  def host_registered_event_factory do
    %HostRegistered{
      host_id: Faker.UUID.v4(),
      hostname: Faker.StarWars.character(),
      ip_addresses: ["#{Faker.Internet.ip_v4_address()}/#{Enum.random([16, 24, 32])}"],
      agent_version: Faker.App.semver(),
      arch: Enum.random(Architecture.values()),
      cpu_count: Enum.random(1..16),
      total_memory_mb: Enum.random(1..128),
      socket_count: Enum.random(1..16),
      os_version: Faker.App.semver(),
      fully_qualified_domain_name: Faker.Internet.domain_name(),
      installation_source: Enum.random([:community, :suse, :unknown]),
      prometheus_targets: build(:host_prometheus_targets),
      heartbeat: :unknown,
      systemd_units: build_list(2, :host_systemd_unit)
    }
  end

  def host_details_updated_event_factory do
    %HostDetailsUpdated{
      host_id: Faker.UUID.v4(),
      hostname: Faker.StarWars.character(),
      fully_qualified_domain_name: Faker.Internet.domain_name(),
      ip_addresses: ["#{Faker.Internet.ip_v4_address()}/#{Enum.random([16, 24, 32])}"],
      agent_version: Faker.App.semver(),
      arch: Enum.random(Architecture.values()),
      cpu_count: Enum.random(1..16),
      total_memory_mb: Enum.random(1..128),
      socket_count: Enum.random(1..16),
      os_version: Faker.App.semver(),
      installation_source: Enum.random([:community, :suse, :unknown]),
      prometheus_targets: build(:host_prometheus_targets)
    }
  end

  def host_factory do
    %HostReadModel{
      id: Faker.UUID.v4(),
      hostname: Faker.StarWars.character(),
      fully_qualified_domain_name: Faker.Internet.domain_name(),
      ip_addresses: [Faker.Internet.ip_v4_address()],
      netmasks: [Enum.random([16, 24, 32])],
      agent_version: Faker.StarWars.planet(),
      arch: Enum.random(Architecture.values()),
      cluster_id: Faker.UUID.v4(),
      cluster_host_status: ClusterHostStatus.online(),
      heartbeat: :unknown,
      health: :unknown,
      provider: Enum.random(Provider.values()),
      provider_data: nil,
      deregistered_at: nil,
      selected_checks: Enum.map(0..4, fn _ -> Faker.StarWars.planet() end),
      saptune_status: nil,
      prometheus_targets: build(:host_prometheus_targets),
      systemd_units: build_list(2, :host_systemd_unit)
    }
  end

  def heartbeat_factory do
    %Heartbeat{
      agent_id: Faker.UUID.v4(),
      timestamp: DateTime.utc_now()
    }
  end

  def register_online_cluster_host_factory do
    %RegisterOnlineClusterHost{
      cluster_id: Faker.UUID.v4(),
      host_id: Faker.UUID.v4(),
      name: Faker.StarWars.character(),
      sap_instances: build_list(1, :clustered_sap_instance),
      provider: Enum.random(Provider.values()),
      resources_number: 8,
      hosts_number: 2,
      details: build(:hana_cluster_details),
      type: ClusterType.hana_scale_up(),
      discovered_health: Health.passing(),
      designated_controller: true,
      cib_last_written: Date.to_string(Faker.Date.forward(0))
    }
  end

  def register_offline_cluster_host_factory do
    %RegisterOfflineClusterHost{
      cluster_id: Faker.UUID.v4(),
      host_id: Faker.UUID.v4(),
      name: Faker.StarWars.character()
    }
  end

  def clustered_sap_instance_factory do
    instance_number = "00"

    %SapInstance{
      name: "#{Faker.StarWars.planet()}#{instance_number}",
      sid: Faker.StarWars.planet(),
      instance_number: instance_number,
      hostname: Faker.StarWars.character(),
      resource_type: Enum.random(SapInstanceResourceType.values()),
      mounted: true
    }
  end

  def host_removed_from_cluster_event_factory do
    HostRemovedFromCluster.new!(%{
      host_id: Faker.UUID.v4(),
      cluster_id: Faker.UUID.v4(),
      deregistered_at: DateTime.utc_now()
    })
  end

  def cluster_deregistered_event_factory do
    ClusterDeregistered.new!(%{
      cluster_id: Faker.UUID.v4(),
      deregistered_at: DateTime.utc_now()
    })
  end

  def cluster_registered_event_factory do
    %ClusterRegistered{
      cluster_id: Faker.UUID.v4(),
      name: Faker.StarWars.character(),
      sap_instances: build_list(1, :clustered_sap_instance),
      provider: Enum.random(Provider.values()),
      resources_number: 8,
      hosts_number: 2,
      details: build(:hana_cluster_details),
      health: Health.passing(),
      type: ClusterType.hana_scale_up()
    }
  end

  def cluster_details_updated_event_factory do
    %ClusterDetailsUpdated{
      cluster_id: Faker.UUID.v4(),
      name: Faker.StarWars.character(),
      type: ClusterType.hana_scale_up(),
      sap_instances: build_list(1, :clustered_sap_instance),
      provider: Enum.random(Provider.values()),
      resources_number: 8,
      hosts_number: 2,
      details: build(:hana_cluster_details)
    }
  end

  def cluster_discovered_health_changed_event_factory do
    %ClusterDiscoveredHealthChanged{
      cluster_id: Faker.UUID.v4(),
      discovered_health: Health.passing()
    }
  end

  def cluster_health_changed_event_factory do
    %ClusterHealthChanged{
      cluster_id: Faker.UUID.v4(),
      health: Health.passing()
    }
  end

  def cluster_checks_selected_event_factory do
    %ChecksSelected{
      cluster_id: Faker.UUID.v4(),
      checks: Enum.map(0..4, fn _ -> Faker.UUID.v4() end)
    }
  end

  def cluster_checks_health_changed_event_factory do
    %ClusterChecksHealthChanged{
      cluster_id: Faker.UUID.v4(),
      checks_health: Health.passing()
    }
  end

  def host_added_to_cluster_event_factory do
    %HostAddedToCluster{
      cluster_id: Faker.UUID.v4(),
      host_id: Faker.UUID.v4(),
      cluster_host_status: ClusterHostStatus.online()
    }
  end

  def sles_subscription_factory do
    host = build(:host)
    identifier = sequence(:identifier, &"#{Faker.StarWars.planet()}#{&1}")

    %SlesSubscriptionReadModel{
      host_id: host.id,
      identifier: identifier,
      version: Faker.App.semver(),
      expires_at: DateTime.to_iso8601(Faker.DateTime.forward(2)),
      starts_at: DateTime.to_iso8601(Faker.DateTime.backward(2)),
      subscription_status: "ACTIVE",
      status: "Registered",
      type: "internal",
      arch: "x86_64"
    }
  end

  def saptune_solution_factory do
    %SaptuneSolution{
      id: Faker.UUID.v4(),
      notes: ["foo", "bar", "baz"],
      partial: Enum.random([true, false])
    }
  end

  def saptune_staging_factory do
    %SaptuneStaging{
      enabled: Enum.random([true, false]),
      notes: ["foo", "bar", "baz"],
      solutions_ids: [Faker.UUID.v4(), Faker.UUID.v4()]
    }
  end

  def saptune_status_factory do
    %SaptuneStatus{
      package_version: Faker.App.semver(),
      configured_version: Enum.random(["1", "2", "3"]),
      tuning_state: Enum.random(["compliant", "not compliant", "not tuned"]),
      applied_solution: build(:saptune_solution),
      enabled_solution: build(:saptune_solution),
      staging: build(:saptune_staging)
    }
  end

  def saptune_status_updated_event_factory do
    %SaptuneStatusUpdated{
      host_id: Faker.UUID.v4(),
      status: build(:saptune_status)
    }
  end

  def cluster_factory do
    %ClusterReadModel{
      id: Faker.UUID.v4(),
      name: Faker.StarWars.character(),
      sap_instances: build_list(1, :clustered_sap_instance),
      provider: Enum.random(Provider.values()),
      type: ClusterType.hana_scale_up(),
      health: Health.passing(),
      selected_checks: Enum.map(0..4, fn _ -> Faker.StarWars.planet() end),
      details: %{}
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
      database_id: Faker.UUID.v4(),
      sid: Faker.UUID.v4(),
      instance_number: "00",
      instance_hostname: "an-instance-name",
      features: Faker.Pokemon.name(),
      http_port: 8080,
      https_port: 8443,
      start_priority: "0.3",
      host_id: Faker.UUID.v4(),
      system_replication: "Primary",
      system_replication_status: "ACTIVE",
      system_replication_site: nil,
      system_replication_mode: nil,
      system_replication_operation_mode: nil,
      system_replication_source_site: nil,
      system_replication_tier: nil,
      health: Health.passing()
    }
  end

  def database_instance_marked_absent_event_factory do
    DatabaseInstanceMarkedAbsent.new!(%{
      instance_number: "00",
      host_id: Faker.UUID.v4(),
      database_id: Faker.UUID.v4(),
      absent_at: DateTime.utc_now()
    })
  end

  def database_instance_deregistered_event_factory do
    DatabaseInstanceDeregistered.new!(%{
      instance_number: "00",
      host_id: Faker.UUID.v4(),
      database_id: Faker.UUID.v4(),
      deregistered_at: DateTime.utc_now()
    })
  end

  def database_restored_event_factory do
    DatabaseRestored.new!(%{
      database_id: Faker.UUID.v4(),
      health: Health.passing()
    })
  end

  def deregister_database_instance_command_factory do
    DeregisterDatabaseInstance.new!(%{
      database_id: Faker.UUID.v4(),
      deregistered_at: DateTime.utc_now(),
      host_id: Faker.UUID.v4(),
      instance_number: "00"
    })
  end

  def tenant_factory do
    Tenant.new!(%{name: Faker.Beer.name()})
  end

  def database_deregistered_event_factory do
    DatabaseDeregistered.new!(%{
      database_id: Faker.UUID.v4(),
      deregistered_at: DateTime.utc_now()
    })
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

  def application_instance_marked_absent_event_factory do
    ApplicationInstanceMarkedAbsent.new!(%{
      instance_number: "00",
      host_id: Faker.UUID.v4(),
      sap_system_id: Faker.UUID.v4(),
      absent_at: DateTime.utc_now()
    })
  end

  def application_instance_deregistered_event_factory do
    ApplicationInstanceDeregistered.new!(%{
      sap_system_id: Faker.UUID.v4(),
      deregistered_at: DateTime.utc_now(),
      instance_number: "00",
      host_id: Faker.UUID.v4()
    })
  end

  def deregister_application_instance_command_factory do
    DeregisterApplicationInstance.new!(%{
      sap_system_id: Faker.UUID.v4(),
      deregistered_at: DateTime.utc_now(),
      instance_number: "00",
      host_id: Faker.UUID.v4()
    })
  end

  def database_registered_event_factory do
    %DatabaseRegistered{
      database_id: Faker.UUID.v4(),
      sid: Faker.UUID.v4(),
      health: Health.passing()
    }
  end

  def database_health_changed_event_factory do
    %DatabaseHealthChanged{
      database_id: Faker.UUID.v4(),
      health: Health.passing()
    }
  end

  def sap_system_registered_event_factory do
    %SapSystemRegistered{
      sap_system_id: Faker.UUID.v4(),
      sid: Faker.UUID.v4(),
      db_host: Faker.Internet.ip_v4_address(),
      tenant: Faker.Beer.hop(),
      health: Health.passing(),
      database_id: Faker.UUID.v4(),
      database_health: Health.passing(),
      ensa_version: EnsaVersion.ensa1()
    }
  end

  def sap_system_health_changed_event_factory do
    %SapSystemHealthChanged{
      sap_system_id: Faker.UUID.v4(),
      health: Health.passing()
    }
  end

  def application_instance_moved_event_factory do
    %ApplicationInstanceMoved{
      sap_system_id: Faker.UUID.v4(),
      instance_number: "00",
      old_host_id: Faker.UUID.v4(),
      new_host_id: Faker.UUID.v4()
    }
  end

  def sap_system_deregistered_event_factory do
    SapSystemDeregistered.new!(%{
      sap_system_id: Faker.UUID.v4(),
      deregistered_at: DateTime.utc_now()
    })
  end

  def sap_system_restored_event_factory do
    %SapSystemRestored{
      sap_system_id: Faker.UUID.v4(),
      tenant: Faker.Beer.hop(),
      db_host: Faker.Internet.ip_v4_address(),
      health: Health.passing(),
      database_health: Health.passing()
    }
  end

  def rollup_sap_system_command_factory do
    RollUpSapSystem.new!(%{
      sap_system_id: Faker.UUID.v4()
    })
  end

  def hana_cluster_details_factory do
    %HanaClusterDetails{
      architecture_type: HanaArchitectureType.classic(),
      hana_scenario: HanaScenario.performance_optimized(),
      fencing_type: "external/sbd",
      maintenance_mode: false,
      nodes: build_list(1, :hana_cluster_node),
      sites: [
        %HanaClusterSite{
          name: Faker.Beer.name(),
          state: "Primary",
          sr_health_state: "4"
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
      stopped_resources:
        build_list(1, :cluster_resource,
          fail_count: 0,
          role: "Stopped",
          type: "ocf::heartbeat:Dummy"
        ),
      system_replication_mode: "sync",
      system_replication_operation_mode: "logreplay",
      resources: build_list(5, :cluster_resource)
    }
  end

  def hana_cluster_node_factory do
    %HanaClusterNode{
      attributes: %{"attribute" => Faker.Beer.name()},
      status: "Online",
      hana_status: "Secondary",
      virtual_ip: Faker.Internet.ip_v4_address(),
      name: Faker.StarWars.character(),
      indexserver_actual_role: "master",
      nameserver_actual_role: "master",
      resources:
        build_list(1, :cluster_resource,
          role: "Started",
          status: "Active",
          type: "ocf::heartbeat:Dummy",
          managed: true
        ),
      site: Faker.StarWars.planet()
    }
  end

  def ascs_ers_cluster_node_factory do
    %AscsErsClusterNode{
      name: Faker.Pokemon.name(),
      roles: [Enum.random(["ascs", "ers"])],
      virtual_ips: [Faker.Internet.ip_v4_address()],
      filesystems: [Faker.File.file_name()],
      status: "Online",
      attributes: %{
        Faker.Pokemon.name() => Faker.Pokemon.name()
      },
      resources: build_list(5, :cluster_resource)
    }
  end

  def ascs_ers_cluster_sap_system_factory do
    %AscsErsClusterSapSystem{
      sid: sequence(:sid, &"PR#{&1}"),
      filesystem_resource_based: Enum.random([false, true]),
      distributed: Enum.random([false, true]),
      nodes: build_list(2, :ascs_ers_cluster_node)
    }
  end

  def sbd_device_factory do
    %SbdDevice{
      device: Faker.File.file_name(),
      status: Enum.random(["healthy", "unhealthy"])
    }
  end

  def cluster_resource_factory do
    %ClusterResource{
      id: Faker.UUID.v4(),
      type: Faker.StarWars.planet(),
      role: Faker.Beer.hop(),
      status: Faker.Pokemon.name(),
      fail_count: Enum.random(0..100),
      managed: Enum.random([false, true]),
      parent: build(:cluster_resource_parent),
      node: Faker.StarWars.character(),
      sid: nil
    }
  end

  def cluster_resource_parent_factory do
    %ClusterResourceParent{
      id: Faker.UUID.v4(),
      managed: Enum.random([false, true]),
      multi_state: Enum.random([false, true])
    }
  end

  def ascs_ers_cluster_details_factory do
    %AscsErsClusterDetails{
      fencing_type: Faker.Beer.hop(),
      maintenance_mode: false,
      sap_systems: build_list(2, :ascs_ers_cluster_sap_system),
      sbd_devices: build_list(2, :sbd_device),
      stopped_resources: build_list(2, :cluster_resource),
      resources: build_list(5, :cluster_resource)
    }
  end

  def database_factory do
    %DatabaseReadModel{
      id: Faker.UUID.v4(),
      sid: Faker.StarWars.planet(),
      health: Health.unknown()
    }
  end

  def sap_system_factory do
    %SapSystemReadModel{
      id: Faker.UUID.v4(),
      sid: Faker.StarWars.planet(),
      tenant: Faker.Beer.hop(),
      db_host: Faker.Internet.ip_v4_address(),
      health: Health.unknown(),
      ensa_version: EnsaVersion.ensa1(),
      deregistered_at: nil,
      database_id: Faker.UUID.v4()
    }
  end

  def database_instance_factory do
    %DatabaseInstanceReadModel{
      database_id: Faker.UUID.v4(),
      sid: Faker.UUID.v4(),
      instance_number: "00",
      features: Faker.Pokemon.name(),
      host_id: Faker.UUID.v4(),
      system_replication: "",
      system_replication_status: "",
      health: Health.unknown(),
      absent_at: nil
    }
  end

  def application_instance_factory do
    %ApplicationInstanceReadModel{
      sap_system_id: Faker.UUID.v4(),
      sid: Faker.UUID.v4(),
      instance_number: "00",
      features: Faker.Pokemon.name(),
      host_id: Faker.UUID.v4(),
      health: Health.unknown(),
      absent_at: nil
    }
  end

  def sap_system_instance_factory do
    %Instance{
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
      value: sequence(:value, &"#{Faker.Color.name()}0#{&1}"),
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
      health: Health.passing(),
      ensa_version: EnsaVersion.ensa1(),
      database_id: Faker.UUID.v4(),
      database_health: Health.passing(),
      clustered: false
    })
  end

  def register_database_instance_command_factory do
    tenants = build_list(1, :tenant)

    %RegisterDatabaseInstance{
      database_id: Faker.UUID.v4(),
      sid: Faker.StarWars.planet(),
      tenants: tenants,
      instance_number: "00",
      instance_hostname: "an-instance-name",
      features: Faker.Pokemon.name(),
      http_port: 8080,
      https_port: 8443,
      start_priority: "0.3",
      host_id: Faker.UUID.v4(),
      system_replication: "Primary",
      system_replication_status: "ACTIVE",
      system_replication_site: nil,
      system_replication_mode: nil,
      system_replication_operation_mode: nil,
      system_replication_source_site: nil,
      system_replication_tier: nil,
      health: Health.passing()
    }
  end

  def database_tenants_updated_event_factory do
    %DatabaseTenantsUpdated{
      database_id: Faker.UUID.v4(),
      tenants: build_list(1, :tenant)
    }
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
      "Node" => build(:crm_resource_node),
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

  def crm_resource_node_factory do
    %{
      "Id" => "1",
      "Name" => Faker.StarWars.planet(),
      "Cached" => true
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

  def database_tombstoned_event_factory do
    DatabaseTombstoned.new!(%{
      database_id: Faker.UUID.v4()
    })
  end

  def sapcontrol_process_factory do
    %{
      "name" => Faker.Pokemon.name(),
      "description" => Faker.StarWars.planet(),
      "dispstatus" => "SAPControl-GREEN",
      "pid" => Enum.random(0..100)
    }
  end

  def register_host_command_factory do
    RegisterHost.new!(%{
      host_id: Faker.UUID.v4(),
      hostname: Faker.StarWars.character(),
      ip_addresses: [Faker.Internet.ip_v4_address()],
      agent_version: Faker.App.semver(),
      arch: Enum.random(Architecture.values()),
      cpu_count: Enum.random(1..16),
      total_memory_mb: Enum.random(1..128),
      socket_count: Enum.random(1..16),
      os_version: Faker.App.semver(),
      installation_source: Enum.random([:community, :suse, :unknown]),
      fully_qualified_domain_name: Faker.Internet.domain_name(),
      prometheus_targets: build(:host_prometheus_targets)
    })
  end

  def heartbeat_succeded_factory do
    HeartbeatSucceeded.new!(%{
      host_id: Faker.UUID.v4()
    })
  end

  def heartbeat_failed_factory do
    HeartbeatFailed.new!(%{
      host_id: Faker.UUID.v4()
    })
  end

  def host_checks_selected_event_factory do
    %HostChecksSelected{
      host_id: Faker.UUID.v4(),
      checks: Enum.map(0..4, fn _ -> Faker.UUID.v4() end)
    }
  end

  def host_checks_health_changed_factory do
    %HostChecksHealthChanged{
      host_id: Faker.UUID.v4(),
      checks_health: Health.passing()
    }
  end

  def host_saptune_health_changed_event_factory do
    %HostSaptuneHealthChanged{
      host_id: Faker.UUID.v4(),
      saptune_health: Health.passing()
    }
  end

  def host_discovery_event_factory do
    %{
      "hostname" => Faker.StarWars.character(),
      "ip_addresses" => [Faker.Internet.ip_v4_address()],
      "agent_version" => Faker.App.semver(),
      "arch" => Atom.to_string(Enum.random(Architecture.values())),
      "cpu_count" => Enum.random(1..16),
      "total_memory_mb" => Enum.random(1..128),
      "socket_count" => Enum.random(1..16),
      "os_version" => Faker.App.semver(),
      "installation_source" => Enum.random(["community", "suse", "unknown"]),
      "fully_qualified_domain_name" => Faker.Internet.domain_name()
    }
  end

  def host_prometheus_targets_factory do
    %{
      "node_exporter" => "#{Faker.Internet.ip_v4_address()}:9100"
    }
  end

  def host_systemd_unit_factory do
    %SystemdUnit{
      name: Faker.UUID.v4(),
      unit_file_state: Enum.random(["enabled", "disabled", "unknown"])
    }
  end

  def software_updates_discovery_health_changed_event_factory do
    SoftwareUpdatesHealthChanged.new!(%{
      host_id: Faker.UUID.v4(),
      health: SoftwareUpdatesHealth.passing()
    })
  end

  def software_updates_discovery_requested_event_factory do
    %SoftwareUpdatesDiscoveryRequested{
      host_id: Faker.UUID.v4(),
      fully_qualified_domain_name: Faker.Internet.domain_name()
    }
  end

  def software_updates_discovery_cleared_event_factory do
    SoftwareUpdatesDiscoveryCleared.new!(%{
      host_id: Faker.UUID.v4()
    })
  end

  def host_health_changed_event_factory do
    HostHealthChanged.new!(%{
      host_id: Faker.UUID.v4(),
      health: Health.passing()
    })
  end

  def software_updates_settings_factory(attrs) do
    self_signed_cert = build(:self_signed_certificate)

    url = Map.get(attrs, :url, Faker.Internet.url())
    username = Map.get(attrs, :username, Faker.Internet.user_name())
    password = Map.get(attrs, :password, Faker.Lorem.word())
    ca_cert = Map.get(attrs, :ca_cert, self_signed_cert)
    ca_uploaded_at = Map.get(attrs, :ca_uploaded_at, DateTime.utc_now())

    %SuseManagerSettings{}
    |> SuseManagerSettings.changeset(%{
      type: :suse_manager_settings,
      url: url,
      username: username,
      password: password,
      ca_cert: ca_cert,
      ca_uploaded_at: ca_uploaded_at
    })
    |> Ecto.Changeset.apply_changes()
  end

  def api_key_settings_factory do
    %ApiKeySettings{
      type: :api_key_settings,
      jti: Faker.UUID.v4(),
      expire_at: DateTime.utc_now(),
      created_at: DateTime.utc_now()
    }
  end

  def installation_settings_factory do
    %InstallationSettings{
      type: :installation_settings,
      installation_id: Faker.UUID.v4()
    }
  end

  def sso_certificates_settings_factory do
    %SSOCertificatesSettings{
      type: :sso_certificates_settings,
      name: Faker.StarWars.planet(),
      certificate_file: Faker.Lorem.paragraph(),
      key_file: Faker.Lorem.paragraph()
    }
  end

  def insert_software_updates_settings(attrs \\ []) do
    insert(
      :software_updates_settings,
      attrs,
      conflict_target: :type,
      on_conflict: :replace_all
    )
  end

  def relevant_patch_factory do
    %RelevantPatch{
      date: Faker.Date.backward(30),
      advisory_name: String.downcase(Faker.Pokemon.name()),
      advisory_type: Faker.Util.pick(AdvisoryType.values()),
      advisory_status: "stable",
      id: RandomElixir.random_between(2000, 5000),
      advisory_synopsis: Faker.Lorem.sentence(),
      update_date: Faker.Date.backward(30)
    }
  end

  def upgradable_package_factory do
    package_name = Faker.Pokemon.name()

    %UpgradablePackage{
      name: String.downcase(package_name),
      arch: Faker.Util.pick(["x86_64", "i586", "aarch64"]),
      from_version: Faker.App.version(),
      from_release: "#{RandomElixir.random_between(0, 100)}",
      from_epoch: "#{RandomElixir.random_between(0, 50)}",
      to_version: Faker.App.version(),
      to_release: "#{RandomElixir.random_between(0, 100)}",
      to_epoch: "#{RandomElixir.random_between(0, 50)}",
      to_package_id: RandomElixir.random_between(0, 1000)
    }
  end

  def patch_for_package_factory do
    %{
      advisory: String.downcase(Faker.Pokemon.name()),
      type: AdvisoryType.values() |> Faker.Util.pick() |> Atom.to_string(),
      synopsis: Faker.Lorem.sentence(),
      issue_date: 30 |> Faker.Date.backward() |> Date.to_string(),
      update_date: 30 |> Faker.Date.backward() |> Date.to_string(),
      last_modified_date: 30 |> Faker.Date.backward() |> Date.to_string()
    }
  end

  def software_updates_discovery_result_factory do
    %DiscoveryResult{
      host_id: Faker.UUID.v4(),
      system_id: Faker.UUID.v4(),
      relevant_patches: build_list(2, :relevant_patch),
      upgradable_packages: build_list(2, :upgradable_package),
      failure_reason: nil
    }
  end

  def failed_software_updates_discovery_result_factory do
    %DiscoveryResult{
      host_id: Faker.UUID.v4(),
      system_id: nil,
      relevant_patches: [],
      upgradable_packages: [],
      failure_reason:
        Faker.Util.pick([
          "system_id_not_found",
          "error_getting_patches",
          "error_getting_packages",
          "max_login_retries_reached"
        ])
    }
  end

  def affected_package_factory do
    package_name = Faker.Pokemon.name()

    %{
      name: String.downcase(package_name),
      arch_label: Faker.Util.pick(["x86_64", "i586", "aarch64"]),
      version: Faker.App.version(),
      release: "#{RandomElixir.random_between(0, 100)}",
      epoch: "#{RandomElixir.random_between(0, 50)}"
    }
  end

  def affected_system_factory do
    %{name: Faker.UUID.v4()}
  end

  def errata_details_factory do
    %{
      id: Enum.random(1..65_536),
      issue_date: 30 |> Faker.Date.backward() |> Date.to_string(),
      update_date: 30 |> Faker.Date.backward() |> Date.to_string(),
      last_modified_date: 30 |> Faker.Date.backward() |> Date.to_string(),
      synopsis: Faker.Lorem.sentence(),
      release: Enum.random(1..256),
      advisory_status: "stable",
      vendor_advisory: Faker.Lorem.word(),
      type: Faker.Beer.name(),
      product: Faker.StarWars.character(),
      errataFrom: Faker.Lorem.word(),
      topic: Faker.StarWars.planet(),
      description: Faker.Lorem.sentence(),
      references: Faker.Lorem.sentence(),
      notes: Faker.Lorem.sentence(),
      solution: Faker.Lorem.sentence(),
      reboot_suggested: Faker.Util.pick([true, false]),
      restart_suggested: Faker.Util.pick([true, false])
    }
  end

  def cve_factory(attrs) do
    year = Enum.random(1_991..2_024)
    id = Enum.random(0..9_999)
    %{year: year, id: id} = Map.merge(%{year: year, id: id}, attrs)
    "CVE-#{year}-#{id}"
  end

  def bugzilla_fix_factory do
    1..Enum.random(1..4)
    |> Enum.map(fn _ ->
      bugzilla_id = Integer.to_string(Enum.random(1..65_536))
      bug_summary = Faker.Lorem.sentence()
      {String.to_atom(bugzilla_id), bug_summary}
    end)
    |> Map.new()
  end

  def self_signed_certificate_factory(attrs) do
    validity = Map.get(attrs, :validity, 500)

    2048
    |> X509.PrivateKey.new_rsa()
    |> X509.Certificate.self_signed("/C=US/ST=NT/L=Springfield/O=ACME Inc./CN=Intermediate CA",
      validity: validity
    )
    |> X509.Certificate.to_pem()
  end

  def activity_log_retention_time_factory do
    RetentionTime.new!(%{
      value: Enum.random(1..30),
      unit: Faker.Util.pick(RetentionPeriodUnit.values())
    })
  end

  def activity_log_settings_factory do
    %ActivityLogSettings{
      type: :activity_log_settings,
      retention_time: build(:activity_log_retention_time)
    }
  end

  def activity_log_entry_factory do
    %ActivityLogEntry{
      type: Faker.Pokemon.name(),
      actor: Faker.Internet.user_name(),
      severity: SeverityLevel.severity_level_to_integer(:info),
      metadata: %{}
    }
  end

  def alerting_settings_factory do
    %AlertingSettings{
      type: :alerting_settings,
      enabled: true,
      sender_email: Faker.Internet.email(),
      recipient_email: Faker.Internet.email(),
      smtp_server: Faker.Internet.domain_name(),
      smtp_port: Faker.random_between(0, 65_353),
      smtp_username: Faker.Pokemon.name(),
      smtp_password: Faker.Pokemon.name()
    }
  end

  def user_factory do
    password = Faker.Pokemon.name()

    %User{
      email: Faker.Internet.email(),
      fullname: Faker.Pokemon.name(),
      password: password,
      password_hash: Argon2.hash_pwd_salt(password),
      username: Faker.UUID.v4(),
      deleted_at: nil,
      locked_at: nil,
      password_change_requested_at: nil,
      totp_enabled_at: nil,
      totp_secret: nil,
      totp_last_used_at: nil,
      analytics_enabled_at: nil
    }
  end

  def ability_factory do
    %Ability{
      name: Faker.Pokemon.name(),
      label: Faker.Pokemon.name(),
      resource: Faker.Industry.industry()
    }
  end

  def users_abilities_factory do
    %UsersAbilities{
      user_id: 1,
      ability_id: 1
    }
  end

  def user_with_abilities_factory do
    user = build(:user)
    ability = build(:ability)
    build(:users_abilities, user_id: user.id, ability_id: ability.id)

    %User{
      user
      | abilities: [ability]
    }
  end

  def user_identity_factory do
    %UserIdentity{
      user_id: 1,
      uid: Faker.UUID.v4(),
      provider: Faker.Pokemon.name()
    }
  end

  def operation_completed_v1_factory do
    %OperationCompleted{
      operation_id: Faker.UUID.v4(),
      group_id: Faker.UUID.v4(),
      operation_type: Faker.Pokemon.name(),
      result: Enum.random([:UPDATED, :NOT_UPDATED, :FAILED])
    }
  end

  def check_customization_applied_v1_factory do
    %CheckCustomizationApplied{
      check_id: Faker.UUID.v4(),
      group_id: Faker.UUID.v4(),
      target_type: Enum.random(["host", "cluster"]),
      custom_values: [
        %{
          name: Faker.Pokemon.name(),
          value: {:string_value, Faker.Pokemon.name()}
        }
      ]
    }
  end

  def check_customization_reset_v1_factory do
    %CheckCustomizationReset{
      check_id: Faker.UUID.v4(),
      group_id: Faker.UUID.v4(),
      target_type: Enum.random(["host", "cluster"])
    }
  end
end
