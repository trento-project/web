defmodule Trento.SapSystemTest do
  use Trento.AggregateCase, aggregate: Trento.Domain.SapSystem, async: true

  import Trento.Factory

  alias Trento.Domain.Commands.{
    RegisterApplicationInstance,
    RegisterDatabaseInstance,
    RollUpSapSystem
  }

  alias Trento.Domain.Events.{
    ApplicationInstanceHealthChanged,
    ApplicationInstanceRegistered,
    DatabaseHealthChanged,
    DatabaseInstanceHealthChanged,
    DatabaseInstanceRegistered,
    DatabaseInstanceSystemReplicationChanged,
    DatabaseRegistered,
    SapSystemHealthChanged,
    SapSystemRegistered,
    SapSystemRolledUp,
    SapSystemRollUpRequested
  }

  alias Trento.Domain.SapSystem

  describe "SAP System registration" do
    test "should fail when a sap system not exists and the database instance has Secondary role" do
      command =
        build(:register_database_instance_command,
          system_replication: "Secondary"
        )

      assert_error(
        command,
        {:error, :sap_system_not_registered}
      )
    end

    test "should create an incomplete SAP system aggregate and register a database instance when the system replication is disabled" do
      sap_system_id = Faker.UUID.v4()
      sid = Faker.StarWars.planet()
      tenant = Faker.Beer.style()
      instance_number = "00"
      instance_hostname = Faker.Airports.iata()
      features = Faker.Pokemon.name()
      http_port = 80
      https_port = 443
      start_priority = "0.9"
      host_id = Faker.UUID.v4()

      assert_events_and_state(
        [],
        RegisterDatabaseInstance.new!(%{
          sap_system_id: sap_system_id,
          sid: sid,
          tenant: tenant,
          instance_number: instance_number,
          instance_hostname: instance_hostname,
          features: features,
          http_port: http_port,
          https_port: https_port,
          start_priority: start_priority,
          host_id: host_id,
          system_replication: nil,
          health: :passing
        }),
        [
          %DatabaseRegistered{
            sap_system_id: sap_system_id,
            sid: sid,
            health: :passing
          },
          %DatabaseInstanceRegistered{
            sap_system_id: sap_system_id,
            sid: sid,
            tenant: tenant,
            instance_number: instance_number,
            instance_hostname: instance_hostname,
            features: features,
            http_port: http_port,
            https_port: https_port,
            start_priority: start_priority,
            host_id: host_id,
            system_replication: nil,
            system_replication_status: nil,
            health: :passing
          }
        ],
        %SapSystem{
          sap_system_id: sap_system_id,
          # The SAP System aggregate is not complete yet.
          # The sid will be set when the first application instance is registered.
          sid: nil,
          database: %SapSystem.Database{
            sid: sid,
            health: :passing,
            instances: [
              %SapSystem.Instance{
                sid: sid,
                system_replication: nil,
                system_replication_status: nil,
                instance_number: instance_number,
                features: features,
                host_id: host_id,
                health: :passing
              }
            ]
          }
        }
      )
    end

    test "should create an incomplete SAP system aggregate and register a database instance when the system replication is enabled and the database role is primary" do
      sap_system_id = Faker.UUID.v4()
      sid = Faker.StarWars.planet()
      tenant = Faker.Beer.style()
      instance_number = "00"
      instance_hostname = Faker.Airports.iata()
      features = Faker.Pokemon.name()
      http_port = 80
      https_port = 443
      start_priority = "0.9"
      host_id = Faker.UUID.v4()

      assert_events_and_state(
        [],
        RegisterDatabaseInstance.new!(%{
          sap_system_id: sap_system_id,
          sid: sid,
          tenant: tenant,
          instance_number: instance_number,
          instance_hostname: instance_hostname,
          features: features,
          http_port: http_port,
          https_port: https_port,
          start_priority: start_priority,
          host_id: host_id,
          system_replication: "Primary",
          system_replication_status: "ACTIVE",
          health: :passing
        }),
        [
          %DatabaseRegistered{
            sap_system_id: sap_system_id,
            sid: sid,
            health: :passing
          },
          %DatabaseInstanceRegistered{
            sap_system_id: sap_system_id,
            sid: sid,
            tenant: tenant,
            instance_number: instance_number,
            instance_hostname: instance_hostname,
            features: features,
            http_port: http_port,
            https_port: https_port,
            start_priority: start_priority,
            host_id: host_id,
            system_replication: "Primary",
            system_replication_status: "ACTIVE",
            health: :passing
          }
        ],
        %SapSystem{
          sap_system_id: sap_system_id,
          # The SAP System aggregate is not complete yet.
          # The sid will be set when the first application instance is registered.
          sid: nil,
          database: %SapSystem.Database{
            sid: sid,
            health: :passing,
            instances: [
              %SapSystem.Instance{
                sid: sid,
                system_replication: "Primary",
                system_replication_status: "ACTIVE",
                instance_number: instance_number,
                features: features,
                host_id: host_id,
                health: :passing
              }
            ]
          }
        }
      )
    end

    test "should add a database instance to an existing Database" do
      sap_system_id = Faker.UUID.v4()
      sid = Faker.StarWars.planet()
      tenant = Faker.Beer.style()
      instance_number = "00"
      features = Faker.Pokemon.name()
      host_id = Faker.UUID.v4()

      initial_events = [
        build(
          :database_registered_event,
          sap_system_id: sap_system_id,
          sid: sid
        ),
        build(
          :database_instance_registered_event,
          sap_system_id: sap_system_id,
          sid: sid,
          tenant: tenant,
          instance_number: "10"
        )
      ]

      assert_events_and_state(
        initial_events,
        build(
          :register_database_instance_command,
          sap_system_id: sap_system_id,
          sid: sid,
          tenant: tenant,
          instance_number: instance_number,
          features: features,
          host_id: host_id,
          health: :passing
        ),
        build(
          :database_instance_registered_event,
          sap_system_id: sap_system_id,
          sid: sid,
          tenant: tenant,
          instance_number: instance_number,
          features: features,
          host_id: host_id,
          health: :passing
        ),
        fn state ->
          assert %SapSystem{
                   database: %SapSystem.Database{
                     instances: [
                       %SapSystem.Instance{
                         sid: ^sid,
                         instance_number: ^instance_number,
                         features: ^features,
                         host_id: ^host_id,
                         health: :passing
                       }
                       | _
                     ]
                   }
                 } = state
        end
      )
    end

    test "should not add a database instance if the database instance was already registered" do
      database_registered_event = build(:database_registered_event)

      database_instance_registered_event =
        build(
          :database_instance_registered_event,
          sap_system_id: database_registered_event.sap_system_id
        )

      initial_events = [
        database_registered_event,
        database_instance_registered_event
      ]

      assert_events(
        initial_events,
        build(
          :register_database_instance_command,
          sap_system_id: database_registered_event.sap_system_id,
          sid: database_instance_registered_event.sid,
          tenant: database_instance_registered_event.tenant,
          instance_number: database_instance_registered_event.instance_number,
          features: database_instance_registered_event.features,
          host_id: database_instance_registered_event.host_id,
          system_replication: database_instance_registered_event.system_replication,
          system_replication_status: database_instance_registered_event.system_replication_status,
          health: :passing
        ),
        []
      )
    end

    test "should change the system replication of a database instance" do
      database_registered_event = build(:database_registered_event)

      database_instance_registered_event =
        build(
          :database_instance_registered_event,
          sap_system_id: database_registered_event.sap_system_id,
          system_replication: "Secondary",
          system_replication_status: ""
        )

      initial_events = [
        database_registered_event,
        database_instance_registered_event
      ]

      assert_events(
        initial_events,
        build(
          :register_database_instance_command,
          sap_system_id: database_registered_event.sap_system_id,
          sid: database_instance_registered_event.sid,
          tenant: database_instance_registered_event.tenant,
          instance_number: database_instance_registered_event.instance_number,
          features: database_instance_registered_event.features,
          host_id: database_instance_registered_event.host_id,
          system_replication: "Primary",
          system_replication_status: "ACTIVE",
          health: :passing
        ),
        %DatabaseInstanceSystemReplicationChanged{
          sap_system_id: database_registered_event.sap_system_id,
          host_id: database_instance_registered_event.host_id,
          instance_number: database_instance_registered_event.instance_number,
          system_replication: "Primary",
          system_replication_status: "ACTIVE"
        }
      )
    end

    test "should register a SAP System and add an application instance" do
      sap_system_id = Faker.UUID.v4()
      sid = Faker.StarWars.planet()
      db_host = Faker.Internet.ip_v4_address()
      tenant = Faker.Beer.style()
      instance_hostname = Faker.Airports.iata()
      features = Faker.Pokemon.name()
      http_port = 80
      https_port = 443
      start_priority = "0.9"
      host_id = Faker.UUID.v4()

      initial_events = [
        build(
          :database_registered_event,
          sap_system_id: sap_system_id,
          sid: sid
        ),
        build(
          :database_instance_registered_event,
          sap_system_id: sap_system_id,
          sid: sid,
          tenant: tenant
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
          features: features,
          http_port: http_port,
          https_port: https_port,
          start_priority: start_priority,
          host_id: host_id,
          health: :passing
        }),
        [
          %SapSystemRegistered{
            sap_system_id: sap_system_id,
            sid: sid,
            db_host: db_host,
            tenant: tenant,
            health: :passing
          },
          %ApplicationInstanceRegistered{
            sap_system_id: sap_system_id,
            sid: sid,
            instance_number: "00",
            instance_hostname: instance_hostname,
            features: features,
            http_port: http_port,
            https_port: https_port,
            start_priority: start_priority,
            host_id: host_id,
            health: :passing
          }
        ],
        fn state ->
          assert %SapSystem{
                   sid: ^sid,
                   application: %SapSystem.Application{
                     sid: ^sid,
                     instances: [
                       %SapSystem.Instance{
                         sid: ^sid,
                         instance_number: "00",
                         features: ^features,
                         host_id: ^host_id,
                         health: :passing
                       }
                     ]
                   }
                 } = state
        end
      )
    end

    test "should add an application instance to a registered SAP System" do
      sap_system_id = Faker.UUID.v4()
      sid = Faker.StarWars.planet()

      initial_events = [
        build(:database_registered_event, sap_system_id: sap_system_id, sid: sid),
        build(:database_instance_registered_event, sap_system_id: sap_system_id, sid: sid),
        build(:sap_system_registered_event, sap_system_id: sap_system_id, sid: sid),
        build(:application_instance_registered_event, sap_system_id: sap_system_id, sid: sid)
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
          health: :passing
        ),
        build(
          :application_instance_registered_event,
          sap_system_id: sap_system_id,
          sid: sid,
          instance_number: new_instance_number,
          features: new_instance_features,
          host_id: new_instance_host_id,
          health: :passing
        ),
        fn state ->
          assert %SapSystem{
                   application: %SapSystem.Application{
                     sid: ^sid,
                     instances: [
                       %SapSystem.Instance{
                         sid: ^sid,
                         instance_number: ^new_instance_number,
                         features: ^new_instance_features,
                         host_id: ^new_instance_host_id,
                         health: :passing
                       }
                       | _
                     ]
                   }
                 } = state
        end
      )
    end

    test "should not add an application instance if the application instance was already registered" do
      sap_system_id = Faker.UUID.v4()

      application_instance_registered_event =
        build(:application_instance_registered_event, sap_system_id: sap_system_id)

      initial_events = [
        build(:database_registered_event, sap_system_id: sap_system_id),
        build(:database_instance_registered_event, sap_system_id: sap_system_id),
        build(:sap_system_registered_event, sap_system_id: sap_system_id),
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
          health: :passing
        ),
        []
      )
    end
  end

  describe "SAP System health" do
    test "should change the health of a Database when a new Database instance is registered" do
      sap_system_id = Faker.UUID.v4()
      sid = Faker.StarWars.planet()
      tenant = Faker.Beer.style()
      instance_number = "00"
      features = Faker.Pokemon.name()
      host_id = Faker.UUID.v4()

      initial_events = [
        build(:database_registered_event, sap_system_id: sap_system_id),
        build(:database_instance_registered_event, sap_system_id: sap_system_id)
      ]

      assert_events_and_state(
        initial_events,
        build(
          :register_database_instance_command,
          sap_system_id: sap_system_id,
          sid: sid,
          tenant: tenant,
          instance_number: instance_number,
          features: features,
          host_id: host_id,
          health: :critical
        ),
        [
          build(
            :database_instance_registered_event,
            sap_system_id: sap_system_id,
            sid: sid,
            tenant: tenant,
            instance_number: instance_number,
            features: features,
            host_id: host_id,
            health: :critical
          ),
          %DatabaseHealthChanged{
            sap_system_id: sap_system_id,
            health: :critical
          }
        ],
        fn state ->
          %SapSystem{
            database: %SapSystem.Database{
              health: :critical,
              instances: [
                %SapSystem.Instance{
                  health: :critical
                },
                %SapSystem.Instance{
                  health: :passing
                }
              ]
            }
          } = state
        end
      )
    end

    test "should change the health of a Database when a Database instance has changed the health status" do
      sap_system_id = Faker.UUID.v4()
      host_id = Faker.UUID.v4()
      instance_number = "00"

      database_instance_registered_event =
        build(
          :database_instance_registered_event,
          sap_system_id: sap_system_id,
          host_id: host_id,
          instance_number: instance_number
        )

      initial_events = [
        build(:database_registered_event, sap_system_id: sap_system_id),
        database_instance_registered_event
      ]

      assert_events_and_state(
        initial_events,
        build(
          :register_database_instance_command,
          sap_system_id: sap_system_id,
          sid: database_instance_registered_event.sid,
          tenant: database_instance_registered_event.tenant,
          instance_number: instance_number,
          features: database_instance_registered_event.features,
          host_id: host_id,
          health: :critical
        ),
        [
          %DatabaseInstanceHealthChanged{
            sap_system_id: sap_system_id,
            instance_number: instance_number,
            host_id: host_id,
            health: :critical
          },
          %DatabaseHealthChanged{
            sap_system_id: sap_system_id,
            health: :critical
          }
        ],
        fn state ->
          assert %SapSystem{
                   database: %SapSystem.Database{
                     health: :critical,
                     instances: [
                       %SapSystem.Instance{
                         instance_number: ^instance_number,
                         host_id: ^host_id,
                         health: :critical
                       }
                     ]
                   }
                 } = state
        end
      )
    end

    test "should not change the health of a Database if no instance has changed the health status" do
      sap_system_id = Faker.UUID.v4()

      new_instance_number = "20"
      new_instance_features = Faker.Pokemon.name()
      new_instance_host_id = Faker.UUID.v4()

      database_instance_registered_event =
        build(
          :database_instance_registered_event,
          sap_system_id: sap_system_id,
          health: :warning
        )

      initial_events = [
        build(:database_registered_event, sap_system_id: sap_system_id, health: :warning),
        database_instance_registered_event
      ]

      assert_events_and_state(
        initial_events,
        [
          build(
            :register_database_instance_command,
            sap_system_id: sap_system_id,
            sid: database_instance_registered_event.sid,
            tenant: database_instance_registered_event.tenant,
            instance_number: database_instance_registered_event.instance_number,
            features: database_instance_registered_event.features,
            host_id: database_instance_registered_event.host_id,
            health: :warning
          ),
          build(
            :register_database_instance_command,
            sap_system_id: sap_system_id,
            sid: database_instance_registered_event.sid,
            tenant: database_instance_registered_event.tenant,
            instance_number: new_instance_number,
            features: new_instance_features,
            host_id: new_instance_host_id,
            health: :warning
          )
        ],
        [
          build(
            :database_instance_registered_event,
            sap_system_id: sap_system_id,
            sid: database_instance_registered_event.sid,
            tenant: database_instance_registered_event.tenant,
            instance_number: new_instance_number,
            features: new_instance_features,
            host_id: new_instance_host_id,
            health: :warning
          )
        ],
        fn state ->
          assert %SapSystem{
                   database: %SapSystem.Database{
                     health: :warning,
                     instances: [
                       %SapSystem.Instance{
                         health: :warning
                       },
                       %SapSystem.Instance{
                         health: :warning
                       }
                     ]
                   }
                 } = state
        end
      )
    end

    test "should change the health of a SAP System when a new Application instance is registered" do
      sap_system_id = Faker.UUID.v4()
      sid = Faker.StarWars.planet()
      tenant = Faker.Beer.style()
      db_host = Faker.Internet.ip_v4_address()
      instance_number = "00"
      features = Faker.Pokemon.name()
      host_id = Faker.UUID.v4()

      initial_events = [
        build(:database_registered_event, sap_system_id: sap_system_id),
        build(:database_instance_registered_event, sap_system_id: sap_system_id)
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
          health: :critical
        ),
        [
          %SapSystemRegistered{
            sap_system_id: sap_system_id,
            sid: sid,
            db_host: db_host,
            tenant: tenant,
            health: :critical
          },
          build(
            :application_instance_registered_event,
            sap_system_id: sap_system_id,
            sid: sid,
            instance_number: instance_number,
            features: features,
            host_id: host_id,
            health: :critical
          )
        ],
        fn state ->
          assert %SapSystem{
                   health: :critical,
                   application: %SapSystem.Application{
                     instances: [
                       %SapSystem.Instance{
                         health: :critical
                       }
                     ]
                   }
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
        build(:database_registered_event, sap_system_id: sap_system_id),
        build(:database_instance_registered_event, sap_system_id: sap_system_id),
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
          health: :critical
        ),
        [
          %ApplicationInstanceHealthChanged{
            sap_system_id: sap_system_id,
            instance_number: application_instance_registered.instance_number,
            host_id: application_instance_registered.host_id,
            health: :critical
          },
          %SapSystemHealthChanged{
            sap_system_id: sap_system_id,
            health: :critical
          }
        ],
        fn state ->
          assert %SapSystem{
                   health: :critical,
                   application: %SapSystem.Application{
                     instances: [
                       %SapSystem.Instance{
                         health: :critical
                       }
                     ]
                   }
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
          health: :warning
        )

      sap_system_registered_event =
        build(:sap_system_registered_event, sap_system_id: sap_system_id, health: :warning)

      initial_events = [
        build(:database_registered_event, sap_system_id: sap_system_id),
        build(
          :database_instance_registered_event,
          sap_system_id: sap_system_id,
          health: :warning
        ),
        sap_system_registered_event,
        application_instance_registered_event
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
            health: :warning
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
            health: :warning
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
            health: :warning
          )
        ],
        fn state ->
          assert %SapSystem{
                   health: :warning,
                   application: %SapSystem.Application{
                     instances: [
                       %SapSystem.Instance{
                         health: :warning
                       },
                       %SapSystem.Instance{
                         health: :warning
                       }
                     ]
                   }
                 } = state
        end
      )
    end

    test "should change the health of a SAP System when the Database has changed the health status" do
      sap_system_id = Faker.UUID.v4()

      new_instance_number = "20"
      new_instance_features = Faker.Pokemon.name()
      new_instance_host_id = Faker.UUID.v4()

      initial_events = [
        build(:database_registered_event, sap_system_id: sap_system_id),
        database_instance_registered_event =
          build(:database_instance_registered_event, sap_system_id: sap_system_id),
        build(:sap_system_registered_event, sap_system_id: sap_system_id),
        build(:application_instance_registered_event, sap_system_id: sap_system_id)
      ]

      assert_events_and_state(
        initial_events,
        build(
          :register_database_instance_command,
          sap_system_id: sap_system_id,
          sid: database_instance_registered_event.sid,
          tenant: database_instance_registered_event.tenant,
          instance_number: new_instance_number,
          features: new_instance_features,
          host_id: new_instance_host_id,
          health: :warning
        ),
        [
          build(
            :database_instance_registered_event,
            sap_system_id: sap_system_id,
            sid: database_instance_registered_event.sid,
            tenant: database_instance_registered_event.tenant,
            instance_number: new_instance_number,
            features: new_instance_features,
            host_id: new_instance_host_id,
            health: :warning
          ),
          %DatabaseHealthChanged{
            sap_system_id: sap_system_id,
            health: :warning
          },
          %SapSystemHealthChanged{
            sap_system_id: sap_system_id,
            health: :warning
          }
        ],
        fn state ->
          assert %SapSystem{health: :warning} = state
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

      database_instance_registered_event =
        build(:database_instance_registered_event, sap_system_id: sap_system_id, sid: sid)

      initial_events = [
        build(:database_registered_event, sap_system_id: sap_system_id, sid: sid),
        database_instance_registered_event,
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
            database: %SapSystem.Database{
              sid: sid,
              health: :passing,
              instances: [
                %SapSystem.Instance{
                  sid: sid,
                  instance_number: database_instance_registered_event.instance_number,
                  health: database_instance_registered_event.health,
                  features: database_instance_registered_event.features,
                  host_id: database_instance_registered_event.host_id,
                  system_replication: database_instance_registered_event.system_replication,
                  system_replication_status:
                    database_instance_registered_event.system_replication_status
                }
              ]
            },
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
        build(:database_registered_event, sap_system_id: sap_system_id, sid: sid),
        build(:database_instance_registered_event, sap_system_id: sap_system_id, sid: sid),
        build(:sap_system_registered_event, sap_system_id: sap_system_id, sid: sid),
        %SapSystemRollUpRequested{
          sap_system_id: sap_system_id,
          snapshot: %SapSystem{}
        }
      ]

      assert_error(
        initial_events,
        RegisterDatabaseInstance.new!(%{
          sap_system_id: sap_system_id,
          sid: Faker.StarWars.planet(),
          tenant: Faker.UUID.v4(),
          host_id: Faker.UUID.v4(),
          instance_number: "00",
          features: Faker.Pokemon.name(),
          http_port: 8080,
          https_port: 8443,
          health: :passing
        }),
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

      assert_state(
        [
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
        ],
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
end
