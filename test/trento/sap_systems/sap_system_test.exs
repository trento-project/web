# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.SapSystems.SapSystemTest do
  use Trento.AggregateCase, aggregate: Trento.SapSystems.SapSystem, async: true

  import Trento.Factory

  require Trento.SapSystems.Enums.EnsaVersion, as: EnsaVersion
  require Trento.SapSystems.Enums.Status, as: Status

  alias Trento.SapSystems.Commands.{
    DeregisterApplicationInstance,
    DeregisterSapSystem,
    MarkApplicationInstanceAbsent,
    MarkApplicationInstanceDataStale,
    RegisterApplicationInstance,
    RestoreSapSystem,
    RollUpSapSystem,
    UpdateDatabaseHealth,
    UpdateDatabaseStaleAt
  }

  alias Trento.SapSystems.Events.{
    ApplicationInstanceDataMarkedInSync,
    ApplicationInstanceDataMarkedStale,
    ApplicationInstanceDeregistered,
    ApplicationInstanceMarkedAbsent,
    ApplicationInstanceMarkedPresent,
    ApplicationInstanceMoved,
    ApplicationInstanceRegistered,
    ApplicationInstanceStatusChanged,
    SapSystemDatabaseHealthChanged,
    SapSystemDatabaseStaleAtChanged,
    SapSystemDataMarkedInSync,
    SapSystemDataMarkedStale,
    SapSystemDeregistered,
    SapSystemHealthChanged,
    SapSystemRegistered,
    SapSystemRestored,
    SapSystemRolledUp,
    SapSystemRollUpRequested,
    SapSystemTombstoned,
    SapSystemUpdated
  }

  alias Trento.SapSystems.{
    Instance,
    SapSystem
  }

  describe "SAP System registration" do
    test "should register a SAP System and add an application instance when a MESSAGESERVER instance is already present and a new ABAP instance is added" do
      sap_system_id = Faker.UUID.v4()
      sid = Faker.StarWars.planet()
      db_host = Faker.Internet.ip_v4_address()
      tenant = Faker.Beer.style()
      instance_hostname = Faker.Airports.iata()
      http_port = 80
      https_port = 443
      start_priority = "0.9"
      host_id = Faker.UUID.v4()
      ensa_version = EnsaVersion.ensa1()
      database_stale_at = DateTime.utc_now()

      initial_events = [
        build(:application_instance_registered_event,
          sap_system_id: sap_system_id,
          sid: sid,
          features: "MESSAGESERVER",
          instance_number: "00"
        )
      ]

      assert_events_and_state(
        initial_events,
        RegisterApplicationInstance.new!(%{
          sap_system_id: sap_system_id,
          sid: sid,
          db_host: db_host,
          tenant: tenant,
          instance_number: "10",
          instance_hostname: instance_hostname,
          features: "ABAP",
          http_port: http_port,
          https_port: https_port,
          start_priority: start_priority,
          host_id: host_id,
          status: Status.green(),
          ensa_version: ensa_version,
          database_health: :passing,
          database_stale_at: database_stale_at,
          clustered: false
        }),
        [
          %ApplicationInstanceRegistered{
            sap_system_id: sap_system_id,
            sid: sid,
            instance_number: "10",
            instance_hostname: instance_hostname,
            features: "ABAP",
            http_port: http_port,
            https_port: https_port,
            start_priority: start_priority,
            host_id: host_id,
            status: Status.green()
          },
          %SapSystemRegistered{
            sap_system_id: sap_system_id,
            sid: sid,
            db_host: db_host,
            tenant: tenant,
            health: :passing,
            database_health: :passing,
            database_stale_at: database_stale_at,
            ensa_version: ensa_version
          }
        ],
        fn state ->
          assert %SapSystem{
                   sid: ^sid,
                   ensa_version: ^ensa_version,
                   database_health: :passing,
                   database_stale_at: ^database_stale_at,
                   instances: [
                     %Instance{
                       sid: ^sid,
                       instance_number: "10",
                       features: "ABAP",
                       host_id: ^host_id,
                       status: Status.green(),
                       absent_at: nil
                     },
                     %Instance{
                       features: "MESSAGESERVER"
                     }
                   ]
                 } = state
        end
      )
    end

    test "should register a SAP System and add an application instance when a MESSAGESERVER instance is already present and a new JAVA instance is added" do
      sap_system_id = Faker.UUID.v4()
      sid = Faker.StarWars.planet()
      db_host = Faker.Internet.ip_v4_address()
      tenant = Faker.Beer.style()
      instance_hostname = Faker.Airports.iata()
      http_port = 80
      https_port = 443
      start_priority = "0.9"
      host_id = Faker.UUID.v4()
      ensa_version = EnsaVersion.ensa1()
      java_system_type = "J2EE"

      initial_events = [
        build(:application_instance_registered_event,
          sap_system_id: sap_system_id,
          sid: sid,
          features: "MESSAGESERVER",
          instance_number: "00"
        )
      ]

      assert_events_and_state(
        initial_events,
        RegisterApplicationInstance.new!(%{
          sap_system_id: sap_system_id,
          sid: sid,
          db_host: db_host,
          tenant: tenant,
          instance_number: "10",
          instance_hostname: instance_hostname,
          features: java_system_type,
          http_port: http_port,
          https_port: https_port,
          start_priority: start_priority,
          host_id: host_id,
          status: Status.green(),
          ensa_version: ensa_version,
          database_health: :passing,
          clustered: false
        }),
        [
          %ApplicationInstanceRegistered{
            sap_system_id: sap_system_id,
            sid: sid,
            instance_number: "10",
            instance_hostname: instance_hostname,
            features: java_system_type,
            http_port: http_port,
            https_port: https_port,
            start_priority: start_priority,
            host_id: host_id,
            status: Status.green()
          },
          %SapSystemRegistered{
            sap_system_id: sap_system_id,
            sid: sid,
            db_host: db_host,
            tenant: tenant,
            health: :passing,
            database_health: :passing,
            ensa_version: ensa_version
          }
        ],
        fn state ->
          assert %SapSystem{
                   sid: ^sid,
                   ensa_version: ^ensa_version,
                   database_health: :passing,
                   instances: [
                     %Instance{
                       sid: ^sid,
                       instance_number: "10",
                       features: ^java_system_type,
                       host_id: ^host_id,
                       status: Status.green(),
                       absent_at: nil
                     },
                     %Instance{
                       features: "MESSAGESERVER"
                     }
                   ]
                 } = state
        end
      )
    end

    test "should move an application instance if the host_id changed and the instance number already exists and the application is clustered" do
      sap_system_id = Faker.UUID.v4()
      sid = fake_sid()
      instance_number = "10"
      old_host_id = Faker.UUID.v4()
      new_host_id = Faker.UUID.v4()
      db_host = Faker.Internet.ip_v4_address()
      tenant = Faker.Beer.style()
      instance_hostname = Faker.Airports.iata()
      http_port = 80
      https_port = 443
      start_priority = "0.9"
      ensa_version = EnsaVersion.ensa1()

      initial_events = [
        build(:application_instance_registered_event,
          sap_system_id: sap_system_id,
          sid: sid,
          features: "MESSAGESERVER"
        ),
        build(:application_instance_registered_event,
          sap_system_id: sap_system_id,
          sid: sid,
          features: "ABAP",
          instance_number: instance_number,
          instance_hostname: instance_hostname,
          http_port: http_port,
          https_port: https_port,
          start_priority: start_priority,
          host_id: old_host_id
        ),
        build(:sap_system_registered_event,
          sap_system_id: sap_system_id,
          sid: sid,
          db_host: db_host,
          tenant: tenant,
          ensa_version: ensa_version
        )
      ]

      assert_events_and_state(
        initial_events,
        RegisterApplicationInstance.new!(%{
          sap_system_id: sap_system_id,
          sid: sid,
          db_host: db_host,
          tenant: tenant,
          instance_number: instance_number,
          instance_hostname: instance_hostname,
          features: "ABAP",
          http_port: http_port,
          https_port: https_port,
          start_priority: start_priority,
          host_id: new_host_id,
          status: Status.green(),
          ensa_version: ensa_version,
          clustered: true,
          database_health: :passing
        }),
        [
          %ApplicationInstanceMoved{
            sap_system_id: sap_system_id,
            instance_number: instance_number,
            old_host_id: old_host_id,
            new_host_id: new_host_id
          }
        ],
        fn state ->
          assert %SapSystem{
                   instances: [
                     %Instance{
                       sid: ^sid,
                       instance_number: ^instance_number,
                       host_id: ^new_host_id
                     }
                     | _
                   ]
                 } = state
        end
      )
    end

    test "should not emit a movement event if the coming instance using the same instance number continues in the same host" do
      sap_system_id = Faker.UUID.v4()
      sid = fake_sid()
      instance_number = "10"
      message_server_host_id = Faker.UUID.v4()
      app_server_host_id = Faker.UUID.v4()
      db_host = Faker.Internet.ip_v4_address()
      tenant = Faker.Beer.style()
      instance_hostname = Faker.Airports.iata()
      http_port = 80
      https_port = 443
      start_priority = "0.9"
      ensa_version = EnsaVersion.ensa1()

      initial_events = [
        build(:application_instance_registered_event,
          sap_system_id: sap_system_id,
          sid: sid,
          features: "MESSAGESERVER",
          host_id: message_server_host_id,
          instance_number: instance_number
        ),
        build(:application_instance_registered_event,
          sap_system_id: sap_system_id,
          sid: sid,
          features: "ABAP",
          instance_number: instance_number,
          instance_hostname: instance_hostname,
          http_port: http_port,
          https_port: https_port,
          start_priority: start_priority,
          host_id: app_server_host_id
        ),
        build(:sap_system_registered_event,
          sap_system_id: sap_system_id,
          sid: sid,
          db_host: db_host,
          tenant: tenant,
          ensa_version: ensa_version
        )
      ]

      assert_events(
        initial_events,
        RegisterApplicationInstance.new!(%{
          sap_system_id: sap_system_id,
          sid: sid,
          db_host: db_host,
          tenant: tenant,
          instance_number: instance_number,
          instance_hostname: instance_hostname,
          features: "MESSAGESERVER",
          http_port: http_port,
          https_port: https_port,
          start_priority: start_priority,
          host_id: message_server_host_id,
          status: Status.green(),
          ensa_version: ensa_version,
          cluster_id: true,
          database_health: :passing
        }),
        []
      )
    end

    test "should register and not move an application instance, if the instance number exists but it's in another host and the application is not clustered" do
      sap_system_id = Faker.UUID.v4()
      sid = fake_sid()
      instance_number = "10"
      old_host_id = Faker.UUID.v4()
      new_host_id = Faker.UUID.v4()
      db_host = Faker.Internet.ip_v4_address()
      tenant = Faker.Beer.style()
      instance_hostname = Faker.Airports.iata()
      http_port = 80
      https_port = 443
      start_priority = "0.9"
      ensa_version = EnsaVersion.ensa1()

      initial_events = [
        build(:application_instance_registered_event,
          sap_system_id: sap_system_id,
          sid: sid,
          features: "MESSAGESERVER"
        ),
        build(:application_instance_registered_event,
          sap_system_id: sap_system_id,
          sid: sid,
          features: "ABAP",
          instance_number: instance_number,
          instance_hostname: instance_hostname,
          http_port: http_port,
          https_port: https_port,
          start_priority: start_priority,
          host_id: old_host_id
        ),
        build(:sap_system_registered_event,
          sap_system_id: sap_system_id,
          sid: sid,
          db_host: db_host,
          tenant: tenant,
          ensa_version: ensa_version
        )
      ]

      assert_events_and_state(
        initial_events,
        RegisterApplicationInstance.new!(%{
          sap_system_id: sap_system_id,
          sid: sid,
          db_host: db_host,
          tenant: tenant,
          instance_number: instance_number,
          instance_hostname: instance_hostname,
          features: "ABAP",
          http_port: http_port,
          https_port: https_port,
          start_priority: start_priority,
          host_id: new_host_id,
          status: Status.green(),
          ensa_version: ensa_version,
          clustered: false,
          database_health: :passing
        }),
        [
          %ApplicationInstanceRegistered{
            sap_system_id: sap_system_id,
            sid: sid,
            instance_number: instance_number,
            instance_hostname: instance_hostname,
            features: "ABAP",
            http_port: http_port,
            https_port: https_port,
            start_priority: start_priority,
            host_id: new_host_id,
            status: Status.green()
          }
        ],
        fn state ->
          assert %SapSystem{
                   instances: [
                     %Instance{
                       sid: ^sid,
                       instance_number: ^instance_number,
                       host_id: ^new_host_id
                     },
                     _,
                     _
                   ]
                 } = state
        end
      )
    end

    test "should not register or move application, if the application has an already existing instance number and the host is the same" do
      sap_system_id = Faker.UUID.v4()
      sid = fake_sid()
      instance_number = "10"
      old_host_id = Faker.UUID.v4()
      db_host = Faker.Internet.ip_v4_address()
      tenant = Faker.Beer.style()
      instance_hostname = Faker.Airports.iata()
      http_port = 80
      https_port = 443
      start_priority = "0.9"
      ensa_version = EnsaVersion.ensa1()

      initial_events = [
        build(:application_instance_registered_event,
          sap_system_id: sap_system_id,
          sid: sid,
          features: "MESSAGESERVER"
        ),
        build(:application_instance_registered_event,
          sap_system_id: sap_system_id,
          sid: sid,
          features: "ABAP",
          instance_number: instance_number,
          instance_hostname: instance_hostname,
          http_port: http_port,
          https_port: https_port,
          start_priority: start_priority,
          host_id: old_host_id
        ),
        build(:sap_system_registered_event,
          sap_system_id: sap_system_id,
          sid: sid,
          db_host: db_host,
          tenant: tenant,
          ensa_version: ensa_version
        )
      ]

      assert_events_and_state(
        initial_events,
        RegisterApplicationInstance.new!(%{
          sap_system_id: sap_system_id,
          sid: sid,
          db_host: db_host,
          tenant: tenant,
          instance_number: instance_number,
          instance_hostname: instance_hostname,
          features: "ABAP",
          http_port: http_port,
          https_port: https_port,
          start_priority: start_priority,
          host_id: old_host_id,
          status: Status.green(),
          ensa_version: ensa_version,
          database_health: :passing,
          clustered: false
        }),
        [],
        fn state ->
          assert %SapSystem{
                   instances: [
                     %Instance{
                       sid: ^sid,
                       instance_number: ^instance_number,
                       host_id: ^old_host_id
                     },
                     _
                   ]
                 } = state
        end
      )
    end

    test "should update a SAP System ENSA version if it was not set" do
      sap_system_id = Faker.UUID.v4()
      sid = fake_sid()
      ensa_version = EnsaVersion.ensa1()
      instance_number = "10"
      host_id = Faker.UUID.v4()

      initial_events = [
        build(:application_instance_registered_event,
          sap_system_id: sap_system_id,
          sid: sid,
          features: "MESSAGESERVER",
          instance_number: instance_number,
          host_id: host_id
        ),
        build(:application_instance_registered_event,
          sap_system_id: sap_system_id,
          sid: sid,
          features: "ABAP"
        ),
        build(
          :sap_system_registered_event,
          sap_system_id: sap_system_id,
          sid: sid,
          ensa_version: EnsaVersion.no_ensa()
        )
      ]

      assert_events_and_state(
        initial_events,
        build(:register_application_instance_command,
          sap_system_id: sap_system_id,
          sid: sid,
          instance_number: instance_number,
          host_id: host_id,
          features: "MESSAGESERVER",
          ensa_version: ensa_version
        ),
        [
          %SapSystemUpdated{
            sap_system_id: sap_system_id,
            ensa_version: ensa_version
          }
        ],
        fn state ->
          assert %SapSystem{
                   sid: ^sid,
                   ensa_version: ^ensa_version
                 } = state
        end
      )
    end

    test "should not update a SAP System ENSA version if the coming application instance does not have ENSA data" do
      sap_system_id = Faker.UUID.v4()
      sid = fake_sid()
      ensa_version = EnsaVersion.ensa1()
      instance_number = "10"
      host_id = Faker.UUID.v4()

      initial_events = [
        build(:application_instance_registered_event,
          sap_system_id: sap_system_id,
          sid: sid,
          features: "MESSAGESERVER"
        ),
        build(:application_instance_registered_event,
          sap_system_id: sap_system_id,
          sid: sid,
          features: "ABAP",
          instance_number: instance_number,
          host_id: host_id
        ),
        build(
          :sap_system_registered_event,
          sap_system_id: sap_system_id,
          sid: sid,
          ensa_version: ensa_version
        )
      ]

      assert_events_and_state(
        initial_events,
        build(:register_application_instance_command,
          sap_system_id: sap_system_id,
          sid: sid,
          instance_number: instance_number,
          host_id: host_id,
          features: "ABAP",
          ensa_version: EnsaVersion.no_ensa()
        ),
        [],
        fn state ->
          assert %SapSystem{
                   sid: ^sid,
                   ensa_version: ^ensa_version
                 } = state
        end
      )
    end

    test "should not update a SAP System if the coming data didn't change the current state" do
      sap_system_id = Faker.UUID.v4()
      sid = fake_sid()
      ensa_version = EnsaVersion.ensa1()
      instance_number = "10"
      host_id = Faker.UUID.v4()

      initial_events = [
        build(:application_instance_registered_event,
          sap_system_id: sap_system_id,
          sid: sid,
          features: "MESSAGESERVER",
          instance_number: instance_number,
          host_id: host_id
        ),
        build(:application_instance_registered_event,
          sap_system_id: sap_system_id,
          sid: sid,
          features: "ABAP"
        ),
        build(
          :sap_system_registered_event,
          sap_system_id: sap_system_id,
          sid: sid,
          ensa_version: ensa_version
        )
      ]

      assert_events_and_state(
        initial_events,
        build(:register_application_instance_command,
          sap_system_id: sap_system_id,
          sid: sid,
          instance_number: instance_number,
          host_id: host_id,
          features: "MESSAGESERVER",
          ensa_version: ensa_version
        ),
        [],
        fn state ->
          assert %SapSystem{
                   sid: ^sid,
                   ensa_version: ^ensa_version
                 } = state
        end
      )
    end

    test "should register a SAP System and add an application instance when an ABAP instance is already present and a new MESSAGESERVER instance is added" do
      sap_system_id = Faker.UUID.v4()
      sid = Faker.StarWars.planet()
      db_host = Faker.Internet.ip_v4_address()
      tenant = Faker.Beer.style()
      instance_hostname = Faker.Airports.iata()
      http_port = 80
      https_port = 443
      start_priority = "0.9"
      host_id = Faker.UUID.v4()
      ensa_version = EnsaVersion.ensa1()

      initial_events = [
        build(:application_instance_registered_event,
          sap_system_id: sap_system_id,
          sid: sid,
          features: "ABAP",
          instance_number: "10"
        )
      ]

      assert_events_and_state(
        initial_events,
        RegisterApplicationInstance.new!(%{
          sap_system_id: sap_system_id,
          sid: sid,
          db_host: db_host,
          tenant: tenant,
          instance_number: "00",
          instance_hostname: instance_hostname,
          features: "MESSAGESERVER",
          http_port: http_port,
          https_port: https_port,
          start_priority: start_priority,
          host_id: host_id,
          status: Status.green(),
          ensa_version: ensa_version,
          database_health: :passing,
          clustered: false
        }),
        [
          %ApplicationInstanceRegistered{
            sap_system_id: sap_system_id,
            sid: sid,
            instance_number: "00",
            instance_hostname: instance_hostname,
            features: "MESSAGESERVER",
            http_port: http_port,
            https_port: https_port,
            start_priority: start_priority,
            host_id: host_id,
            status: Status.green()
          },
          %SapSystemRegistered{
            sap_system_id: sap_system_id,
            sid: sid,
            db_host: db_host,
            tenant: tenant,
            health: :passing,
            database_health: :passing,
            ensa_version: ensa_version
          }
        ],
        fn state ->
          assert %SapSystem{
                   sid: ^sid,
                   instances: [
                     %Instance{
                       sid: ^sid,
                       instance_number: "00",
                       features: "MESSAGESERVER",
                       host_id: ^host_id,
                       status: Status.green()
                     },
                     %Instance{
                       features: "ABAP"
                     }
                   ]
                 } = state
        end
      )
    end

    test "should add an application instance to a non registered SAP system when the instance is ABAP without complete a sap system registration" do
      sap_system_id = Faker.UUID.v4()
      sid = Faker.StarWars.planet()
      db_host = Faker.Internet.ip_v4_address()
      tenant = Faker.Beer.style()
      instance_hostname = Faker.Airports.iata()
      http_port = 80
      https_port = 443
      start_priority = "0.9"
      host_id = Faker.UUID.v4()
      ensa_version = EnsaVersion.ensa1()

      initial_events = []

      assert_events_and_state(
        initial_events,
        RegisterApplicationInstance.new!(%{
          sap_system_id: sap_system_id,
          sid: sid,
          db_host: db_host,
          tenant: tenant,
          instance_number: "00",
          instance_hostname: instance_hostname,
          features: "ABAP",
          http_port: http_port,
          https_port: https_port,
          start_priority: start_priority,
          host_id: host_id,
          status: Status.green(),
          ensa_version: ensa_version,
          database_health: :passing
        }),
        [
          %ApplicationInstanceRegistered{
            sap_system_id: sap_system_id,
            sid: sid,
            instance_number: "00",
            instance_hostname: instance_hostname,
            features: "ABAP",
            http_port: http_port,
            https_port: https_port,
            start_priority: start_priority,
            host_id: host_id,
            status: Status.green()
          }
        ],
        fn state ->
          assert %SapSystem{
                   sid: nil,
                   instances: [
                     %Instance{
                       sid: ^sid,
                       instance_number: "00",
                       features: "ABAP",
                       host_id: ^host_id,
                       status: Status.green()
                     }
                   ]
                 } = state
        end
      )
    end

    test "should add an application instance to a non registered SAP system when the instance is MESSAGESERVER without completing a SAP system registration" do
      sap_system_id = Faker.UUID.v4()
      sid = Faker.StarWars.planet()
      db_host = Faker.Internet.ip_v4_address()
      tenant = Faker.Beer.style()
      instance_hostname = Faker.Airports.iata()
      http_port = 80
      https_port = 443
      start_priority = "0.9"
      host_id = Faker.UUID.v4()
      ensa_version = EnsaVersion.ensa1()

      initial_events = []

      assert_events_and_state(
        initial_events,
        RegisterApplicationInstance.new!(%{
          sap_system_id: sap_system_id,
          sid: sid,
          db_host: db_host,
          tenant: tenant,
          instance_number: "00",
          instance_hostname: instance_hostname,
          features: "MESSAGESERVER",
          http_port: http_port,
          https_port: https_port,
          start_priority: start_priority,
          host_id: host_id,
          status: Status.green(),
          ensa_version: ensa_version,
          database_health: :passing
        }),
        [
          %ApplicationInstanceRegistered{
            sap_system_id: sap_system_id,
            sid: sid,
            instance_number: "00",
            instance_hostname: instance_hostname,
            features: "MESSAGESERVER",
            http_port: http_port,
            https_port: https_port,
            start_priority: start_priority,
            host_id: host_id,
            status: Status.green()
          }
        ],
        fn state ->
          assert %SapSystem{
                   sid: nil,
                   instances: [
                     %Instance{
                       sid: ^sid,
                       instance_number: "00",
                       features: "MESSAGESERVER",
                       host_id: ^host_id,
                       status: Status.green()
                     }
                   ]
                 } = state
        end
      )
    end

    test "should add an application instance to a registered SAP System" do
      sap_system_id = Faker.UUID.v4()
      sid = Faker.StarWars.planet()

      initial_events = [
        build(:application_instance_registered_event, sap_system_id: sap_system_id, sid: sid),
        build(:sap_system_registered_event, sap_system_id: sap_system_id, sid: sid)
      ]

      new_instance_db_host = Faker.Internet.ip_v4_address()
      new_instance_tenant = Faker.Beer.style()
      new_instance_number = "10"
      new_instance_features = Faker.Pokemon.name()
      new_instance_host_id = Faker.UUID.v4()

      assert_events_and_state(
        initial_events,
        build(
          :register_application_instance_command,
          sap_system_id: sap_system_id,
          sid: sid,
          db_host: new_instance_db_host,
          tenant: new_instance_tenant,
          instance_number: new_instance_number,
          features: new_instance_features,
          host_id: new_instance_host_id,
          status: Status.green()
        ),
        build(
          :application_instance_registered_event,
          sap_system_id: sap_system_id,
          sid: sid,
          instance_number: new_instance_number,
          features: new_instance_features,
          host_id: new_instance_host_id,
          status: Status.green()
        ),
        fn state ->
          assert %SapSystem{
                   sid: ^sid,
                   instances: [
                     %Instance{
                       sid: ^sid,
                       instance_number: ^new_instance_number,
                       features: ^new_instance_features,
                       host_id: ^new_instance_host_id,
                       status: Status.green()
                     }
                     | _
                   ]
                 } = state
        end
      )
    end

    test "should not add an application instance if the application instance was already registered" do
      sap_system_id = Faker.UUID.v4()

      application_instance_registered_event =
        build(:application_instance_registered_event, sap_system_id: sap_system_id)

      initial_events = [
        application_instance_registered_event
      ]

      assert_events(
        initial_events,
        build(
          :register_application_instance_command,
          sap_system_id: application_instance_registered_event.sap_system_id,
          sid: application_instance_registered_event.sid,
          db_host: Faker.Internet.ip_v4_address(),
          tenant: Faker.Beer.hop(),
          instance_number: application_instance_registered_event.instance_number,
          features: application_instance_registered_event.features,
          host_id: application_instance_registered_event.host_id,
          status: Status.green()
        ),
        []
      )
    end
  end

  describe "SAP System health" do
    test "should change the health of a SAP System when a new Application instance is registered" do
      sap_system_id = Faker.UUID.v4()
      database_id = Faker.UUID.v4()
      sid = Faker.StarWars.planet()
      tenant = Faker.Beer.style()
      db_host = Faker.Internet.ip_v4_address()
      instance_number = "00"
      features = "MESSAGESERVER"
      host_id = Faker.UUID.v4()
      ensa_version = EnsaVersion.ensa1()

      initial_events = [
        build(:application_instance_registered_event,
          sap_system_id: sap_system_id,
          sid: sid,
          features: "ABAP",
          instance_number: "10"
        )
      ]

      assert_events_and_state(
        initial_events,
        build(
          :register_application_instance_command,
          sap_system_id: sap_system_id,
          sid: sid,
          tenant: tenant,
          db_host: db_host,
          instance_number: instance_number,
          features: features,
          host_id: host_id,
          status: Status.red(),
          database_id: database_id
        ),
        [
          build(
            :application_instance_registered_event,
            sap_system_id: sap_system_id,
            sid: sid,
            instance_number: instance_number,
            features: features,
            host_id: host_id,
            status: Status.red()
          ),
          %SapSystemRegistered{
            sap_system_id: sap_system_id,
            sid: sid,
            db_host: db_host,
            tenant: tenant,
            health: :critical,
            ensa_version: ensa_version,
            database_id: database_id,
            database_health: :passing
          }
        ],
        fn state ->
          assert %SapSystem{
                   health: :critical,
                   database_health: :passing,
                   ensa_version: ^ensa_version,
                   instances: [
                     %Instance{
                       status: Status.red()
                     },
                     %Instance{
                       status: Status.green()
                     }
                   ]
                 } = state
        end
      )
    end

    test "should change the health of a SAP System when an Application has changed the health status" do
      sap_system_id = Faker.UUID.v4()

      application_instance_registered =
        build(:application_instance_registered_event, sap_system_id: sap_system_id)

      sap_system_registered_event =
        build(:sap_system_registered_event, sap_system_id: sap_system_id)

      initial_events = [
        application_instance_registered,
        sap_system_registered_event
      ]

      assert_events_and_state(
        initial_events,
        build(
          :register_application_instance_command,
          sap_system_id: sap_system_id,
          sid: application_instance_registered.sid,
          tenant: sap_system_registered_event.tenant,
          db_host: sap_system_registered_event.db_host,
          instance_number: application_instance_registered.instance_number,
          features: application_instance_registered.features,
          host_id: application_instance_registered.host_id,
          status: Status.red()
        ),
        [
          %ApplicationInstanceStatusChanged{
            sap_system_id: sap_system_id,
            instance_number: application_instance_registered.instance_number,
            host_id: application_instance_registered.host_id,
            status: Status.red()
          },
          %SapSystemHealthChanged{
            sap_system_id: sap_system_id,
            health: :critical
          }
        ],
        fn state ->
          assert %SapSystem{
                   health: :critical,
                   instances: [
                     %Instance{
                       status: Status.red()
                     }
                   ]
                 } = state
        end
      )
    end

    test "should not change the health of a SAP System if no instance has changed the health status" do
      sap_system_id = Faker.UUID.v4()

      new_instance_number = "20"
      new_instance_features = Faker.Pokemon.name()
      new_instance_host_id = Faker.UUID.v4()

      application_instance_registered_event =
        build(
          :application_instance_registered_event,
          sap_system_id: sap_system_id,
          status: Status.yellow()
        )

      sap_system_registered_event =
        build(:sap_system_registered_event, sap_system_id: sap_system_id, health: :warning)

      initial_events = [
        application_instance_registered_event,
        sap_system_registered_event
      ]

      assert_events_and_state(
        initial_events,
        [
          build(
            :register_application_instance_command,
            sap_system_id: sap_system_id,
            sid: application_instance_registered_event.sid,
            tenant: sap_system_registered_event.tenant,
            db_host: sap_system_registered_event.db_host,
            instance_number: application_instance_registered_event.instance_number,
            features: application_instance_registered_event.features,
            host_id: application_instance_registered_event.host_id,
            status: Status.yellow()
          ),
          build(
            :register_application_instance_command,
            sap_system_id: sap_system_id,
            sid: application_instance_registered_event.sid,
            tenant: sap_system_registered_event.tenant,
            db_host: sap_system_registered_event.db_host,
            instance_number: new_instance_number,
            features: new_instance_features,
            host_id: new_instance_host_id,
            status: Status.yellow()
          )
        ],
        [
          build(
            :application_instance_registered_event,
            sap_system_id: sap_system_id,
            sid: application_instance_registered_event.sid,
            instance_number: new_instance_number,
            features: new_instance_features,
            host_id: new_instance_host_id,
            status: Status.yellow()
          )
        ],
        fn state ->
          assert %SapSystem{
                   health: :warning,
                   instances: [
                     %Instance{
                       status: Status.yellow()
                     },
                     %Instance{
                       status: Status.yellow()
                     }
                   ]
                 } = state
        end
      )
    end

    test "should change the health of the SAP system when its database health has changed" do
      sap_system_id = Faker.UUID.v4()
      sid = fake_sid()

      initial_events = [
        build(:application_instance_registered_event,
          sap_system_id: sap_system_id,
          sid: sid,
          features: "MESSAGESERVER"
        ),
        build(:application_instance_registered_event,
          sap_system_id: sap_system_id,
          sid: sid,
          features: "ABAP"
        ),
        build(:sap_system_registered_event,
          sap_system_id: sap_system_id,
          sid: sid
        )
      ]

      assert_events_and_state(
        initial_events,
        [
          UpdateDatabaseHealth.new!(%{
            sap_system_id: sap_system_id,
            database_health: :critical
          }),
          UpdateDatabaseHealth.new!(%{
            sap_system_id: sap_system_id,
            database_health: :critical
          })
        ],
        [
          %SapSystemDatabaseHealthChanged{
            sap_system_id: sap_system_id,
            database_health: :critical
          },
          %SapSystemHealthChanged{sap_system_id: sap_system_id, health: :critical}
        ],
        fn state ->
          assert %SapSystem{
                   health: :critical,
                   database_health: :critical
                 } = state
        end
      )
    end
  end

  describe "rollup" do
    test "should not accept a rollup command if a sap_system was not registered yet" do
      assert_error(
        RollUpSapSystem.new!(%{sap_system_id: Faker.UUID.v4()}),
        {:error, :sap_system_not_registered}
      )
    end

    test "should change the sap_system state to rolling up" do
      sap_system_id = UUID.uuid4()
      sid = UUID.uuid4()

      application_instance_registered_event =
        build(:application_instance_registered_event, sap_system_id: sap_system_id, sid: sid)

      initial_events = [
        application_instance_registered_event,
        %{ensa_version: ensa_version} =
          build(:sap_system_registered_event, sap_system_id: sap_system_id, sid: sid)
      ]

      assert_events_and_state(
        initial_events,
        RollUpSapSystem.new!(%{sap_system_id: sap_system_id}),
        %SapSystemRollUpRequested{
          sap_system_id: sap_system_id,
          snapshot: %SapSystem{
            sap_system_id: sap_system_id,
            sid: sid,
            health: :passing,
            database_health: :passing,
            ensa_version: ensa_version,
            instances: [
              %Instance{
                sid: sid,
                instance_number: application_instance_registered_event.instance_number,
                status: application_instance_registered_event.status,
                features: application_instance_registered_event.features,
                host_id: application_instance_registered_event.host_id,
                system_replication: nil,
                system_replication_status: nil,
                stale_at: nil
              }
            ],
            rolling_up: false
          }
        },
        fn %SapSystem{rolling_up: rolling_up} ->
          assert rolling_up
        end
      )
    end

    test "should not accept commands if a sap_system is in rolling up state" do
      sap_system_id = UUID.uuid4()
      sid = UUID.uuid4()

      initial_events = [
        build(:application_instance_registered_event, sap_system_id: sap_system_id, sid: sid),
        build(:sap_system_registered_event, sap_system_id: sap_system_id, sid: sid),
        %SapSystemRollUpRequested{
          sap_system_id: sap_system_id,
          snapshot: %SapSystem{}
        }
      ]

      assert_error(
        initial_events,
        build(
          :register_application_instance_command,
          sap_system_id: sap_system_id
        ),
        {:error, :sap_system_rolling_up}
      )

      assert_error(
        initial_events,
        RollUpSapSystem.new!(%{
          sap_system_id: sap_system_id
        }),
        {:error, :sap_system_rolling_up}
      )
    end

    test "should apply the rollup event and rehydrate the aggregate" do
      sap_system_id = UUID.uuid4()

      sap_system_registered_event =
        build(:sap_system_registered_event, sap_system_id: sap_system_id)

      initial_events = [
        build(:application_instance_registered_event, sap_system_id: sap_system_id),
        sap_system_registered_event,
        %SapSystemRolledUp{
          sap_system_id: sap_system_id,
          snapshot: %SapSystem{
            sap_system_id: sap_system_registered_event.sap_system_id,
            sid: sap_system_registered_event.sid,
            health: sap_system_registered_event.health,
            rolling_up: false
          }
        }
      ]

      assert_state(
        initial_events,
        [],
        fn sap_system ->
          refute sap_system.rolling_up
          assert sap_system.sap_system_id == sap_system_registered_event.sap_system_id
          assert sap_system.sid == sap_system_registered_event.sid
          assert sap_system.health == sap_system_registered_event.health
        end
      )
    end
  end

  describe "tombstoning" do
    test "should tombstone a deregistered SAP system when no ABAP or JAVA application instances are left" do
      sap_system_id = UUID.uuid4()
      deregistered_at = DateTime.utc_now()

      message_server_host_id = UUID.uuid4()
      message_server_instance_number = "00"
      abap_host_id = UUID.uuid4()
      java_host_id = UUID.uuid4()
      abap_instance_number = "01"
      java_instance_number = "02"

      application_sid = fake_sid()
      # Sap System type
      abap_system_type = "ABAP"
      java_system_type = "J2EE"

      initial_events = [
        build(
          :application_instance_registered_event,
          sap_system_id: sap_system_id,
          features: "MESSAGESERVER|ENQUE",
          host_id: message_server_host_id,
          sid: application_sid,
          instance_number: message_server_instance_number
        ),
        build(
          :application_instance_registered_event,
          sap_system_id: sap_system_id,
          features: abap_system_type,
          host_id: abap_host_id,
          sid: application_sid,
          instance_number: abap_instance_number
        ),
        build(
          :application_instance_registered_event,
          sap_system_id: sap_system_id,
          features: java_system_type,
          host_id: java_host_id,
          sid: application_sid,
          instance_number: java_instance_number
        ),
        build(
          :sap_system_registered_event,
          sap_system_id: sap_system_id,
          sid: application_sid
        )
      ]

      assert_events_and_state(
        initial_events,
        [
          %DeregisterApplicationInstance{
            sap_system_id: sap_system_id,
            host_id: message_server_host_id,
            instance_number: message_server_instance_number,
            deregistered_at: deregistered_at
          },
          %DeregisterApplicationInstance{
            sap_system_id: sap_system_id,
            host_id: abap_host_id,
            instance_number: abap_instance_number,
            deregistered_at: deregistered_at
          },
          %DeregisterApplicationInstance{
            sap_system_id: sap_system_id,
            host_id: java_host_id,
            instance_number: java_instance_number,
            deregistered_at: deregistered_at
          }
        ],
        [
          %ApplicationInstanceDeregistered{
            sap_system_id: sap_system_id,
            host_id: message_server_host_id,
            instance_number: message_server_instance_number,
            deregistered_at: deregistered_at
          },
          %SapSystemDeregistered{
            sap_system_id: sap_system_id,
            deregistered_at: deregistered_at
          },
          %ApplicationInstanceDeregistered{
            sap_system_id: sap_system_id,
            host_id: abap_host_id,
            instance_number: abap_instance_number,
            deregistered_at: deregistered_at
          },
          %ApplicationInstanceDeregistered{
            sap_system_id: sap_system_id,
            host_id: java_host_id,
            instance_number: java_instance_number,
            deregistered_at: deregistered_at
          },
          %SapSystemTombstoned{
            sap_system_id: sap_system_id
          }
        ],
        fn sap_system ->
          assert %SapSystem{
                   instances: [],
                   deregistered_at: ^deregistered_at,
                   sid: ^application_sid
                 } = sap_system
        end
      )
    end
  end

  describe "deregistration" do
    test "should not restore a sap system when no abap/messageserver instances are present" do
      sap_system_id = UUID.uuid4()

      database_host_id = UUID.uuid4()

      deregistered_at = DateTime.utc_now()

      application_sid = fake_sid()

      message_server_host_id = UUID.uuid4()
      message_server_instance_number = "00"
      abap_host_id = UUID.uuid4()
      abap_instance_number = "01"

      initial_events = [
        build(
          :application_instance_registered_event,
          sap_system_id: sap_system_id,
          features: "MESSAGESERVER|ENQUE",
          host_id: message_server_host_id,
          instance_number: message_server_instance_number,
          sid: application_sid
        ),
        build(
          :application_instance_registered_event,
          sap_system_id: sap_system_id,
          features: "ABAP|GATEWAY|ICMAN|IGS",
          host_id: abap_host_id,
          instance_number: abap_instance_number,
          sid: application_sid
        ),
        build(
          :sap_system_registered_event,
          sap_system_id: sap_system_id,
          sid: application_sid
        ),
        build(:sap_system_deregistered_event,
          sap_system_id: sap_system_id,
          deregistered_at: deregistered_at
        ),
        build(:application_instance_deregistered_event,
          sap_system_id: sap_system_id,
          deregistered_at: deregistered_at,
          instance_number: message_server_instance_number,
          host_id: message_server_host_id
        )
      ]

      command =
        build(
          :register_application_instance_command,
          sap_system_id: sap_system_id,
          sid: application_sid,
          db_host: database_host_id,
          features: "IGS"
        )

      assert_events_and_state(
        initial_events,
        command,
        [
          %ApplicationInstanceRegistered{
            sap_system_id: sap_system_id,
            sid: application_sid,
            host_id: command.host_id,
            instance_number: command.instance_number,
            instance_hostname: command.instance_hostname,
            features: command.features,
            http_port: command.http_port,
            https_port: command.https_port,
            start_priority: command.start_priority,
            status: command.status
          }
        ],
        fn sap_system ->
          assert %SapSystem{
                   deregistered_at: ^deregistered_at
                 } = sap_system
        end
      )
    end

    test "should restore a sap system with a new health when abap/messageserver instances are present" do
      sap_system_id = UUID.uuid4()

      database_host_id = UUID.uuid4()
      database_stale_at = DateTime.utc_now()

      deregistered_at = DateTime.utc_now()

      application_sid = fake_sid()

      message_server_host_id = UUID.uuid4()
      message_server_instance_number = "00"
      abap_host_id = UUID.uuid4()
      abap_instance_number = "01"

      initial_events = [
        build(
          :application_instance_registered_event,
          sap_system_id: sap_system_id,
          features: "MESSAGESERVER|ENQUE",
          host_id: message_server_host_id,
          instance_number: message_server_instance_number,
          sid: application_sid
        ),
        build(
          :application_instance_registered_event,
          sap_system_id: sap_system_id,
          features: "ABAP|GATEWAY|ICMAN|IGS",
          host_id: abap_host_id,
          instance_number: abap_instance_number,
          sid: application_sid
        ),
        build(
          :sap_system_registered_event,
          sap_system_id: sap_system_id,
          sid: application_sid
        ),
        build(:sap_system_deregistered_event,
          sap_system_id: sap_system_id,
          deregistered_at: deregistered_at
        ),
        build(:application_instance_deregistered_event,
          sap_system_id: sap_system_id,
          deregistered_at: deregistered_at,
          instance_number: message_server_instance_number,
          host_id: message_server_host_id
        )
      ]

      command =
        build(
          :register_application_instance_command,
          sap_system_id: sap_system_id,
          sid: application_sid,
          db_host: database_host_id,
          features: "MESSAGESERVER",
          database_health: :critical,
          database_stale_at: database_stale_at
        )

      assert_events_and_state(
        initial_events,
        command,
        [
          %ApplicationInstanceRegistered{
            sap_system_id: sap_system_id,
            sid: application_sid,
            host_id: command.host_id,
            instance_number: command.instance_number,
            instance_hostname: command.instance_hostname,
            features: command.features,
            http_port: command.http_port,
            https_port: command.https_port,
            start_priority: command.start_priority,
            status: command.status
          },
          %SapSystemRestored{
            sap_system_id: sap_system_id,
            tenant: command.tenant,
            db_host: command.db_host,
            health: :passing,
            database_health: command.database_health,
            database_stale_at: command.database_stale_at
          },
          %SapSystemHealthChanged{
            sap_system_id: sap_system_id,
            health: :critical
          }
        ],
        fn sap_system ->
          assert %SapSystem{
                   health: :critical,
                   database_health: :critical,
                   database_stale_at: ^database_stale_at,
                   deregistered_at: nil
                 } = sap_system
        end
      )
    end

    test "should restore a SAP system when abap/messageserver instances are present and the restore command is received" do
      sap_system_id = UUID.uuid4()

      deregistered_at = DateTime.utc_now()

      application_sid = fake_sid()

      message_server_host_id = UUID.uuid4()
      message_server_instance_number = "00"
      abap_host_id = UUID.uuid4()
      abap_instance_number = "01"

      initial_events = [
        build(
          :application_instance_registered_event,
          sap_system_id: sap_system_id,
          features: "MESSAGESERVER|ENQUE",
          host_id: message_server_host_id,
          instance_number: message_server_instance_number,
          sid: application_sid
        ),
        build(
          :application_instance_registered_event,
          sap_system_id: sap_system_id,
          features: "ABAP|GATEWAY|ICMAN|IGS",
          host_id: abap_host_id,
          instance_number: abap_instance_number,
          sid: application_sid
        ),
        build(
          :sap_system_registered_event,
          sap_system_id: sap_system_id,
          sid: application_sid
        ),
        build(:sap_system_deregistered_event,
          sap_system_id: sap_system_id,
          deregistered_at: deregistered_at
        )
      ]

      command = %RestoreSapSystem{
        sap_system_id: sap_system_id,
        database_health: :passing
      }

      assert_events_and_state(
        initial_events,
        command,
        [
          %SapSystemRestored{
            sap_system_id: sap_system_id,
            health: :passing,
            database_health: :passing
          }
        ],
        fn sap_system ->
          assert %SapSystem{
                   health: :passing,
                   database_health: :passing,
                   deregistered_at: nil
                 } = sap_system
        end
      )
    end

    test "should restore a SAP system when abap/messageserver instances are present with the new health" do
      sap_system_id = UUID.uuid4()

      application_sid = fake_sid()

      initial_events = [
        build(
          :application_instance_registered_event,
          sap_system_id: sap_system_id,
          features: "MESSAGESERVER|ENQUE",
          sid: application_sid
        ),
        build(
          :application_instance_registered_event,
          sap_system_id: sap_system_id,
          features: "ABAP|GATEWAY|ICMAN|IGS",
          sid: application_sid
        ),
        build(
          :sap_system_registered_event,
          sap_system_id: sap_system_id,
          sid: application_sid
        ),
        build(:sap_system_deregistered_event,
          sap_system_id: sap_system_id
        )
      ]

      command = %RestoreSapSystem{
        sap_system_id: sap_system_id,
        database_health: :critical
      }

      assert_events_and_state(
        initial_events,
        command,
        [
          %SapSystemRestored{
            sap_system_id: sap_system_id,
            health: :passing,
            database_health: :critical
          },
          %SapSystemHealthChanged{
            sap_system_id: sap_system_id,
            health: :critical
          }
        ],
        fn sap_system ->
          assert %SapSystem{
                   health: :critical,
                   database_health: :critical,
                   deregistered_at: nil
                 } = sap_system
        end
      )
    end

    test "should not restore a SAP system when the SAP system is not deregistered" do
      sap_system_id = UUID.uuid4()

      application_sid = fake_sid()

      message_server_host_id = UUID.uuid4()
      message_server_instance_number = "00"
      abap_host_id = UUID.uuid4()
      abap_instance_number = "01"

      initial_events = [
        build(
          :application_instance_registered_event,
          sap_system_id: sap_system_id,
          features: "MESSAGESERVER|ENQUE",
          host_id: message_server_host_id,
          instance_number: message_server_instance_number,
          sid: application_sid
        ),
        build(
          :application_instance_registered_event,
          sap_system_id: sap_system_id,
          features: "ABAP|GATEWAY|ICMAN|IGS",
          host_id: abap_host_id,
          instance_number: abap_instance_number,
          sid: application_sid
        ),
        build(
          :sap_system_registered_event,
          sap_system_id: sap_system_id,
          sid: application_sid
        )
      ]

      command = %RestoreSapSystem{
        sap_system_id: sap_system_id
      }

      assert_events_and_state(
        initial_events,
        command,
        [],
        fn sap_system ->
          assert %SapSystem{
                   deregistered_at: nil
                 } = sap_system
        end
      )
    end

    test "should reject all the commands except for the registration/instance deregistration ones, when the SAP system is deregistered" do
      sap_system_id = UUID.uuid4()

      deregistered_at = DateTime.utc_now()

      application_sid = fake_sid()

      message_server_host_id = UUID.uuid4()
      message_server_instance_number = "00"
      abap_host_id = UUID.uuid4()
      abap_instance_number = "01"

      initial_events = [
        build(
          :application_instance_registered_event,
          sap_system_id: sap_system_id,
          features: "MESSAGESERVER|ENQUE",
          host_id: message_server_host_id,
          instance_number: message_server_instance_number,
          sid: application_sid
        ),
        build(
          :application_instance_registered_event,
          sap_system_id: sap_system_id,
          features: "ABAP|GATEWAY|ICMAN|IGS",
          host_id: abap_host_id,
          instance_number: abap_instance_number,
          sid: application_sid
        ),
        build(
          :sap_system_registered_event,
          sap_system_id: sap_system_id,
          sid: application_sid
        ),
        build(:sap_system_deregistered_event,
          sap_system_id: sap_system_id,
          deregistered_at: deregistered_at
        )
      ]

      commands_to_accept = [
        build(:register_application_instance_command),
        build(:rollup_sap_system_command)
      ]

      for command <- commands_to_accept do
        assert match?({:ok, _, _}, aggregate_run(initial_events, command)),
               "Command #{inspect(command)} should be accepted by a deregistered SAP system"
      end
    end

    test "should always deregister the SAP system when the deregistration command is received" do
      sap_system_id = UUID.uuid4()
      deregistered_at = DateTime.utc_now()

      message_server_host_id = UUID.uuid4()
      abap_host_id = UUID.uuid4()

      message_server_instance_number = "01"
      abap_instance_number = "02"

      application_sid = fake_sid()

      assert_events_and_state(
        [
          build(
            :application_instance_registered_event,
            sap_system_id: sap_system_id,
            features: "MESSAGESERVER|ENQUE",
            sid: application_sid,
            host_id: message_server_host_id,
            instance_number: message_server_instance_number
          ),
          build(
            :application_instance_registered_event,
            sap_system_id: sap_system_id,
            features: "ABAP|GATEWAY|ICMAN|IGS",
            sid: application_sid,
            host_id: abap_host_id,
            instance_number: abap_instance_number
          ),
          build(
            :sap_system_registered_event,
            sap_system_id: sap_system_id,
            sid: application_sid
          )
        ],
        %DeregisterSapSystem{
          sap_system_id: sap_system_id,
          deregistered_at: deregistered_at
        },
        [
          %SapSystemDeregistered{
            sap_system_id: sap_system_id,
            deregistered_at: deregistered_at
          }
        ],
        fn sap_system ->
          assert %SapSystem{
                   sid: ^application_sid,
                   deregistered_at: ^deregistered_at,
                   instances: [
                     %Instance{
                       host_id: ^abap_host_id,
                       instance_number: ^abap_instance_number
                     },
                     %Instance{
                       host_id: ^message_server_host_id,
                       instance_number: ^message_server_instance_number
                     }
                   ]
                 } = sap_system
        end
      )
    end

    test "should not deregister an already deregistered SAP system even when the deregistration command is received" do
      sap_system_id = UUID.uuid4()

      deregistered_at = DateTime.utc_now()

      application_sid = fake_sid()

      message_server_host_id = UUID.uuid4()
      message_server_instance_number = "00"
      abap_host_id = UUID.uuid4()
      abap_instance_number = "01"

      initial_events = [
        build(
          :application_instance_registered_event,
          sap_system_id: sap_system_id,
          features: "MESSAGESERVER|ENQUE",
          host_id: message_server_host_id,
          instance_number: message_server_instance_number,
          sid: application_sid
        ),
        build(
          :application_instance_registered_event,
          sap_system_id: sap_system_id,
          features: "ABAP|GATEWAY|ICMAN|IGS",
          host_id: abap_host_id,
          instance_number: abap_instance_number,
          sid: application_sid
        ),
        build(
          :sap_system_registered_event,
          sap_system_id: sap_system_id,
          sid: application_sid
        ),
        build(:sap_system_deregistered_event,
          sap_system_id: sap_system_id,
          deregistered_at: deregistered_at
        )
      ]

      assert_error(
        initial_events,
        %DeregisterSapSystem{
          sap_system_id: sap_system_id,
          deregistered_at: deregistered_at
        },
        {:error, :sap_system_not_registered}
      )
    end

    test "should deregister an ENQREP Application Instance, SAP system registered" do
      sap_system_id = UUID.uuid4()
      deregistered_at = DateTime.utc_now()

      message_server_host_id = UUID.uuid4()
      abap_host_id = UUID.uuid4()
      enqrep_host_id = UUID.uuid4()

      message_server_instance_number = "01"
      abap_instance_number = "02"
      enqrep_server_instance_number = "03"

      application_sid = fake_sid()

      assert_events_and_state(
        [
          build(
            :application_instance_registered_event,
            sap_system_id: sap_system_id,
            features: "MESSAGESERVER|ENQUE",
            sid: application_sid,
            host_id: message_server_host_id,
            instance_number: message_server_instance_number
          ),
          build(
            :application_instance_registered_event,
            sap_system_id: sap_system_id,
            features: "ABAP|GATEWAY|ICMAN|IGS",
            sid: application_sid,
            host_id: abap_host_id,
            instance_number: abap_instance_number
          ),
          build(
            :sap_system_registered_event,
            sap_system_id: sap_system_id,
            sid: application_sid
          ),
          build(
            :application_instance_registered_event,
            sap_system_id: sap_system_id,
            host_id: enqrep_host_id,
            instance_number: enqrep_server_instance_number,
            sid: application_sid,
            features: "ENQREP"
          )
        ],
        %DeregisterApplicationInstance{
          sap_system_id: sap_system_id,
          host_id: enqrep_host_id,
          instance_number: enqrep_server_instance_number,
          deregistered_at: deregistered_at
        },
        [
          %ApplicationInstanceDeregistered{
            sap_system_id: sap_system_id,
            host_id: enqrep_host_id,
            instance_number: enqrep_server_instance_number,
            deregistered_at: deregistered_at
          }
        ],
        fn sap_system ->
          assert %SapSystem{
                   sid: ^application_sid,
                   deregistered_at: nil,
                   instances: [
                     %Instance{
                       host_id: ^abap_host_id,
                       instance_number: ^abap_instance_number
                     },
                     %Instance{
                       host_id: ^message_server_host_id,
                       instance_number: ^message_server_instance_number
                     }
                   ]
                 } = sap_system
        end
      )
    end

    test "should deregister an ABAP Application Instance without deregistering the SAP system" do
      sap_system_id = UUID.uuid4()
      deregistered_at = DateTime.utc_now()

      application_sid = fake_sid()

      message_server_host_id = UUID.uuid4()
      abap_host_id = UUID.uuid4()
      abap_2_host_id = UUID.uuid4()
      enqrep_host_id = UUID.uuid4()

      message_server_instance_number = "01"
      abap_instance_number = "02"
      abap_2_instance_number = "03"
      enqrep_server_instance_number = "04"

      assert_events_and_state(
        [
          build(
            :application_instance_registered_event,
            sap_system_id: sap_system_id,
            sid: application_sid,
            features: "MESSAGESERVER|ENQUE",
            host_id: message_server_host_id,
            instance_number: message_server_instance_number
          ),
          build(
            :application_instance_registered_event,
            sap_system_id: sap_system_id,
            features: "ABAP|GATEWAY|ICMAN|IGS",
            host_id: abap_host_id,
            sid: application_sid,
            instance_number: abap_instance_number
          ),
          build(
            :application_instance_registered_event,
            sap_system_id: sap_system_id,
            sid: application_sid,
            features: "ABAP|GATEWAY|ICMAN|IGS",
            host_id: abap_2_host_id,
            instance_number: abap_2_instance_number
          ),
          build(
            :sap_system_registered_event,
            sap_system_id: sap_system_id,
            sid: application_sid
          ),
          build(
            :application_instance_registered_event,
            sap_system_id: sap_system_id,
            sid: application_sid,
            host_id: enqrep_host_id,
            instance_number: enqrep_server_instance_number,
            features: "ENQREP"
          )
        ],
        %DeregisterApplicationInstance{
          sap_system_id: sap_system_id,
          host_id: abap_2_host_id,
          instance_number: abap_2_instance_number,
          deregistered_at: deregistered_at
        },
        [
          %ApplicationInstanceDeregistered{
            sap_system_id: sap_system_id,
            host_id: abap_2_host_id,
            instance_number: abap_2_instance_number,
            deregistered_at: deregistered_at
          }
        ],
        fn sap_system ->
          assert %SapSystem{
                   sid: ^application_sid,
                   deregistered_at: nil,
                   instances: [
                     %Instance{
                       host_id: ^enqrep_host_id,
                       instance_number: ^enqrep_server_instance_number
                     },
                     %Instance{
                       host_id: ^abap_host_id,
                       instance_number: ^abap_instance_number
                     },
                     %Instance{
                       host_id: ^message_server_host_id,
                       instance_number: ^message_server_instance_number
                     }
                   ]
                 } = sap_system
        end
      )
    end

    test "should deregister last ABAP Application Instance and deregister SAP System" do
      sap_system_id = UUID.uuid4()
      deregistered_at = DateTime.utc_now()
      application_sid = fake_sid()

      message_server_host_id = UUID.uuid4()
      abap_host_id = UUID.uuid4()
      enqrep_host_id = UUID.uuid4()

      message_server_instance_number = "01"
      abap_instance_number = "02"
      enqrep_server_instance_number = "03"

      assert_events_and_state(
        [
          build(
            :application_instance_registered_event,
            sap_system_id: sap_system_id,
            features: "MESSAGESERVER|ENQUE",
            host_id: message_server_host_id,
            sid: application_sid,
            instance_number: message_server_instance_number
          ),
          build(
            :application_instance_registered_event,
            sap_system_id: sap_system_id,
            features: "ABAP|GATEWAY|ICMAN|IGS",
            host_id: abap_host_id,
            sid: application_sid,
            instance_number: abap_instance_number
          ),
          build(
            :sap_system_registered_event,
            sap_system_id: sap_system_id,
            sid: application_sid
          ),
          build(
            :application_instance_registered_event,
            sap_system_id: sap_system_id,
            sid: application_sid,
            host_id: enqrep_host_id,
            instance_number: enqrep_server_instance_number,
            features: "ENQREP"
          )
        ],
        %DeregisterApplicationInstance{
          sap_system_id: sap_system_id,
          host_id: abap_host_id,
          instance_number: abap_instance_number,
          deregistered_at: deregistered_at
        },
        [
          %ApplicationInstanceDeregistered{
            sap_system_id: sap_system_id,
            host_id: abap_host_id,
            instance_number: abap_instance_number,
            deregistered_at: deregistered_at
          },
          %SapSystemDeregistered{
            sap_system_id: sap_system_id,
            deregistered_at: deregistered_at
          }
        ],
        fn sap_system ->
          assert %SapSystem{
                   sid: ^application_sid,
                   instances: [
                     %Instance{
                       instance_number: ^enqrep_server_instance_number,
                       host_id: ^enqrep_host_id
                     },
                     %Instance{
                       instance_number: ^message_server_instance_number,
                       host_id: ^message_server_host_id
                     }
                   ],
                   deregistered_at: ^deregistered_at
                 } = sap_system
        end
      )
    end

    test "should only deregister a Message Server from a not-fully-registered SAP system" do
      sap_system_id = UUID.uuid4()
      deregistered_at = DateTime.utc_now()

      message_server_host_id = UUID.uuid4()

      message_server_instance_number = "01"

      application_sid = fake_sid()

      assert_events_and_state(
        [
          build(
            :application_instance_registered_event,
            sap_system_id: sap_system_id,
            sid: application_sid,
            features: "MESSAGESERVER|ENQUE",
            host_id: message_server_host_id,
            instance_number: message_server_instance_number
          )
        ],
        %DeregisterApplicationInstance{
          sap_system_id: sap_system_id,
          host_id: message_server_host_id,
          instance_number: message_server_instance_number,
          deregistered_at: deregistered_at
        },
        [
          %ApplicationInstanceDeregistered{
            sap_system_id: sap_system_id,
            host_id: message_server_host_id,
            instance_number: message_server_instance_number,
            deregistered_at: deregistered_at
          },
          %SapSystemTombstoned{
            sap_system_id: sap_system_id
          }
        ],
        fn sap_system ->
          assert %SapSystem{
                   sid: nil,
                   instances: [],
                   deregistered_at: nil
                 } = sap_system
        end
      )
    end

    test "should deregister Message Server and deregister SAP System" do
      sap_system_id = UUID.uuid4()
      deregistered_at = DateTime.utc_now()

      message_server_host_id = UUID.uuid4()
      abap_host_id = UUID.uuid4()
      enqrep_host_id = UUID.uuid4()

      message_server_instance_number = "01"
      abap_instance_number = "02"
      enqrep_server_instance_number = "03"

      application_sid = fake_sid()

      assert_events_and_state(
        [
          build(
            :application_instance_registered_event,
            sap_system_id: sap_system_id,
            features: "MESSAGESERVER|ENQUE",
            host_id: message_server_host_id,
            instance_number: message_server_instance_number,
            sid: application_sid
          ),
          build(
            :application_instance_registered_event,
            sap_system_id: sap_system_id,
            features: "ABAP|GATEWAY|ICMAN|IGS",
            host_id: abap_host_id,
            instance_number: abap_instance_number,
            sid: application_sid
          ),
          build(
            :sap_system_registered_event,
            sap_system_id: sap_system_id,
            sid: application_sid
          ),
          build(
            :application_instance_registered_event,
            sap_system_id: sap_system_id,
            host_id: enqrep_host_id,
            instance_number: enqrep_server_instance_number,
            features: "ENQREP",
            sid: application_sid
          )
        ],
        %DeregisterApplicationInstance{
          sap_system_id: sap_system_id,
          host_id: message_server_host_id,
          instance_number: message_server_instance_number,
          deregistered_at: deregistered_at
        },
        [
          %ApplicationInstanceDeregistered{
            sap_system_id: sap_system_id,
            host_id: message_server_host_id,
            instance_number: message_server_instance_number,
            deregistered_at: deregistered_at
          },
          %SapSystemDeregistered{
            sap_system_id: sap_system_id,
            deregistered_at: deregistered_at
          }
        ],
        fn sap_system ->
          assert %SapSystem{
                   instances: [
                     %Instance{
                       host_id: ^enqrep_host_id,
                       instance_number: ^enqrep_server_instance_number
                     },
                     %Instance{
                       host_id: ^abap_host_id,
                       instance_number: ^abap_instance_number
                     }
                   ],
                   deregistered_at: ^deregistered_at,
                   sid: ^application_sid
                 } = sap_system
        end
      )
    end

    test "should not deregister a not registered application instance" do
      sap_system_id = UUID.uuid4()

      assert_error(
        [],
        [
          %DeregisterApplicationInstance{
            sap_system_id: sap_system_id,
            host_id: UUID.uuid4(),
            instance_number: "01",
            deregistered_at: DateTime.utc_now()
          }
        ],
        {:error, :sap_system_not_registered}
      )
    end

    test "should not deregister an already deregistered application instance" do
      sap_system_id = UUID.uuid4()
      application_sid = fake_sid()
      deregistered_host_id = UUID.uuid4()
      deregistered_instance_number = "02"

      assert_error(
        [
          build(
            :application_instance_registered_event,
            sap_system_id: sap_system_id,
            features: "MESSAGESERVER|ENQUE",
            sid: application_sid,
            host_id: UUID.uuid4(),
            instance_number: "01"
          ),
          build(
            :application_instance_registered_event,
            sap_system_id: sap_system_id,
            features: "ABAP|GATEWAY|ICMAN|IGS",
            sid: application_sid,
            host_id: deregistered_host_id,
            instance_number: deregistered_instance_number
          ),
          build(
            :sap_system_registered_event,
            sap_system_id: sap_system_id,
            sid: application_sid
          ),
          build(
            :application_instance_deregistered_event,
            sap_system_id: sap_system_id,
            host_id: deregistered_host_id,
            instance_number: deregistered_instance_number,
            deregistered_at: DateTime.utc_now()
          )
        ],
        [
          %DeregisterApplicationInstance{
            sap_system_id: sap_system_id,
            host_id: deregistered_host_id,
            instance_number: deregistered_instance_number,
            deregistered_at: DateTime.utc_now()
          }
        ],
        {:error, :application_instance_not_registered}
      )
    end
  end

  describe "instance marked absent/present" do
    test "should mark as absent a previously registered application instance" do
      sap_system_id = Faker.UUID.v4()
      sid = fake_sid()
      host_id = Faker.UUID.v4()
      absent_message_server_instance_number = "02"
      present_app_instance_number = "03"
      absent_app_absent_at = DateTime.utc_now()

      initial_events = [
        build(:application_instance_registered_event,
          sap_system_id: sap_system_id,
          sid: sid,
          host_id: host_id,
          instance_number: absent_message_server_instance_number,
          features: "MESSAGESERVER"
        ),
        build(
          :sap_system_registered_event,
          sap_system_id: sap_system_id,
          sid: sid
        ),
        build(
          :application_instance_marked_absent_event,
          sap_system_id: sap_system_id,
          host_id: host_id,
          instance_number: absent_message_server_instance_number,
          absent_at: absent_app_absent_at
        ),
        build(:application_instance_registered_event,
          sap_system_id: sap_system_id,
          sid: sid,
          host_id: host_id,
          instance_number: present_app_instance_number,
          features: "ABAP"
        )
      ]

      absent_at = DateTime.utc_now()

      assert_events_and_state(
        initial_events,
        [
          %MarkApplicationInstanceAbsent{
            instance_number: absent_message_server_instance_number,
            host_id: host_id,
            sap_system_id: sap_system_id,
            absent_at: absent_at
          },
          %MarkApplicationInstanceAbsent{
            instance_number: present_app_instance_number,
            host_id: host_id,
            sap_system_id: sap_system_id,
            absent_at: absent_at
          }
        ],
        [
          %ApplicationInstanceMarkedAbsent{
            instance_number: present_app_instance_number,
            host_id: host_id,
            sap_system_id: sap_system_id,
            absent_at: absent_at
          }
        ],
        fn state ->
          assert %SapSystem{
                   sid: ^sid,
                   instances: [
                     %Instance{
                       instance_number: ^present_app_instance_number,
                       absent_at: ^absent_at
                     },
                     %Instance{
                       instance_number: ^absent_message_server_instance_number,
                       absent_at: ^absent_app_absent_at
                     }
                   ]
                 } = state
        end
      )
    end

    test "should mark as present an already registered, absent application instance" do
      sap_system_id = Faker.UUID.v4()
      sid = fake_sid()
      ensa_version = EnsaVersion.ensa1()
      host_id = Faker.UUID.v4()
      absent_app_instance_number = "02"
      present_message_server_instance_number = "03"

      initial_events = [
        build(:application_instance_registered_event,
          sap_system_id: sap_system_id,
          sid: sid,
          host_id: host_id,
          instance_number: absent_app_instance_number,
          features: "ABAP"
        ),
        build(
          :application_instance_marked_absent_event,
          sap_system_id: sap_system_id,
          host_id: host_id,
          instance_number: absent_app_instance_number
        ),
        build(:application_instance_registered_event,
          sap_system_id: sap_system_id,
          sid: sid,
          host_id: host_id,
          instance_number: present_message_server_instance_number,
          features: "MESSAGESERVER"
        ),
        build(
          :sap_system_registered_event,
          sap_system_id: sap_system_id,
          sid: sid,
          ensa_version: ensa_version
        )
      ]

      assert_events_and_state(
        initial_events,
        [
          %RegisterApplicationInstance{
            sap_system_id: sap_system_id,
            host_id: host_id,
            instance_number: absent_app_instance_number,
            status: Status.green(),
            ensa_version: ensa_version,
            features: "ABAP",
            database_health: :passing
          },
          %RegisterApplicationInstance{
            sap_system_id: sap_system_id,
            host_id: host_id,
            instance_number: present_message_server_instance_number,
            status: Status.green(),
            ensa_version: ensa_version,
            features: "MESSAGESERVER",
            database_health: :passing
          }
        ],
        [
          %ApplicationInstanceMarkedPresent{
            instance_number: absent_app_instance_number,
            host_id: host_id,
            sap_system_id: sap_system_id
          }
        ],
        fn state ->
          assert %SapSystem{
                   sid: ^sid,
                   ensa_version: ^ensa_version,
                   instances: [
                     %Instance{
                       absent_at: nil
                     },
                     %Instance{
                       absent_at: nil
                     }
                   ]
                 } = state
        end
      )
    end
  end

  describe "SAP system marked stale/in sync" do
    test "should mark application instance data as stale" do
      sap_system_id = Faker.UUID.v4()
      sid = fake_sid()
      host_id = Faker.UUID.v4()
      instance_number = "00"
      stale_at = DateTime.utc_now()

      initial_events = [
        build(:application_instance_registered_event,
          sap_system_id: sap_system_id,
          sid: sid,
          host_id: host_id,
          instance_number: instance_number,
          features: "MESSAGESERVER"
        ),
        build(:sap_system_registered_event,
          sap_system_id: sap_system_id,
          sid: sid
        )
      ]

      assert_events_and_state(
        initial_events,
        %MarkApplicationInstanceDataStale{
          sap_system_id: sap_system_id,
          instance_number: instance_number,
          host_id: host_id,
          stale_at: stale_at
        },
        [
          %ApplicationInstanceDataMarkedStale{
            sap_system_id: sap_system_id,
            instance_number: instance_number,
            host_id: host_id,
            stale_at: stale_at
          },
          %SapSystemDataMarkedStale{
            sap_system_id: sap_system_id,
            stale_at: stale_at
          }
        ],
        fn state ->
          assert %SapSystem{
                   stale_at: ^stale_at,
                   instances: [
                     %Instance{
                       instance_number: ^instance_number,
                       stale_at: ^stale_at
                     }
                   ]
                 } = state
        end
      )
    end

    test "should not mark application instance data as stale if already stale" do
      sap_system_id = Faker.UUID.v4()
      sid = fake_sid()
      host_id = Faker.UUID.v4()
      instance_number = "00"
      stale_at = DateTime.utc_now()

      initial_events = [
        build(:application_instance_registered_event,
          sap_system_id: sap_system_id,
          sid: sid,
          host_id: host_id,
          instance_number: instance_number,
          features: "MESSAGESERVER"
        ),
        build(:sap_system_registered_event,
          sap_system_id: sap_system_id,
          sid: sid
        ),
        build(:application_instance_data_marked_stale_event,
          sap_system_id: sap_system_id,
          instance_number: instance_number,
          host_id: host_id,
          stale_at: stale_at
        )
      ]

      assert_events_and_state(
        initial_events,
        %MarkApplicationInstanceDataStale{
          sap_system_id: sap_system_id,
          instance_number: instance_number,
          host_id: host_id,
          stale_at: DateTime.utc_now()
        },
        [],
        fn state ->
          assert %SapSystem{
                   instances: [
                     %Instance{
                       instance_number: ^instance_number,
                       stale_at: ^stale_at
                     }
                   ]
                 } = state
        end
      )
    end

    test "should mark application instance data as in sync when data from a stale instance is received" do
      sap_system_id = Faker.UUID.v4()
      sid = fake_sid()
      host_id = Faker.UUID.v4()
      instance_number = "00"

      initial_events = [
        build(:application_instance_registered_event,
          sap_system_id: sap_system_id,
          sid: sid,
          host_id: host_id,
          instance_number: instance_number,
          features: "MESSAGESERVER"
        ),
        build(:sap_system_registered_event,
          sap_system_id: sap_system_id,
          sid: sid
        ),
        build(:application_instance_data_marked_stale_event,
          sap_system_id: sap_system_id,
          instance_number: instance_number,
          host_id: host_id
        ),
        build(:sap_system_data_marked_stale_event,
          sap_system_id: sap_system_id
        )
      ]

      command =
        build(:register_application_instance_command,
          sap_system_id: sap_system_id,
          sid: sid,
          host_id: host_id,
          instance_number: instance_number,
          features: "MESSAGESERVER"
        )

      assert_events_and_state(
        initial_events,
        command,
        [
          %ApplicationInstanceDataMarkedInSync{
            sap_system_id: sap_system_id,
            instance_number: instance_number,
            host_id: host_id
          },
          %SapSystemDataMarkedInSync{
            sap_system_id: sap_system_id
          }
        ],
        fn state ->
          assert %SapSystem{
                   stale_at: nil,
                   instances: [
                     %Instance{
                       instance_number: ^instance_number,
                       stale_at: nil
                     }
                   ]
                 } = state
        end
      )
    end

    test "should not mark application instance data as in sync if already in sync" do
      sap_system_id = Faker.UUID.v4()
      sid = fake_sid()
      host_id = Faker.UUID.v4()
      instance_number = "00"

      initial_events = [
        build(:application_instance_registered_event,
          sap_system_id: sap_system_id,
          sid: sid,
          host_id: host_id,
          instance_number: instance_number,
          features: "MESSAGESERVER"
        ),
        build(:sap_system_registered_event,
          sap_system_id: sap_system_id,
          sid: sid
        )
      ]

      command =
        build(:register_application_instance_command,
          sap_system_id: sap_system_id,
          sid: sid,
          host_id: host_id,
          instance_number: instance_number,
          features: "MESSAGESERVER"
        )

      assert_events_and_state(
        initial_events,
        command,
        [],
        fn state ->
          assert %SapSystem{
                   instances: [
                     %Instance{
                       instance_number: ^instance_number,
                       stale_at: nil
                     }
                   ]
                 } = state
        end
      )
    end

    test "should not mark SAP system data as stale again if other instance was already stale" do
      sap_system_id = Faker.UUID.v4()
      sid = fake_sid()
      host_id_1 = Faker.UUID.v4()
      host_id_2 = Faker.UUID.v4()
      instance_number_1 = "00"
      instance_number_2 = "01"
      stale_at_1 = DateTime.utc_now()
      stale_at_2 = DateTime.add(stale_at_1, 1, :day)

      initial_events = [
        build(:application_instance_registered_event,
          sap_system_id: sap_system_id,
          sid: sid,
          host_id: host_id_1,
          instance_number: instance_number_1,
          features: "MESSAGESERVER"
        ),
        build(:application_instance_registered_event,
          sap_system_id: sap_system_id,
          sid: sid,
          host_id: host_id_2,
          instance_number: instance_number_2,
          features: "ABAP"
        ),
        build(:sap_system_registered_event,
          sap_system_id: sap_system_id,
          sid: sid
        ),
        build(:application_instance_data_marked_stale_event,
          sap_system_id: sap_system_id,
          instance_number: instance_number_1,
          host_id: host_id_1,
          stale_at: stale_at_1
        ),
        build(:sap_system_data_marked_stale_event,
          sap_system_id: sap_system_id,
          stale_at: stale_at_1
        )
      ]

      assert_events_and_state(
        initial_events,
        %MarkApplicationInstanceDataStale{
          sap_system_id: sap_system_id,
          instance_number: instance_number_2,
          host_id: host_id_2,
          stale_at: stale_at_2
        },
        [
          %ApplicationInstanceDataMarkedStale{
            sap_system_id: sap_system_id,
            instance_number: instance_number_2,
            host_id: host_id_2,
            stale_at: stale_at_2
          }
        ],
        fn state ->
          assert %SapSystem{
                   stale_at: ^stale_at_1
                 } = state
        end
      )
    end

    test "should mark SAP system data as in sync when a stale instance receives new data" do
      sap_system_id = Faker.UUID.v4()
      sid = fake_sid()
      host_id = Faker.UUID.v4()
      instance_number = "00"
      stale_at = DateTime.utc_now()

      initial_events = [
        build(:application_instance_registered_event,
          sap_system_id: sap_system_id,
          sid: sid,
          host_id: host_id,
          instance_number: instance_number,
          features: "MESSAGESERVER"
        ),
        build(:sap_system_registered_event,
          sap_system_id: sap_system_id,
          sid: sid
        ),
        build(:application_instance_data_marked_stale_event,
          sap_system_id: sap_system_id,
          instance_number: instance_number,
          host_id: host_id,
          stale_at: stale_at
        ),
        build(:sap_system_data_marked_stale_event,
          sap_system_id: sap_system_id,
          stale_at: stale_at
        )
      ]

      command =
        build(:register_application_instance_command,
          sap_system_id: sap_system_id,
          sid: sid,
          host_id: host_id,
          instance_number: instance_number,
          features: "MESSAGESERVER"
        )

      assert_events_and_state(
        initial_events,
        command,
        [
          %ApplicationInstanceDataMarkedInSync{
            sap_system_id: sap_system_id,
            instance_number: instance_number,
            host_id: host_id
          },
          %SapSystemDataMarkedInSync{
            sap_system_id: sap_system_id
          }
        ],
        fn state ->
          assert %SapSystem{
                   stale_at: nil,
                   instances: [
                     %Instance{
                       instance_number: ^instance_number,
                       stale_at: nil
                     }
                   ]
                 } = state
        end
      )
    end

    test "should mark SAP system data as in sync when a stale instance is deregistered" do
      sap_system_id = Faker.UUID.v4()
      sid = fake_sid()
      host_id_1 = Faker.UUID.v4()
      host_id_2 = Faker.UUID.v4()
      instance_number_1 = "00"
      instance_number_2 = "01"
      stale_at = DateTime.utc_now()
      deregistered_at = DateTime.utc_now()

      initial_events = [
        build(:application_instance_registered_event,
          sap_system_id: sap_system_id,
          sid: sid,
          host_id: host_id_1,
          instance_number: instance_number_1,
          features: "ENQREP"
        ),
        build(:application_instance_registered_event,
          sap_system_id: sap_system_id,
          sid: sid,
          host_id: host_id_2,
          instance_number: instance_number_2,
          features: "MESSAGESERVER"
        ),
        build(:application_instance_registered_event,
          sap_system_id: sap_system_id,
          sid: sid,
          host_id: host_id_2,
          instance_number: "02",
          features: "ABAP"
        ),
        build(:sap_system_registered_event,
          sap_system_id: sap_system_id,
          sid: sid
        ),
        build(:application_instance_data_marked_stale_event,
          sap_system_id: sap_system_id,
          instance_number: instance_number_1,
          host_id: host_id_1,
          stale_at: stale_at
        ),
        build(:sap_system_data_marked_stale_event,
          sap_system_id: sap_system_id,
          stale_at: stale_at
        )
      ]

      assert_events_and_state(
        initial_events,
        %DeregisterApplicationInstance{
          sap_system_id: sap_system_id,
          host_id: host_id_1,
          instance_number: instance_number_1,
          deregistered_at: deregistered_at
        },
        [
          %ApplicationInstanceDeregistered{
            sap_system_id: sap_system_id,
            host_id: host_id_1,
            instance_number: instance_number_1,
            deregistered_at: deregistered_at
          },
          %SapSystemDataMarkedInSync{
            sap_system_id: sap_system_id
          }
        ],
        fn state ->
          assert %SapSystem{
                   stale_at: nil,
                   deregistered_at: nil
                 } = state
        end
      )
    end

    test "should not mark SAP system data as in sync when an instance is deregistered but more stale instances are present" do
      sap_system_id = Faker.UUID.v4()
      sid = fake_sid()
      host_id_1 = Faker.UUID.v4()
      host_id_2 = Faker.UUID.v4()
      host_id_3 = Faker.UUID.v4()
      instance_number_1 = "00"
      instance_number_2 = "01"
      instance_number_3 = "02"
      stale_at = DateTime.utc_now()
      deregistered_at = DateTime.utc_now()

      initial_events = [
        build(:application_instance_registered_event,
          sap_system_id: sap_system_id,
          sid: sid,
          host_id: host_id_1,
          instance_number: instance_number_1,
          features: "MESSAGESERVER"
        ),
        build(:application_instance_registered_event,
          sap_system_id: sap_system_id,
          sid: sid,
          host_id: host_id_2,
          instance_number: instance_number_2,
          features: "ABAP"
        ),
        build(:sap_system_registered_event,
          sap_system_id: sap_system_id,
          sid: sid
        ),
        build(:application_instance_registered_event,
          sap_system_id: sap_system_id,
          sid: sid,
          host_id: host_id_3,
          instance_number: instance_number_3,
          features: "ENQREP"
        ),
        build(:application_instance_data_marked_stale_event,
          sap_system_id: sap_system_id,
          instance_number: instance_number_1,
          host_id: host_id_1,
          stale_at: stale_at
        ),
        build(:sap_system_data_marked_stale_event,
          sap_system_id: sap_system_id,
          stale_at: stale_at
        ),
        build(:application_instance_data_marked_stale_event,
          sap_system_id: sap_system_id,
          instance_number: instance_number_3,
          host_id: host_id_3,
          stale_at: DateTime.add(stale_at, 1, :day)
        )
      ]

      assert_events_and_state(
        initial_events,
        %DeregisterApplicationInstance{
          sap_system_id: sap_system_id,
          host_id: host_id_3,
          instance_number: instance_number_3,
          deregistered_at: deregistered_at
        },
        [
          %ApplicationInstanceDeregistered{
            sap_system_id: sap_system_id,
            host_id: host_id_3,
            instance_number: instance_number_3,
            deregistered_at: deregistered_at
          }
        ],
        fn state ->
          assert %SapSystem{
                   stale_at: ^stale_at,
                   deregistered_at: nil,
                   instances: [
                     %Instance{
                       instance_number: ^instance_number_2,
                       stale_at: nil
                     },
                     %Instance{
                       instance_number: ^instance_number_1,
                       stale_at: ^stale_at
                     }
                   ]
                 } = state
        end
      )
    end

    test "should not mark sap system data as in sync when an instance is deregistered if the system was already in sync" do
      sap_system_id = Faker.UUID.v4()
      sid = fake_sid()
      host_id_1 = Faker.UUID.v4()
      host_id_2 = Faker.UUID.v4()
      host_id_3 = Faker.UUID.v4()
      instance_number_1 = "00"
      instance_number_2 = "01"
      instance_number_3 = "02"
      deregistered_at = DateTime.utc_now()

      initial_events = [
        build(:application_instance_registered_event,
          sap_system_id: sap_system_id,
          sid: sid,
          host_id: host_id_1,
          instance_number: instance_number_1,
          features: "MESSAGESERVER"
        ),
        build(:application_instance_registered_event,
          sap_system_id: sap_system_id,
          sid: sid,
          host_id: host_id_2,
          instance_number: instance_number_2,
          features: "ABAP"
        ),
        build(:sap_system_registered_event,
          sap_system_id: sap_system_id,
          sid: sid
        ),
        build(:application_instance_registered_event,
          sap_system_id: sap_system_id,
          sid: sid,
          host_id: host_id_3,
          instance_number: instance_number_3,
          features: "ENQREP"
        )
      ]

      assert_events_and_state(
        initial_events,
        %DeregisterApplicationInstance{
          sap_system_id: sap_system_id,
          host_id: host_id_3,
          instance_number: instance_number_3,
          deregistered_at: deregistered_at
        },
        [
          %ApplicationInstanceDeregistered{
            sap_system_id: sap_system_id,
            host_id: host_id_3,
            instance_number: instance_number_3,
            deregistered_at: deregistered_at
          }
        ],
        fn state ->
          assert %SapSystem{
                   stale_at: nil,
                   deregistered_at: nil,
                   instances: [
                     %Instance{
                       instance_number: ^instance_number_2,
                       stale_at: nil
                     },
                     %Instance{
                       instance_number: ^instance_number_1,
                       stale_at: nil
                     }
                   ]
                 } = state
        end
      )
    end

    test "should mark SAP system as stale when database goes stale and system was in sync" do
      sap_system_id = Faker.UUID.v4()
      sid = fake_sid()
      database_stale_at = DateTime.utc_now()

      initial_events = [
        build(:application_instance_registered_event,
          sap_system_id: sap_system_id,
          sid: sid,
          features: "MESSAGESERVER"
        ),
        build(:sap_system_registered_event,
          sap_system_id: sap_system_id,
          sid: sid
        )
      ]

      assert_events_and_state(
        initial_events,
        UpdateDatabaseStaleAt.new!(%{
          sap_system_id: sap_system_id,
          database_stale_at: database_stale_at
        }),
        [
          %SapSystemDatabaseStaleAtChanged{
            sap_system_id: sap_system_id,
            database_stale_at: database_stale_at
          },
          %SapSystemDataMarkedStale{
            sap_system_id: sap_system_id,
            stale_at: database_stale_at
          }
        ],
        fn state ->
          assert %SapSystem{
                   stale_at: ^database_stale_at,
                   database_stale_at: ^database_stale_at
                 } = state
        end
      )
    end

    test "should not mark SAP system as stale again when database goes stale and system was already stale" do
      sap_system_id = Faker.UUID.v4()
      sid = fake_sid()
      host_id = Faker.UUID.v4()
      instance_number = "00"
      instance_stale_at = DateTime.utc_now()
      database_stale_at = DateTime.add(instance_stale_at, 60, :second)

      initial_events = [
        build(:application_instance_registered_event,
          sap_system_id: sap_system_id,
          sid: sid,
          host_id: host_id,
          instance_number: instance_number,
          features: "MESSAGESERVER"
        ),
        build(:sap_system_registered_event,
          sap_system_id: sap_system_id,
          sid: sid
        ),
        build(:application_instance_data_marked_stale_event,
          sap_system_id: sap_system_id,
          instance_number: instance_number,
          host_id: host_id,
          stale_at: instance_stale_at
        ),
        build(:sap_system_data_marked_stale_event,
          sap_system_id: sap_system_id,
          stale_at: instance_stale_at
        )
      ]

      assert_events_and_state(
        initial_events,
        UpdateDatabaseStaleAt.new!(%{
          sap_system_id: sap_system_id,
          database_stale_at: database_stale_at
        }),
        [
          %SapSystemDatabaseStaleAtChanged{
            sap_system_id: sap_system_id,
            database_stale_at: database_stale_at
          }
        ],
        fn state ->
          assert %SapSystem{
                   stale_at: ^instance_stale_at,
                   database_stale_at: ^database_stale_at
                 } = state
        end
      )
    end

    test "should mark SAP system as in sync when database goes in sync and all instances are in sync" do
      sap_system_id = Faker.UUID.v4()
      sid = fake_sid()
      database_stale_at = DateTime.utc_now()

      initial_events = [
        build(:application_instance_registered_event,
          sap_system_id: sap_system_id,
          sid: sid,
          features: "MESSAGESERVER"
        ),
        build(:sap_system_registered_event,
          sap_system_id: sap_system_id,
          sid: sid
        ),
        build(:sap_system_database_stale_at_changed_event,
          sap_system_id: sap_system_id,
          database_stale_at: database_stale_at
        ),
        build(:sap_system_data_marked_stale_event,
          sap_system_id: sap_system_id,
          stale_at: database_stale_at
        )
      ]

      assert_events_and_state(
        initial_events,
        UpdateDatabaseStaleAt.new!(%{
          sap_system_id: sap_system_id,
          database_stale_at: nil
        }),
        [
          %SapSystemDatabaseStaleAtChanged{
            sap_system_id: sap_system_id,
            database_stale_at: nil
          },
          %SapSystemDataMarkedInSync{
            sap_system_id: sap_system_id
          }
        ],
        fn state ->
          assert %SapSystem{
                   stale_at: nil,
                   database_stale_at: nil
                 } = state
        end
      )
    end

    test "should not mark SAP system as in sync when database goes in sync but instances are still stale" do
      sap_system_id = Faker.UUID.v4()
      sid = fake_sid()
      host_id = Faker.UUID.v4()
      instance_number = "00"
      instance_stale_at = DateTime.utc_now()
      database_stale_at = DateTime.add(instance_stale_at, 60, :second)

      initial_events = [
        build(:application_instance_registered_event,
          sap_system_id: sap_system_id,
          sid: sid,
          host_id: host_id,
          instance_number: instance_number,
          features: "MESSAGESERVER"
        ),
        build(:sap_system_registered_event,
          sap_system_id: sap_system_id,
          sid: sid
        ),
        build(:application_instance_data_marked_stale_event,
          sap_system_id: sap_system_id,
          instance_number: instance_number,
          host_id: host_id,
          stale_at: instance_stale_at
        ),
        build(:sap_system_data_marked_stale_event,
          sap_system_id: sap_system_id,
          stale_at: instance_stale_at
        ),
        build(:sap_system_database_stale_at_changed_event,
          sap_system_id: sap_system_id,
          database_stale_at: database_stale_at
        )
      ]

      assert_events_and_state(
        initial_events,
        UpdateDatabaseStaleAt.new!(%{
          sap_system_id: sap_system_id,
          database_stale_at: nil
        }),
        [
          %SapSystemDatabaseStaleAtChanged{
            sap_system_id: sap_system_id,
            database_stale_at: nil
          }
        ],
        fn state ->
          assert %SapSystem{
                   stale_at: ^instance_stale_at,
                   database_stale_at: nil,
                   instances: [
                     %Instance{
                       instance_number: ^instance_number,
                       stale_at: ^instance_stale_at
                     }
                   ]
                 } = state
        end
      )
    end

    test "should not emit any events when database stale_at is the same" do
      sap_system_id = Faker.UUID.v4()
      sid = fake_sid()
      database_stale_at = DateTime.utc_now()

      initial_events = [
        build(:application_instance_registered_event,
          sap_system_id: sap_system_id,
          sid: sid,
          features: "MESSAGESERVER"
        ),
        build(:sap_system_registered_event,
          sap_system_id: sap_system_id,
          sid: sid
        ),
        build(:sap_system_database_stale_at_changed_event,
          sap_system_id: sap_system_id,
          database_stale_at: database_stale_at
        ),
        build(:sap_system_data_marked_stale_event,
          sap_system_id: sap_system_id,
          stale_at: database_stale_at
        )
      ]

      assert_events_and_state(
        initial_events,
        UpdateDatabaseStaleAt.new!(%{
          sap_system_id: sap_system_id,
          database_stale_at: database_stale_at
        }),
        [],
        fn state ->
          assert %SapSystem{
                   stale_at: ^database_stale_at,
                   database_stale_at: ^database_stale_at
                 } = state
        end
      )
    end

    test "should not override SAP system stale_at when database goes stale after an instance" do
      sap_system_id = Faker.UUID.v4()
      sid = fake_sid()
      host_id = Faker.UUID.v4()
      instance_number = "00"
      instance_stale_at = DateTime.utc_now()
      database_stale_at = DateTime.add(instance_stale_at, 60, :second)

      initial_events = [
        build(:application_instance_registered_event,
          sap_system_id: sap_system_id,
          sid: sid,
          host_id: host_id,
          instance_number: instance_number,
          features: "MESSAGESERVER"
        ),
        build(:sap_system_registered_event,
          sap_system_id: sap_system_id,
          sid: sid
        ),
        build(:application_instance_data_marked_stale_event,
          sap_system_id: sap_system_id,
          instance_number: instance_number,
          host_id: host_id,
          stale_at: instance_stale_at
        ),
        build(:sap_system_data_marked_stale_event,
          sap_system_id: sap_system_id,
          stale_at: instance_stale_at
        )
      ]

      assert_events_and_state(
        initial_events,
        UpdateDatabaseStaleAt.new!(%{
          sap_system_id: sap_system_id,
          database_stale_at: database_stale_at
        }),
        [
          %SapSystemDatabaseStaleAtChanged{
            sap_system_id: sap_system_id,
            database_stale_at: database_stale_at
          }
        ],
        fn state ->
          assert %SapSystem{
                   stale_at: ^instance_stale_at,
                   database_stale_at: ^database_stale_at
                 } = state
        end
      )
    end

    test "should mark SAP system data as in sync when the SAP is restored and database sync state has changed" do
      sap_system_id = UUID.uuid4()

      database_host_id = UUID.uuid4()
      database_stale_at = DateTime.utc_now()

      deregistered_at = DateTime.utc_now()

      application_sid = fake_sid()

      message_server_host_id = UUID.uuid4()
      message_server_instance_number = "00"
      abap_host_id = UUID.uuid4()
      abap_instance_number = "01"

      initial_events = [
        build(
          :application_instance_registered_event,
          sap_system_id: sap_system_id,
          features: "MESSAGESERVER|ENQUE",
          host_id: message_server_host_id,
          instance_number: message_server_instance_number,
          sid: application_sid
        ),
        build(
          :application_instance_registered_event,
          sap_system_id: sap_system_id,
          features: "ABAP|GATEWAY|ICMAN|IGS",
          host_id: abap_host_id,
          instance_number: abap_instance_number,
          sid: application_sid
        ),
        build(
          :sap_system_registered_event,
          sap_system_id: sap_system_id,
          sid: application_sid
        ),
        build(
          :sap_system_database_stale_at_changed_event,
          sap_system_id: sap_system_id,
          database_stale_at: database_stale_at
        ),
        build(:sap_system_data_marked_stale_event,
          sap_system_id: sap_system_id,
          stale_at: database_stale_at
        ),
        build(:sap_system_deregistered_event,
          sap_system_id: sap_system_id,
          deregistered_at: deregistered_at
        ),
        build(:application_instance_deregistered_event,
          sap_system_id: sap_system_id,
          deregistered_at: deregistered_at,
          instance_number: message_server_instance_number,
          host_id: message_server_host_id
        )
      ]

      command =
        build(
          :register_application_instance_command,
          sap_system_id: sap_system_id,
          sid: application_sid,
          db_host: database_host_id,
          features: "MESSAGESERVER",
          database_stale_at: nil
        )

      assert_events_and_state(
        initial_events,
        command,
        [
          %ApplicationInstanceRegistered{
            sap_system_id: sap_system_id,
            sid: application_sid,
            host_id: command.host_id,
            instance_number: command.instance_number,
            instance_hostname: command.instance_hostname,
            features: command.features,
            http_port: command.http_port,
            https_port: command.https_port,
            start_priority: command.start_priority,
            status: command.status
          },
          %SapSystemRestored{
            sap_system_id: sap_system_id,
            tenant: command.tenant,
            db_host: command.db_host,
            health: :passing,
            database_health: command.database_health,
            database_stale_at: command.database_stale_at
          },
          %SapSystemDataMarkedInSync{
            sap_system_id: sap_system_id
          }
        ],
        fn sap_system ->
          assert %SapSystem{
                   health: :passing,
                   database_health: :passing,
                   database_stale_at: nil,
                   deregistered_at: nil
                 } = sap_system
        end
      )
    end
  end

  defp fake_sid,
    do: Enum.join([Faker.Util.letter(), Faker.Util.letter(), Faker.Util.letter()])
end
