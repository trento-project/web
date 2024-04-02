defmodule Trento.Factory do
  @moduledoc """
  A simple Factory helper module to be used within tests to generate test data
  """

  require Trento.Enums.Provider, as: Provider
  require Trento.Clusters.Enums.ClusterType, as: ClusterType
  require Trento.SapSystems.Enums.EnsaVersion, as: EnsaVersion
  require Trento.Enums.Health, as: Health

  alias Faker.Random.Elixir, as: RandomElixir

  alias Trento.Clusters.ValueObjects.{
    AscsErsClusterDetails,
    AscsErsClusterNode,
    AscsErsClusterSapSystem,
    ClusterResource,
    HanaClusterDetails,
    HanaClusterNode,
    HanaClusterSite,
    SbdDevice
  }

  alias Trento.Hosts.ValueObjects.{
    SaptuneStatus,
    SlesSubscription
  }

  alias Trento.SapSystems.Instance

  alias Trento.Hosts.Events.{
    HeartbeatFailed,
    HeartbeatSucceeded,
    HostChecksHealthChanged,
    HostDetailsUpdated,
    HostHealthChanged,
    HostRegistered,
    HostSaptuneHealthChanged,
    HostTombstoned,
    SaptuneStatusUpdated,
    SlesSubscriptionsUpdated,
    SoftwareUpdatesDiscoveryCompleted
  }

  alias Trento.Databases.Events.{
    DatabaseDeregistered,
    DatabaseInstanceDeregistered,
    DatabaseInstanceMarkedAbsent,
    DatabaseInstanceRegistered,
    DatabaseRegistered,
    DatabaseRestored
  }

  alias Trento.SapSystems.Events.{
    ApplicationInstanceDeregistered,
    ApplicationInstanceMarkedAbsent,
    ApplicationInstanceRegistered,
    SapSystemDeregistered,
    SapSystemRegistered,
    SapSystemTombstoned
  }

  alias Trento.Clusters.Events.{
    ClusterDeregistered,
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

  alias Trento.Clusters.Commands.RegisterClusterHost

  alias Trento.Hosts.Projections.{
    HostReadModel,
    SlesSubscriptionReadModel
  }

  alias Trento.SapSystems.Projections.{
    ApplicationInstanceReadModel,
    DatabaseInstanceReadModel,
    DatabaseReadModel,
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

  alias Trento.SoftwareUpdates.Settings

  alias Trento.Settings.{
    ApiKeySettings,
    InstallationSettings
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
      fully_qualified_domain_name: Faker.Internet.domain_name(),
      installation_source: Enum.random([:community, :suse, :unknown]),
      heartbeat: :unknown
    }
  end

  def host_details_updated_event_factory do
    %HostDetailsUpdated{
      host_id: Faker.UUID.v4(),
      hostname: Faker.StarWars.character(),
      fully_qualified_domain_name: Faker.Internet.domain_name(),
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
      fully_qualified_domain_name: Faker.Internet.domain_name(),
      ip_addresses: [Faker.Internet.ip_v4_address()],
      agent_version: Faker.StarWars.planet(),
      cluster_id: Faker.UUID.v4(),
      heartbeat: :unknown,
      health: :unknown,
      provider: Enum.random(Provider.values()),
      provider_data: nil,
      deregistered_at: nil,
      selected_checks: Enum.map(0..4, fn _ -> Faker.StarWars.planet() end),
      saptune_status: nil
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
      details: build(:hana_cluster_details),
      type: ClusterType.hana_scale_up(),
      discovered_health: Health.passing(),
      designated_controller: true
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
      sid: Faker.StarWars.planet(),
      additional_sids: [],
      provider: Enum.random(Provider.values()),
      resources_number: 8,
      hosts_number: 2,
      details: build(:hana_cluster_details),
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

  def saptune_status_factory do
    %SaptuneStatus{
      package_version: Faker.App.semver(),
      configured_version: Enum.random(["1", "2", "3"]),
      tuning_state: Enum.random(["compliant", "not compliant", "not tuned"])
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
      database_id: Faker.UUID.v4(),
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

  def sap_system_registered_event_factory do
    %SapSystemRegistered{
      sap_system_id: Faker.UUID.v4(),
      sid: Faker.UUID.v4(),
      db_host: Faker.Internet.ip_v4_address(),
      tenant: Faker.Beer.hop(),
      health: Health.passing(),
      ensa_version: EnsaVersion.ensa1()
    }
  end

  def sap_system_deregistered_event_factory do
    SapSystemDeregistered.new!(%{
      sap_system_id: Faker.UUID.v4(),
      deregistered_at: DateTime.utc_now()
    })
  end

  def rollup_sap_system_command_factory do
    RollUpSapSystem.new!(%{
      sap_system_id: Faker.UUID.v4()
    })
  end

  def hana_cluster_details_factory do
    %HanaClusterDetails{
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
      system_replication_operation_mode: "logreplay"
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
      managed: Enum.random([false, true])
    }
  end

  def ascs_ers_cluster_details_factory do
    %AscsErsClusterDetails{
      fencing_type: Faker.Beer.hop(),
      maintenance_mode: false,
      sap_systems: build_list(2, :ascs_ers_cluster_sap_system),
      sbd_devices: build_list(2, :sbd_device),
      stopped_resources: build_list(2, :cluster_resource)
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
      ensa_version: EnsaVersion.ensa1(),
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
      health: Health.unknown(),
      absent_at: nil
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
      health: Health.unknown(),
      absent_at: nil
    }
  end

  def application_instance_factory do
    host = build(:host)
    build(:application_instance_without_host, host_id: host.id, host: host)
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
      ensa_version: EnsaVersion.ensa1()
    })
  end

  def register_database_instance_command_factory do
    RegisterDatabaseInstance.new!(%{
      database_id: Faker.UUID.v4(),
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
      cpu_count: Enum.random(1..16),
      total_memory_mb: Enum.random(1..128),
      socket_count: Enum.random(1..16),
      os_version: Faker.App.semver(),
      installation_source: Enum.random([:community, :suse, :unknown])
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

  def software_updates_discovery_completed_event_factory do
    SoftwareUpdatesDiscoveryCompleted.new!(%{
      host_id: Faker.UUID.v4(),
      relevant_patches: %{}
    })
  end

  def host_health_changed_event_factory do
    HostHealthChanged.new!(%{
      host_id: Faker.UUID.v4(),
      health: Health.passing()
    })
  end

  def software_updates_settings_factory(attrs) do
    url = Map.get(attrs, :url, Faker.Internet.url())
    username = Map.get(attrs, :username, Faker.Internet.user_name())
    password = Map.get(attrs, :password, Faker.Lorem.word())
    ca_cert = Map.get(attrs, :ca_cert, Faker.Lorem.sentence())
    ca_uploaded_at = Map.get(attrs, :ca_uploaded_at, DateTime.utc_now())

    %Settings{}
    |> Settings.changeset(%{
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
      installation_id: Faker.UUID.v4(),
      eula_accepted: true
    }
  end

  def insert_software_updates_settings(attrs \\ []) do
    insert(
      :software_updates_settings,
      attrs,
      conflict_target: :id,
      on_conflict: :replace_all
    )
  end

  def relevant_patch_factory do
    %{
      date: Faker.Date.backward(30),
      advisory_name: String.downcase(Faker.Pokemon.name()),
      advisory_type:
        Faker.Util.pick(["Bug Fix Advisory", "Security Advisory", "Product Enhancement"]),
      advisory_status: "stable",
      id: RandomElixir.random_between(2000, 5000),
      advisory_synopsis: Faker.Lorem.words(30),
      update_date: Faker.Date.backward(30)
    }
  end

  def upgradable_package_factory do
    package_name = Faker.Pokemon.name()

    %{
      name: String.downcase(package_name),
      arch: Faker.Util.pick(["x86_64", "i586", "aarch64"]),
      from_version: Faker.App.version(),
      from_release: "#{RandomElixir.random_between(0, 100)}",
      from_epoch: "#{RandomElixir.random_between(0, 50)}",
      to_version: Faker.App.version(),
      to_release: "#{RandomElixir.random_between(0, 100)}",
      to_epoch: "#{RandomElixir.random_between(0, 50)}",
      to_package_id: "#{RandomElixir.random_between(0, 1000)}"
    }
  end
end
