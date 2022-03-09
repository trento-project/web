defmodule Tronto.Monitoring.SapSystemTest do
  use Tronto.AggregateCase, aggregate: Tronto.Monitoring.Domain.SapSystem, async: true

  import Tronto.Factory

  alias Tronto.Monitoring.Domain.Commands.{
    RegisterApplicationInstance,
    RegisterDatabaseInstance
  }

  alias Tronto.Monitoring.Domain.Events.{
    ApplicationInstanceHealthChanged,
    ApplicationInstanceRegistered,
    DatabaseHealthChanged,
    DatabaseInstanceHealthChanged,
    DatabaseInstanceRegistered,
    DatabaseRegistered,
    SapSystemHealthChanged,
    SapSystemRegistered
  }

  alias Tronto.Monitoring.Domain.SapSystem

  describe "SAP System registration" do
    test "should create an incomplete SAP system aggregate and register a database instance" do
      sap_system_id = Faker.UUID.v4()
      sid = Faker.StarWars.planet()
      tenant = Faker.Beer.style()
      instance_number = "00"
      features = Faker.Pokemon.name()
      host_id = Faker.UUID.v4()

      assert_events_and_state(
        [],
        RegisterDatabaseInstance.new!(
          sap_system_id: sap_system_id,
          sid: sid,
          tenant: tenant,
          instance_number: instance_number,
          features: features,
          host_id: host_id,
          health: :passing
        ),
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
            features: features,
            host_id: host_id,
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
        database_registered_event(
          sap_system_id: sap_system_id,
          sid: sid
        ),
        database_instance_registered_event(
          sap_system_id: sap_system_id,
          sid: sid,
          tenant: tenant,
          instance_number: "10"
        )
      ]

      assert_events_and_state(
        initial_events,
        RegisterDatabaseInstance.new!(
          sap_system_id: sap_system_id,
          sid: sid,
          tenant: tenant,
          instance_number: instance_number,
          features: features,
          host_id: host_id,
          health: :passing
        ),
        %DatabaseInstanceRegistered{
          sap_system_id: sap_system_id,
          sid: sid,
          tenant: tenant,
          instance_number: instance_number,
          features: features,
          host_id: host_id,
          health: :passing
        },
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
      database_registered_event = database_registered_event()

      database_instance_registered_event =
        database_instance_registered_event(sap_system_id: database_registered_event.sap_system_id)

      initial_events = [
        database_registered_event,
        database_instance_registered_event
      ]

      assert_events(
        initial_events,
        RegisterDatabaseInstance.new!(
          sap_system_id: database_registered_event.sap_system_id,
          sid: database_instance_registered_event.sid,
          tenant: database_instance_registered_event.tenant,
          instance_number: database_instance_registered_event.instance_number,
          features: database_instance_registered_event.features,
          host_id: database_instance_registered_event.host_id,
          health: :passing
        ),
        []
      )
    end

    test "should register a SAP System and add an application instance" do
      sap_system_id = Faker.UUID.v4()
      sid = Faker.StarWars.planet()
      db_host = Faker.Internet.ip_v4_address()
      tenant = Faker.Beer.style()
      features = Faker.Pokemon.name()
      host_id = Faker.UUID.v4()

      initial_events = [
        database_registered_event(
          sap_system_id: sap_system_id,
          sid: sid
        ),
        database_instance_registered_event(
          sap_system_id: sap_system_id,
          sid: sid,
          tenant: tenant
        )
      ]

      assert_events_and_state(
        initial_events,
        RegisterApplicationInstance.new!(
          sap_system_id: sap_system_id,
          sid: sid,
          db_host: db_host,
          tenant: tenant,
          instance_number: "00",
          features: features,
          host_id: host_id,
          health: :passing
        ),
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
            features: features,
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
        database_registered_event(sap_system_id: sap_system_id, sid: sid),
        database_instance_registered_event(sap_system_id: sap_system_id, sid: sid),
        sap_system_registered_event(sap_system_id: sap_system_id, sid: sid),
        application_instance_registered_event(sap_system_id: sap_system_id, sid: sid)
      ]

      new_instance_db_host = Faker.Internet.ip_v4_address()
      new_instance_tenant = Faker.Beer.style()
      new_instance_number = "10"
      new_instance_features = Faker.Pokemon.name()
      new_instance_host_id = Faker.UUID.v4()

      assert_events_and_state(
        initial_events,
        RegisterApplicationInstance.new!(
          sap_system_id: sap_system_id,
          sid: sid,
          db_host: new_instance_db_host,
          tenant: new_instance_tenant,
          instance_number: new_instance_number,
          features: new_instance_features,
          host_id: new_instance_host_id,
          health: :passing
        ),
        %ApplicationInstanceRegistered{
          sap_system_id: sap_system_id,
          sid: sid,
          instance_number: new_instance_number,
          features: new_instance_features,
          host_id: new_instance_host_id,
          health: :passing
        },
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
        application_instance_registered_event(sap_system_id: sap_system_id)

      initial_events = [
        database_registered_event(sap_system_id: sap_system_id),
        database_instance_registered_event(sap_system_id: sap_system_id),
        sap_system_registered_event(sap_system_id: sap_system_id),
        application_instance_registered_event
      ]

      assert_events(
        initial_events,
        RegisterApplicationInstance.new!(
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
        database_registered_event(sap_system_id: sap_system_id),
        database_instance_registered_event(sap_system_id: sap_system_id)
      ]

      assert_events_and_state(
        initial_events,
        RegisterDatabaseInstance.new!(
          sap_system_id: sap_system_id,
          sid: sid,
          tenant: tenant,
          instance_number: instance_number,
          features: features,
          host_id: host_id,
          health: :critical
        ),
        [
          %DatabaseInstanceRegistered{
            sap_system_id: sap_system_id,
            sid: sid,
            tenant: tenant,
            instance_number: instance_number,
            features: features,
            host_id: host_id,
            health: :critical
          },
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
        database_instance_registered_event(
          sap_system_id: sap_system_id,
          host_id: host_id,
          instance_number: instance_number
        )

      initial_events = [
        database_registered_event(sap_system_id: sap_system_id),
        database_instance_registered_event
      ]

      assert_events_and_state(
        initial_events,
        RegisterDatabaseInstance.new!(
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
        database_instance_registered_event(
          sap_system_id: sap_system_id,
          health: :warning
        )

      initial_events = [
        database_registered_event(sap_system_id: sap_system_id, health: :warning),
        database_instance_registered_event
      ]

      assert_events_and_state(
        initial_events,
        [
          RegisterDatabaseInstance.new!(
            sap_system_id: sap_system_id,
            sid: database_instance_registered_event.sid,
            tenant: database_instance_registered_event.tenant,
            instance_number: database_instance_registered_event.instance_number,
            features: database_instance_registered_event.features,
            host_id: database_instance_registered_event.host_id,
            health: :warning
          ),
          RegisterDatabaseInstance.new!(
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
          %DatabaseInstanceRegistered{
            sap_system_id: sap_system_id,
            sid: database_instance_registered_event.sid,
            tenant: database_instance_registered_event.tenant,
            instance_number: new_instance_number,
            features: new_instance_features,
            host_id: new_instance_host_id,
            health: :warning
          }
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
        database_registered_event(sap_system_id: sap_system_id),
        database_instance_registered_event(sap_system_id: sap_system_id)
      ]

      assert_events_and_state(
        initial_events,
        RegisterApplicationInstance.new!(
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
          %ApplicationInstanceRegistered{
            sap_system_id: sap_system_id,
            sid: sid,
            instance_number: instance_number,
            features: features,
            host_id: host_id,
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

    test "should change the health of a SAP System when an Application has changed the health status" do
      sap_system_id = Faker.UUID.v4()

      application_instance_registered =
        application_instance_registered_event(sap_system_id: sap_system_id)

      sap_system_registered_event = sap_system_registered_event(sap_system_id: sap_system_id)

      initial_events = [
        database_registered_event(sap_system_id: sap_system_id),
        database_instance_registered_event(sap_system_id: sap_system_id),
        application_instance_registered,
        sap_system_registered_event
      ]

      assert_events_and_state(
        initial_events,
        RegisterApplicationInstance.new!(
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
        application_instance_registered_event(
          sap_system_id: sap_system_id,
          health: :warning
        )

      sap_system_registered_event =
        sap_system_registered_event(sap_system_id: sap_system_id, health: :warning)

      initial_events = [
        database_registered_event(sap_system_id: sap_system_id),
        database_instance_registered_event(
          sap_system_id: sap_system_id,
          health: :warning
        ),
        sap_system_registered_event,
        application_instance_registered_event
      ]

      assert_events_and_state(
        initial_events,
        [
          RegisterApplicationInstance.new!(
            sap_system_id: sap_system_id,
            sid: application_instance_registered_event.sid,
            tenant: sap_system_registered_event.tenant,
            db_host: sap_system_registered_event.db_host,
            instance_number: application_instance_registered_event.instance_number,
            features: application_instance_registered_event.features,
            host_id: application_instance_registered_event.host_id,
            health: :warning
          ),
          RegisterApplicationInstance.new!(
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
          %ApplicationInstanceRegistered{
            sap_system_id: sap_system_id,
            sid: application_instance_registered_event.sid,
            instance_number: new_instance_number,
            features: new_instance_features,
            host_id: new_instance_host_id,
            health: :warning
          }
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
        database_registered_event(sap_system_id: sap_system_id),
        database_instance_registered_event =
          database_instance_registered_event(sap_system_id: sap_system_id),
        sap_system_registered_event(sap_system_id: sap_system_id),
        application_instance_registered_event(sap_system_id: sap_system_id)
      ]

      assert_events_and_state(
        initial_events,
        RegisterDatabaseInstance.new!(
          sap_system_id: sap_system_id,
          sid: database_instance_registered_event.sid,
          tenant: database_instance_registered_event.tenant,
          instance_number: new_instance_number,
          features: new_instance_features,
          host_id: new_instance_host_id,
          health: :warning
        ),
        [
          %DatabaseInstanceRegistered{
            sap_system_id: sap_system_id,
            sid: database_instance_registered_event.sid,
            tenant: database_instance_registered_event.tenant,
            instance_number: new_instance_number,
            features: new_instance_features,
            host_id: new_instance_host_id,
            health: :warning
          },
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
end
