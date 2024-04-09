defmodule Trento.Databases.DatabaseTest do
  use Trento.AggregateCase, aggregate: Trento.Databases.Database, async: true

  import Trento.Factory

  alias Trento.Databases.Commands.{
    DeregisterDatabaseInstance,
    MarkDatabaseInstanceAbsent,
    RegisterDatabaseInstance,
    RollUpDatabase
  }

  alias Trento.Databases.Events.{
    DatabaseDeregistered,
    DatabaseHealthChanged,
    DatabaseInstanceDeregistered,
    DatabaseInstanceHealthChanged,
    DatabaseInstanceMarkedAbsent,
    DatabaseInstanceMarkedPresent,
    DatabaseInstanceRegistered,
    DatabaseInstanceSystemReplicationChanged,
    DatabaseRegistered,
    DatabaseRestored,
    DatabaseRolledUp,
    DatabaseRollUpRequested,
    DatabaseTombstoned
  }

  alias Trento.SapSystems.Events, as: SapSystemEvents

  alias Trento.Databases.Database
  alias Trento.SapSystems.Instance

  describe "Database registration" do
    test "should fail when a database does not exists and the database instance has Secondary role" do
      command =
        build(:register_database_instance_command,
          system_replication: "Secondary"
        )

      assert_error(
        command,
        {:error, :database_not_registered}
      )
    end

    test "should register a database when the system replication is disabled" do
      database_id = Faker.UUID.v4()
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
          database_id: database_id,
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
            database_id: database_id,
            sid: sid,
            health: :passing
          },
          %DatabaseInstanceRegistered{
            database_id: database_id,
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
        %Database{
          database_id: database_id,
          sid: sid,
          health: :passing,
          instances: [
            %Instance{
              sid: sid,
              system_replication: nil,
              system_replication_status: nil,
              instance_number: instance_number,
              features: features,
              host_id: host_id,
              health: :passing,
              absent_at: nil
            }
          ]
        }
      )
    end

    test "should register a database when the system replication is enabled and the database role is primary" do
      database_id = Faker.UUID.v4()
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
          database_id: database_id,
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
            database_id: database_id,
            sid: sid,
            health: :passing
          },
          %DatabaseInstanceRegistered{
            database_id: database_id,
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
        %Database{
          database_id: database_id,
          sid: sid,
          health: :passing,
          instances: [
            %Instance{
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
      )
    end

    test "should add a database instance to an existing Database" do
      database_id = Faker.UUID.v4()
      sid = Faker.StarWars.planet()
      tenant = Faker.Beer.style()
      instance_number = "00"
      features = Faker.Pokemon.name()
      host_id = Faker.UUID.v4()

      initial_events = [
        build(
          :database_registered_event,
          database_id: database_id,
          sid: sid
        ),
        build(
          :database_instance_registered_event,
          database_id: database_id,
          sid: sid,
          tenant: tenant,
          instance_number: "10"
        )
      ]

      assert_events_and_state(
        initial_events,
        build(
          :register_database_instance_command,
          database_id: database_id,
          sid: sid,
          tenant: tenant,
          instance_number: instance_number,
          features: features,
          host_id: host_id,
          health: :passing
        ),
        build(
          :database_instance_registered_event,
          database_id: database_id,
          sid: sid,
          tenant: tenant,
          instance_number: instance_number,
          features: features,
          host_id: host_id,
          health: :passing
        ),
        fn state ->
          assert %Database{
                   instances: [
                     %Instance{
                       sid: ^sid,
                       instance_number: ^instance_number,
                       features: ^features,
                       host_id: ^host_id,
                       health: :passing
                     }
                     | _
                   ]
                 } = state
        end
      )
    end

    test "should not add a database instance if the database instance was already registered" do
      database_registered_event = build(:database_registered_event)

      database_instance_registered_event =
        build(
          :database_instance_registered_event,
          database_id: database_registered_event.database_id
        )

      initial_events = [
        database_registered_event,
        database_instance_registered_event
      ]

      assert_events(
        initial_events,
        build(
          :register_database_instance_command,
          database_id: database_registered_event.database_id,
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
          database_id: database_registered_event.database_id,
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
          database_id: database_registered_event.database_id,
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
          database_id: database_registered_event.database_id,
          host_id: database_instance_registered_event.host_id,
          instance_number: database_instance_registered_event.instance_number,
          system_replication: "Primary",
          system_replication_status: "ACTIVE"
        }
      )
    end
  end

  describe "Database health" do
    test "should change the health of a Database when a new Database instance is registered" do
      database_id = Faker.UUID.v4()
      sid = Faker.StarWars.planet()
      tenant = Faker.Beer.style()
      instance_number = "00"
      features = Faker.Pokemon.name()
      host_id = Faker.UUID.v4()

      initial_events = [
        build(:database_registered_event, database_id: database_id),
        build(:database_instance_registered_event, database_id: database_id)
      ]

      assert_events_and_state(
        initial_events,
        build(
          :register_database_instance_command,
          database_id: database_id,
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
            database_id: database_id,
            sid: sid,
            tenant: tenant,
            instance_number: instance_number,
            features: features,
            host_id: host_id,
            health: :critical
          ),
          %DatabaseHealthChanged{
            database_id: database_id,
            health: :critical
          }
        ],
        fn state ->
          %Database{
            health: :critical,
            instances: [
              %Instance{
                health: :critical
              },
              %Instance{
                health: :passing
              }
            ]
          } = state
        end
      )
    end

    test "should change the health of a Database when a Database instance has changed the health status" do
      database_id = Faker.UUID.v4()
      host_id = Faker.UUID.v4()
      instance_number = "00"

      database_instance_registered_event =
        build(
          :database_instance_registered_event,
          database_id: database_id,
          host_id: host_id,
          instance_number: instance_number
        )

      initial_events = [
        build(:database_registered_event, database_id: database_id),
        database_instance_registered_event
      ]

      assert_events_and_state(
        initial_events,
        build(
          :register_database_instance_command,
          database_id: database_id,
          sid: database_instance_registered_event.sid,
          tenant: database_instance_registered_event.tenant,
          instance_number: instance_number,
          features: database_instance_registered_event.features,
          host_id: host_id,
          health: :critical
        ),
        [
          %DatabaseInstanceHealthChanged{
            database_id: database_id,
            instance_number: instance_number,
            host_id: host_id,
            health: :critical
          },
          %DatabaseHealthChanged{
            database_id: database_id,
            health: :critical
          }
        ],
        fn state ->
          assert %Database{
                   health: :critical,
                   instances: [
                     %Instance{
                       instance_number: ^instance_number,
                       host_id: ^host_id,
                       health: :critical
                     }
                   ]
                 } = state
        end
      )
    end

    test "should not change the health of a Database if no instance has changed the health status" do
      database_id = Faker.UUID.v4()

      new_instance_number = "20"
      new_instance_features = Faker.Pokemon.name()
      new_instance_host_id = Faker.UUID.v4()

      database_instance_registered_event =
        build(
          :database_instance_registered_event,
          database_id: database_id,
          health: :warning
        )

      initial_events = [
        build(:database_registered_event, database_id: database_id, health: :warning),
        database_instance_registered_event
      ]

      assert_events_and_state(
        initial_events,
        [
          build(
            :register_database_instance_command,
            database_id: database_id,
            sid: database_instance_registered_event.sid,
            tenant: database_instance_registered_event.tenant,
            instance_number: database_instance_registered_event.instance_number,
            features: database_instance_registered_event.features,
            host_id: database_instance_registered_event.host_id,
            health: :warning
          ),
          build(
            :register_database_instance_command,
            database_id: database_id,
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
            database_id: database_id,
            sid: database_instance_registered_event.sid,
            tenant: database_instance_registered_event.tenant,
            instance_number: new_instance_number,
            features: new_instance_features,
            host_id: new_instance_host_id,
            health: :warning
          )
        ],
        fn state ->
          assert %Database{
                   health: :warning,
                   instances: [
                     %Instance{
                       health: :warning
                     },
                     %Instance{
                       health: :warning
                     }
                   ]
                 } = state
        end
      )
    end
  end

  describe "rollup" do
    test "should not accept a rollup command if a database was not registered yet" do
      assert_error(
        RollUpDatabase.new!(%{database_id: Faker.UUID.v4()}),
        {:error, :database_not_registered}
      )
    end

    test "should change the database state to rolling up" do
      database_id = UUID.uuid4()
      sid = fake_sid()

      database_instance_registered_event =
        build(:database_instance_registered_event, database_id: database_id, sid: sid)

      initial_events = [
        database_instance_registered_event,
        build(:database_registered_event, database_id: database_id, sid: sid)
      ]

      assert_events_and_state(
        initial_events,
        RollUpDatabase.new!(%{database_id: database_id}),
        %DatabaseRollUpRequested{
          database_id: database_id,
          snapshot: %Database{
            database_id: database_id,
            sid: sid,
            health: :passing,
            instances: [],
            rolling_up: false
          }
        },
        fn %Database{rolling_up: rolling_up} ->
          assert rolling_up
        end
      )
    end

    test "should not accept commands if a database is in rolling up state" do
      database_id = UUID.uuid4()
      sid = fake_sid()

      initial_events = [
        build(:database_instance_registered_event, database_id: database_id, sid: sid),
        build(:database_registered_event, database_id: database_id, sid: sid),
        %DatabaseRollUpRequested{
          database_id: database_id,
          snapshot: %Database{}
        }
      ]

      assert_error(
        initial_events,
        build(
          :register_database_instance_command,
          database_id: database_id
        ),
        {:error, :database_rolling_up}
      )

      assert_error(
        initial_events,
        RollUpDatabase.new!(%{
          database_id: database_id
        }),
        {:error, :database_rolling_up}
      )
    end

    test "should apply the rollup event and rehydrate the aggregate" do
      database_id = UUID.uuid4()

      database_registered_event =
        build(:database_registered_event, database_id: database_id)

      initial_events = [
        build(:database_instance_registered_event, database_id: database_id),
        database_registered_event,
        %DatabaseRolledUp{
          database_id: database_id,
          snapshot: %Database{
            database_id: database_registered_event.database_id,
            sid: database_registered_event.sid,
            health: database_registered_event.health,
            rolling_up: false
          }
        }
      ]

      assert_state(
        initial_events,
        [],
        fn database ->
          refute database.rolling_up
          assert database.database_id == database_registered_event.database_id
          assert database.sid == database_registered_event.sid
          assert database.health == database_registered_event.health
        end
      )
    end
  end

  describe "tombstoning" do
    test "should tombstone a deregistered database when no database instances are left" do
      database_id = UUID.uuid4()

      primary_database_host_id = UUID.uuid4()
      secondary_database_host_id = UUID.uuid4()

      deregistered_at = DateTime.utc_now()

      db_instance_number_1 = "00"
      db_instance_number_2 = "01"

      db_sid = fake_sid()

      initial_events = [
        build(
          :database_registered_event,
          database_id: database_id,
          sid: db_sid
        ),
        build(
          :database_instance_registered_event,
          database_id: database_id,
          host_id: primary_database_host_id,
          sid: db_sid,
          instance_number: db_instance_number_1,
          system_replication: "Primary"
        ),
        build(
          :database_instance_registered_event,
          database_id: database_id,
          host_id: secondary_database_host_id,
          instance_number: db_instance_number_2,
          system_replication: "Secondary",
          sid: db_sid
        )
      ]

      assert_events_and_state(
        initial_events,
        [
          %DeregisterDatabaseInstance{
            database_id: database_id,
            host_id: primary_database_host_id,
            instance_number: db_instance_number_1,
            deregistered_at: deregistered_at
          },
          %DeregisterDatabaseInstance{
            database_id: database_id,
            host_id: secondary_database_host_id,
            instance_number: db_instance_number_2,
            deregistered_at: deregistered_at
          }
        ],
        [
          %DatabaseInstanceDeregistered{
            database_id: database_id,
            host_id: primary_database_host_id,
            instance_number: db_instance_number_1,
            deregistered_at: deregistered_at
          },
          %DatabaseDeregistered{
            database_id: database_id,
            deregistered_at: deregistered_at
          },
          %DatabaseInstanceDeregistered{
            database_id: database_id,
            host_id: secondary_database_host_id,
            instance_number: db_instance_number_2,
            deregistered_at: deregistered_at
          },
          %DatabaseTombstoned{
            database_id: database_id
          }
        ],
        fn state ->
          assert %Database{
                   instances: [],
                   deregistered_at: ^deregistered_at,
                   sid: ^db_sid
                 } = state
        end
      )
    end
  end

  describe "deregistration" do
    test "should not restore a deregistered database when the registering database instance has Secondary role" do
      database_id = UUID.uuid4()

      primary_database_host_id = UUID.uuid4()
      secondary_database_host_id = UUID.uuid4()

      deregistered_at = DateTime.utc_now()

      db_instance_number_1 = "00"
      db_instance_number_2 = "01"

      db_sid = fake_sid()

      initial_events = [
        build(
          :database_registered_event,
          database_id: database_id,
          sid: db_sid
        ),
        build(
          :database_instance_registered_event,
          database_id: database_id,
          host_id: primary_database_host_id,
          sid: db_sid,
          instance_number: db_instance_number_1,
          system_replication: "Primary"
        ),
        build(
          :database_instance_registered_event,
          database_id: database_id,
          host_id: secondary_database_host_id,
          instance_number: db_instance_number_2,
          system_replication: "Secondary",
          sid: db_sid
        ),
        build(:database_instance_deregistered_event,
          database_id: database_id,
          host_id: primary_database_host_id,
          instance_number: db_instance_number_1,
          deregistered_at: deregistered_at
        ),
        build(:database_deregistered_event,
          database_id: database_id,
          deregistered_at: deregistered_at
        )
      ]

      command =
        build(:register_database_instance_command,
          system_replication: "Secondary",
          sid: db_sid,
          database_id: database_id
        )

      assert_error(
        initial_events,
        command,
        {:error, :database_not_registered}
      )
    end

    test "should restore a deregistered database when the registering database instance has system replication disabled, with database instance leftovers" do
      database_id = UUID.uuid4()

      primary_database_host_id = UUID.uuid4()
      secondary_database_host_id = UUID.uuid4()

      deregistered_at = DateTime.utc_now()

      db_instance_number_1 = "00"
      db_instance_number_2 = "01"

      db_sid = fake_sid()

      initial_events = [
        build(
          :database_registered_event,
          database_id: database_id,
          sid: db_sid
        ),
        build(
          :database_instance_registered_event,
          database_id: database_id,
          host_id: primary_database_host_id,
          sid: db_sid,
          instance_number: db_instance_number_1,
          system_replication: "Primary"
        ),
        build(
          :database_instance_registered_event,
          database_id: database_id,
          host_id: secondary_database_host_id,
          instance_number: db_instance_number_2,
          system_replication: "Secondary",
          sid: db_sid
        ),
        build(:database_instance_deregistered_event,
          database_id: database_id,
          host_id: primary_database_host_id,
          instance_number: db_instance_number_1,
          deregistered_at: deregistered_at
        ),
        build(:database_deregistered_event,
          database_id: database_id,
          deregistered_at: deregistered_at
        )
      ]

      %{features: features, instance_number: instance_number, health: health} =
        command =
        build(:register_database_instance_command,
          system_replication: nil,
          sid: db_sid,
          database_id: database_id
        )

      assert_events_and_state(
        initial_events,
        command,
        [
          %DatabaseInstanceRegistered{
            database_id: database_id,
            sid: db_sid,
            tenant: command.tenant,
            instance_number: command.instance_number,
            instance_hostname: command.instance_hostname,
            features: command.features,
            http_port: command.http_port,
            https_port: command.https_port,
            start_priority: command.start_priority,
            host_id: command.host_id,
            system_replication: command.system_replication,
            system_replication_status: command.system_replication_status,
            health: command.health
          },
          %DatabaseRestored{
            database_id: database_id,
            health: command.health
          }
        ],
        fn state ->
          assert %Database{
                   deregistered_at: nil,
                   sid: ^db_sid,
                   instances: [
                     %Instance{
                       sid: ^db_sid,
                       instance_number: ^instance_number,
                       features: ^features,
                       health: ^health
                     },
                     %Instance{}
                   ]
                 } = state
        end
      )
    end

    test "should restore a deregistered database when the registering database instance has system replication disabled, without database instance leftovers" do
      database_id = UUID.uuid4()

      primary_database_host_id = UUID.uuid4()
      secondary_database_host_id = UUID.uuid4()

      deregistered_at = DateTime.utc_now()

      db_instance_number_1 = "00"
      db_instance_number_2 = "01"

      db_sid = fake_sid()

      initial_events = [
        build(
          :database_registered_event,
          database_id: database_id,
          sid: db_sid
        ),
        build(
          :database_instance_registered_event,
          database_id: database_id,
          host_id: primary_database_host_id,
          sid: db_sid,
          instance_number: db_instance_number_1,
          system_replication: "Primary"
        ),
        build(
          :database_instance_registered_event,
          database_id: database_id,
          host_id: secondary_database_host_id,
          instance_number: db_instance_number_2,
          system_replication: "Secondary",
          sid: db_sid
        ),
        build(:database_instance_deregistered_event,
          database_id: database_id,
          host_id: primary_database_host_id,
          instance_number: db_instance_number_1,
          deregistered_at: deregistered_at
        ),
        build(:database_instance_deregistered_event,
          database_id: database_id,
          host_id: secondary_database_host_id,
          instance_number: db_instance_number_2,
          deregistered_at: deregistered_at
        ),
        build(:database_deregistered_event,
          database_id: database_id,
          deregistered_at: deregistered_at
        )
      ]

      %{features: features, instance_number: instance_number, health: health} =
        command =
        build(:register_database_instance_command,
          system_replication: nil,
          sid: db_sid,
          database_id: database_id
        )

      assert_events_and_state(
        initial_events,
        command,
        [
          %DatabaseInstanceRegistered{
            database_id: database_id,
            sid: db_sid,
            tenant: command.tenant,
            instance_number: command.instance_number,
            instance_hostname: command.instance_hostname,
            features: command.features,
            http_port: command.http_port,
            https_port: command.https_port,
            start_priority: command.start_priority,
            host_id: command.host_id,
            system_replication: command.system_replication,
            system_replication_status: command.system_replication_status,
            health: command.health
          },
          %DatabaseRestored{
            database_id: database_id,
            health: command.health
          }
        ],
        fn state ->
          assert Kernel.length(state.instances) == 1

          assert %Database{
                   deregistered_at: nil,
                   sid: ^db_sid,
                   instances: [
                     %Instance{
                       sid: ^db_sid,
                       instance_number: ^instance_number,
                       features: ^features,
                       health: ^health,
                       system_replication: nil
                     }
                   ]
                 } = state
        end
      )
    end

    test "should restore a deregistered database when the registering database instance is a primary, without database instance leftovers" do
      database_id = UUID.uuid4()

      primary_database_host_id = UUID.uuid4()
      secondary_database_host_id = UUID.uuid4()

      deregistered_at = DateTime.utc_now()

      db_instance_number_1 = "00"
      db_instance_number_2 = "01"

      db_sid = fake_sid()

      initial_events = [
        build(
          :database_registered_event,
          database_id: database_id,
          sid: db_sid
        ),
        build(
          :database_instance_registered_event,
          database_id: database_id,
          host_id: primary_database_host_id,
          sid: db_sid,
          instance_number: db_instance_number_1,
          system_replication: "Primary"
        ),
        build(
          :database_instance_registered_event,
          database_id: database_id,
          host_id: secondary_database_host_id,
          instance_number: db_instance_number_2,
          system_replication: "Secondary",
          sid: db_sid
        ),
        build(:database_instance_deregistered_event,
          database_id: database_id,
          host_id: primary_database_host_id,
          instance_number: db_instance_number_1,
          deregistered_at: deregistered_at
        ),
        build(:database_instance_deregistered_event,
          database_id: database_id,
          host_id: secondary_database_host_id,
          instance_number: db_instance_number_2,
          deregistered_at: deregistered_at
        ),
        build(:database_deregistered_event,
          database_id: database_id,
          deregistered_at: deregistered_at
        )
      ]

      %{features: features, instance_number: instance_number, health: health} =
        command =
        build(:register_database_instance_command,
          system_replication: "Primary",
          sid: db_sid,
          database_id: database_id
        )

      assert_events_and_state(
        initial_events,
        command,
        [
          %DatabaseInstanceRegistered{
            database_id: database_id,
            sid: db_sid,
            tenant: command.tenant,
            instance_number: command.instance_number,
            instance_hostname: command.instance_hostname,
            features: command.features,
            http_port: command.http_port,
            https_port: command.https_port,
            start_priority: command.start_priority,
            host_id: command.host_id,
            system_replication: command.system_replication,
            system_replication_status: command.system_replication_status,
            health: command.health
          },
          %DatabaseRestored{
            database_id: database_id,
            health: command.health
          }
        ],
        fn state ->
          assert Kernel.length(state.instances) == 1

          assert %Database{
                   deregistered_at: nil,
                   sid: ^db_sid,
                   instances: [
                     %Instance{
                       sid: ^db_sid,
                       instance_number: ^instance_number,
                       features: ^features,
                       health: ^health,
                       system_replication: "Primary"
                     }
                   ]
                 } = state
        end
      )
    end

    test "should restore a deregistered database when the registering database instance is a primary, with database instance leftovers" do
      database_id = UUID.uuid4()

      primary_database_host_id = UUID.uuid4()
      secondary_database_host_id = UUID.uuid4()

      deregistered_at = DateTime.utc_now()

      db_instance_number_1 = "00"
      db_instance_number_2 = "01"

      db_sid = fake_sid()

      initial_events = [
        build(
          :database_registered_event,
          database_id: database_id,
          sid: db_sid
        ),
        build(
          :database_instance_registered_event,
          database_id: database_id,
          host_id: primary_database_host_id,
          sid: db_sid,
          instance_number: db_instance_number_1,
          system_replication: "Primary"
        ),
        build(
          :database_instance_registered_event,
          database_id: database_id,
          host_id: secondary_database_host_id,
          instance_number: db_instance_number_2,
          system_replication: "Secondary",
          sid: db_sid
        ),
        build(:database_instance_deregistered_event,
          database_id: database_id,
          host_id: primary_database_host_id,
          instance_number: db_instance_number_1,
          deregistered_at: deregistered_at
        ),
        build(:database_deregistered_event,
          database_id: database_id,
          deregistered_at: deregistered_at
        )
      ]

      %{features: features, instance_number: instance_number, health: health} =
        command =
        build(:register_database_instance_command,
          system_replication: "Primary",
          sid: db_sid,
          database_id: database_id
        )

      assert_events_and_state(
        initial_events,
        command,
        [
          %DatabaseInstanceRegistered{
            database_id: database_id,
            sid: db_sid,
            tenant: command.tenant,
            instance_number: command.instance_number,
            instance_hostname: command.instance_hostname,
            features: command.features,
            http_port: command.http_port,
            https_port: command.https_port,
            start_priority: command.start_priority,
            host_id: command.host_id,
            system_replication: command.system_replication,
            system_replication_status: command.system_replication_status,
            health: command.health
          },
          %DatabaseRestored{
            database_id: database_id,
            health: command.health
          }
        ],
        fn state ->
          assert Kernel.length(state.instances) == 2

          assert %Database{
                   deregistered_at: nil,
                   sid: ^db_sid,
                   instances: [
                     %Instance{
                       sid: ^db_sid,
                       instance_number: ^instance_number,
                       features: ^features,
                       health: ^health,
                       system_replication: "Primary"
                     },
                     %Instance{}
                   ]
                 } = state
        end
      )
    end

    test "should reject all the commands except for the registration/instance deregistration ones, when the Database is deregistered" do
      database_id = UUID.uuid4()

      primary_database_host_id = UUID.uuid4()
      secondary_database_host_id = UUID.uuid4()

      deregistered_at = DateTime.utc_now()

      db_instance_number_1 = "00"
      db_instance_number_2 = "01"

      db_sid = fake_sid()

      initial_events = [
        build(
          :database_registered_event,
          database_id: database_id,
          sid: db_sid
        ),
        build(
          :database_instance_registered_event,
          database_id: database_id,
          host_id: primary_database_host_id,
          sid: db_sid,
          instance_number: db_instance_number_1,
          system_replication: "Primary"
        ),
        build(
          :database_instance_registered_event,
          database_id: database_id,
          host_id: secondary_database_host_id,
          instance_number: db_instance_number_2,
          system_replication: "Secondary",
          sid: db_sid
        ),
        build(:database_instance_deregistered_event,
          database_id: database_id,
          host_id: primary_database_host_id,
          instance_number: db_instance_number_1,
          deregistered_at: deregistered_at
        ),
        build(:database_deregistered_event,
          database_id: database_id,
          deregistered_at: deregistered_at
        )
      ]

      commands_to_accept = [
        build(:register_database_instance_command)
      ]

      for command <- commands_to_accept do
        assert match?({:ok, _, _}, aggregate_run(initial_events, command)),
               "Command #{inspect(command)} should be accepted by a deregistered SAP system"
      end
    end

    test "should deregister a Database when the Primary database instance is removed" do
      database_id = UUID.uuid4()

      primary_database_host_id = UUID.uuid4()
      secondary_database_host_id = UUID.uuid4()

      deregistered_at = DateTime.utc_now()

      db_instance_number_1 = "00"
      db_instance_number_2 = "01"

      db_sid = fake_sid()

      assert_events_and_state(
        [
          build(
            :database_registered_event,
            database_id: database_id,
            sid: db_sid
          ),
          build(
            :database_instance_registered_event,
            database_id: database_id,
            host_id: primary_database_host_id,
            sid: db_sid,
            instance_number: db_instance_number_1,
            system_replication: "Primary"
          ),
          build(
            :database_instance_registered_event,
            database_id: database_id,
            host_id: secondary_database_host_id,
            instance_number: db_instance_number_2,
            system_replication: "Secondary",
            sid: db_sid
          )
        ],
        %DeregisterDatabaseInstance{
          database_id: database_id,
          host_id: primary_database_host_id,
          instance_number: db_instance_number_1,
          deregistered_at: deregistered_at
        },
        [
          %DatabaseInstanceDeregistered{
            database_id: database_id,
            host_id: primary_database_host_id,
            instance_number: db_instance_number_1,
            deregistered_at: deregistered_at
          },
          %DatabaseDeregistered{
            database_id: database_id,
            deregistered_at: deregistered_at
          }
        ],
        fn state ->
          assert %Database{
                   sid: ^db_sid,
                   instances: [
                     %Instance{
                       instance_number: ^db_instance_number_2,
                       sid: ^db_sid,
                       host_id: ^secondary_database_host_id
                     }
                   ],
                   health: :passing,
                   deregistered_at: ^deregistered_at
                 } = state
        end
      )
    end

    test "should deregister a secondary DB instance" do
      database_id = UUID.uuid4()
      deregistered_at = DateTime.utc_now()

      instance_number_1 = "00"
      instance_number_2 = "01"

      db_sid = fake_sid()

      primary_db_host_id = UUID.uuid4()
      secondary_db_host_id = UUID.uuid4()

      assert_events_and_state(
        [
          build(
            :database_registered_event,
            database_id: database_id,
            sid: db_sid
          ),
          build(
            :database_instance_registered_event,
            database_id: database_id,
            system_replication: "Primary",
            sid: db_sid,
            instance_number: instance_number_1,
            host_id: primary_db_host_id
          ),
          build(
            :database_instance_registered_event,
            database_id: database_id,
            system_replication: "Secondary",
            sid: db_sid,
            host_id: secondary_db_host_id,
            instance_number: instance_number_2
          )
        ],
        %DeregisterDatabaseInstance{
          database_id: database_id,
          host_id: secondary_db_host_id,
          instance_number: instance_number_2,
          deregistered_at: deregistered_at
        },
        %DatabaseInstanceDeregistered{
          database_id: database_id,
          host_id: secondary_db_host_id,
          instance_number: instance_number_2,
          deregistered_at: deregistered_at
        },
        fn state ->
          assert %Database{
                   sid: ^db_sid,
                   deregistered_at: nil,
                   instances: [%Instance{instance_number: ^instance_number_1}]
                 } = state
        end
      )
    end

    test "should deregister the only database instance and deregister the entire database, system replication disabled" do
      database_id = UUID.uuid4()
      database_host_id = UUID.uuid4()
      deregistered_at = DateTime.utc_now()
      db_instance_number_1 = "00"
      db_sid = fake_sid()

      assert_events_and_state(
        [
          build(
            :database_registered_event,
            database_id: database_id,
            sid: db_sid
          ),
          build(
            :database_instance_registered_event,
            database_id: database_id,
            host_id: database_host_id,
            instance_number: db_instance_number_1,
            system_replication: nil,
            sid: db_sid
          )
        ],
        %DeregisterDatabaseInstance{
          database_id: database_id,
          host_id: database_host_id,
          instance_number: db_instance_number_1,
          deregistered_at: deregistered_at
        },
        [
          %DatabaseInstanceDeregistered{
            database_id: database_id,
            host_id: database_host_id,
            instance_number: db_instance_number_1,
            deregistered_at: deregistered_at
          },
          %DatabaseDeregistered{
            database_id: database_id,
            deregistered_at: deregistered_at
          },
          %DatabaseTombstoned{
            database_id: database_id
          }
        ],
        fn state ->
          assert %Database{
                   sid: ^db_sid,
                   instances: [],
                   health: :passing,
                   deregistered_at: ^deregistered_at
                 } = state
        end
      )
    end

    test "should deregister a single DB instance of two if no SR enabled" do
      database_id = UUID.uuid4()
      database_host_id = UUID.uuid4()
      second_database_host_id = UUID.uuid4()
      deregistered_at = DateTime.utc_now()
      db_instance_number_1 = "00"
      db_instance_number_2 = "01"

      db_sid = fake_sid()

      assert_events_and_state(
        [
          build(
            :database_registered_event,
            database_id: database_id,
            sid: db_sid
          ),
          build(
            :database_instance_registered_event,
            database_id: database_id,
            host_id: database_host_id,
            instance_number: db_instance_number_1,
            system_replication: nil,
            sid: db_sid
          ),
          build(
            :database_instance_registered_event,
            database_id: database_id,
            host_id: second_database_host_id,
            instance_number: db_instance_number_2,
            system_replication: nil,
            sid: db_sid
          )
        ],
        %DeregisterDatabaseInstance{
          database_id: database_id,
          host_id: database_host_id,
          instance_number: db_instance_number_1,
          deregistered_at: deregistered_at
        },
        %DatabaseInstanceDeregistered{
          database_id: database_id,
          host_id: database_host_id,
          instance_number: db_instance_number_1,
          deregistered_at: deregistered_at
        },
        fn state ->
          assert %Database{
                   sid: ^db_sid,
                   deregistered_at: nil,
                   instances: [%Instance{instance_number: ^db_instance_number_2}]
                 } = state
        end
      )
    end

    test "should deregister the primary instance, the entire database and then the secondary instance" do
      database_id = UUID.uuid4()
      primary_database_host_id = UUID.uuid4()
      secondary_database_host_id = UUID.uuid4()
      deregistered_at = DateTime.utc_now()
      db_instance_number_1 = "00"
      db_instance_number_2 = "01"

      db_sid = fake_sid()

      initial_events = [
        build(
          :database_registered_event,
          database_id: database_id,
          sid: db_sid
        ),
        build(
          :database_instance_registered_event,
          database_id: database_id,
          host_id: primary_database_host_id,
          sid: db_sid,
          instance_number: db_instance_number_1,
          system_replication: "Primary"
        ),
        build(
          :database_instance_registered_event,
          database_id: database_id,
          host_id: secondary_database_host_id,
          instance_number: db_instance_number_2,
          system_replication: "Secondary"
        )
      ]

      assert_events(
        initial_events,
        [
          %DeregisterDatabaseInstance{
            database_id: database_id,
            host_id: primary_database_host_id,
            instance_number: db_instance_number_1,
            deregistered_at: deregistered_at
          },
          %DeregisterDatabaseInstance{
            database_id: database_id,
            host_id: secondary_database_host_id,
            instance_number: db_instance_number_2,
            deregistered_at: deregistered_at
          }
        ],
        [
          %DatabaseInstanceDeregistered{
            database_id: database_id,
            host_id: primary_database_host_id,
            instance_number: db_instance_number_1,
            deregistered_at: deregistered_at
          },
          %DatabaseDeregistered{
            database_id: database_id,
            deregistered_at: deregistered_at
          },
          %DatabaseInstanceDeregistered{
            database_id: database_id,
            host_id: secondary_database_host_id,
            instance_number: db_instance_number_2,
            deregistered_at: deregistered_at
          },
          %DatabaseTombstoned{
            database_id: database_id
          }
        ]
      )
    end

    test "should correctly deregister the database in a scale out scenario, with two primary and two secondary" do
      database_id = UUID.uuid4()
      first_primary_database_host_id = UUID.uuid4()
      other_primary_database_host_id = UUID.uuid4()

      secondary_database_host_id = UUID.uuid4()
      other_secondary_database_host_id = UUID.uuid4()

      deregistered_at = DateTime.utc_now()

      db_instance_number_1 = "00"
      db_instance_number_2 = "01"
      db_instance_number_3 = "02"
      db_instance_number_4 = "03"

      db_sid = fake_sid()

      initial_events = [
        build(
          :database_registered_event,
          database_id: database_id,
          sid: db_sid
        ),
        build(
          :database_instance_registered_event,
          database_id: database_id,
          host_id: first_primary_database_host_id,
          sid: db_sid,
          instance_number: db_instance_number_1,
          system_replication: "Primary"
        ),
        build(
          :database_instance_registered_event,
          database_id: database_id,
          host_id: other_primary_database_host_id,
          sid: db_sid,
          instance_number: db_instance_number_2,
          system_replication: "Primary"
        ),
        build(
          :database_instance_registered_event,
          database_id: database_id,
          host_id: secondary_database_host_id,
          instance_number: db_instance_number_3,
          system_replication: "Secondary"
        ),
        build(
          :database_instance_registered_event,
          database_id: database_id,
          host_id: other_secondary_database_host_id,
          instance_number: db_instance_number_4,
          system_replication: "Secondary"
        )
      ]

      assert_events(
        initial_events,
        [
          %DeregisterDatabaseInstance{
            database_id: database_id,
            host_id: first_primary_database_host_id,
            instance_number: db_instance_number_1,
            deregistered_at: deregistered_at
          },
          %DeregisterDatabaseInstance{
            database_id: database_id,
            host_id: other_primary_database_host_id,
            instance_number: db_instance_number_2,
            deregistered_at: deregistered_at
          },
          %DeregisterDatabaseInstance{
            database_id: database_id,
            host_id: secondary_database_host_id,
            instance_number: db_instance_number_3,
            deregistered_at: deregistered_at
          },
          %DeregisterDatabaseInstance{
            database_id: database_id,
            host_id: other_secondary_database_host_id,
            instance_number: db_instance_number_4,
            deregistered_at: deregistered_at
          }
        ],
        [
          %DatabaseInstanceDeregistered{
            database_id: database_id,
            host_id: first_primary_database_host_id,
            instance_number: db_instance_number_1,
            deregistered_at: deregistered_at
          },
          %DatabaseInstanceDeregistered{
            database_id: database_id,
            host_id: other_primary_database_host_id,
            instance_number: db_instance_number_2,
            deregistered_at: deregistered_at
          },
          %DatabaseDeregistered{
            database_id: database_id,
            deregistered_at: deregistered_at
          },
          %DatabaseInstanceDeregistered{
            database_id: database_id,
            host_id: secondary_database_host_id,
            instance_number: db_instance_number_3,
            deregistered_at: deregistered_at
          },
          %DatabaseInstanceDeregistered{
            database_id: database_id,
            host_id: other_secondary_database_host_id,
            instance_number: db_instance_number_4,
            deregistered_at: deregistered_at
          },
          %DatabaseTombstoned{
            database_id: database_id
          }
        ]
      )
    end

    test "should deregister the primary instance of database" do
      database_id = UUID.uuid4()
      deregistered_at = DateTime.utc_now()

      primary_database_host_id = UUID.uuid4()
      secondary_database_host_id = UUID.uuid4()

      database_instance_number_1 = "00"
      database_instance_number_2 = "00"

      db_sid = fake_sid()

      initial_events = [
        build(
          :database_registered_event,
          database_id: database_id,
          sid: db_sid
        ),
        build(
          :database_instance_registered_event,
          database_id: database_id,
          host_id: primary_database_host_id,
          sid: db_sid,
          instance_number: database_instance_number_1,
          system_replication: "Primary"
        ),
        build(
          :database_instance_registered_event,
          database_id: database_id,
          host_id: secondary_database_host_id,
          instance_number: database_instance_number_2,
          system_replication: "Secondary"
        )
      ]

      assert_events(
        initial_events,
        [
          %DeregisterDatabaseInstance{
            database_id: database_id,
            host_id: primary_database_host_id,
            instance_number: database_instance_number_1,
            deregistered_at: deregistered_at
          }
        ],
        [
          %DatabaseInstanceDeregistered{
            database_id: database_id,
            host_id: primary_database_host_id,
            instance_number: database_instance_number_1,
            deregistered_at: deregistered_at
          },
          %DatabaseDeregistered{
            database_id: database_id,
            deregistered_at: deregistered_at
          }
        ]
      )
    end

    test "should not deregister a not registered database instance" do
      database_id = UUID.uuid4()
      db_sid = fake_sid()

      assert_error(
        [
          build(
            :database_registered_event,
            database_id: database_id,
            sid: db_sid
          ),
          build(
            :database_instance_registered_event,
            database_id: database_id,
            sid: db_sid,
            host_id: UUID.uuid4(),
            instance_number: "00",
            system_replication: "Primary"
          )
        ],
        [
          %DeregisterDatabaseInstance{
            database_id: database_id,
            host_id: UUID.uuid4(),
            instance_number: "01",
            deregistered_at: DateTime.utc_now()
          }
        ],
        {:error, :database_instance_not_registered}
      )
    end

    test "should not deregister an already deregistered database instance" do
      database_id = UUID.uuid4()
      db_sid = fake_sid()
      deregistered_host_id = UUID.uuid4()
      deregistered_instance_number = "01"

      assert_error(
        [
          build(
            :database_registered_event,
            database_id: database_id,
            sid: db_sid
          ),
          build(
            :database_instance_registered_event,
            database_id: database_id,
            sid: db_sid,
            host_id: deregistered_host_id,
            instance_number: deregistered_instance_number,
            system_replication: "Primary"
          ),
          build(
            :database_instance_deregistered_event,
            database_id: database_id,
            host_id: deregistered_host_id,
            instance_number: deregistered_instance_number,
            deregistered_at: DateTime.utc_now()
          )
        ],
        [
          %DeregisterDatabaseInstance{
            database_id: database_id,
            host_id: deregistered_host_id,
            instance_number: deregistered_instance_number,
            deregistered_at: DateTime.utc_now()
          }
        ],
        {:error, :database_instance_not_registered}
      )
    end
  end

  describe "instance marked absent/present" do
    test "should mark as absent a previously registered database instance" do
      database_id = Faker.UUID.v4()
      sid = fake_sid()
      host_id = Faker.UUID.v4()
      absent_db_instance_number = "01"
      present_db_instance_number = "02"
      absent_db_absent_at = DateTime.utc_now()

      initial_events = [
        build(
          :database_registered_event,
          database_id: database_id,
          sid: sid
        ),
        build(
          :database_instance_registered_event,
          database_id: database_id,
          sid: sid,
          host_id: host_id,
          instance_number: absent_db_instance_number,
          system_replication: nil,
          system_replication_status: nil
        ),
        build(
          :database_instance_marked_absent_event,
          database_id: database_id,
          host_id: host_id,
          instance_number: absent_db_instance_number,
          absent_at: absent_db_absent_at
        ),
        build(
          :database_instance_registered_event,
          database_id: database_id,
          sid: sid,
          host_id: host_id,
          instance_number: present_db_instance_number,
          system_replication: nil,
          system_replication_status: nil
        )
      ]

      absent_at = DateTime.utc_now()

      assert_events_and_state(
        initial_events,
        [
          %MarkDatabaseInstanceAbsent{
            instance_number: absent_db_instance_number,
            host_id: host_id,
            database_id: database_id,
            absent_at: absent_at
          },
          %MarkDatabaseInstanceAbsent{
            instance_number: present_db_instance_number,
            host_id: host_id,
            database_id: database_id,
            absent_at: absent_at
          }
        ],
        [
          %DatabaseInstanceMarkedAbsent{
            instance_number: present_db_instance_number,
            host_id: host_id,
            database_id: database_id,
            absent_at: absent_at
          }
        ],
        fn state ->
          assert %Database{
                   sid: ^sid,
                   instances: [
                     %Instance{
                       instance_number: ^present_db_instance_number,
                       absent_at: ^absent_at
                     },
                     %Instance{
                       instance_number: ^absent_db_instance_number,
                       absent_at: ^absent_db_absent_at
                     }
                   ]
                 } = state
        end
      )
    end

    test "should mark as present an already registered, absent database instance" do
      database_id = Faker.UUID.v4()
      sid = fake_sid()
      host_id = Faker.UUID.v4()
      absent_db_instance_number = "01"
      present_db_instance_number = "02"

      initial_events = [
        build(
          :database_registered_event,
          database_id: database_id,
          sid: sid
        ),
        build(
          :database_instance_registered_event,
          database_id: database_id,
          sid: sid,
          host_id: host_id,
          instance_number: absent_db_instance_number,
          system_replication: nil,
          system_replication_status: nil
        ),
        build(
          :database_instance_marked_absent_event,
          database_id: database_id,
          host_id: host_id,
          instance_number: absent_db_instance_number,
          absent_at: DateTime.utc_now()
        ),
        build(
          :database_instance_registered_event,
          database_id: database_id,
          sid: sid,
          host_id: host_id,
          instance_number: present_db_instance_number,
          system_replication: nil,
          system_replication_status: nil
        )
      ]

      assert_events_and_state(
        initial_events,
        [
          %RegisterDatabaseInstance{
            database_id: database_id,
            host_id: host_id,
            instance_number: absent_db_instance_number,
            health: :passing
          },
          %RegisterDatabaseInstance{
            database_id: database_id,
            host_id: host_id,
            instance_number: present_db_instance_number,
            health: :passing
          }
        ],
        [
          %DatabaseInstanceMarkedPresent{
            instance_number: absent_db_instance_number,
            host_id: host_id,
            database_id: database_id
          }
        ],
        fn state ->
          assert %Database{
                   sid: ^sid,
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

  describe "legacy events" do
    test "should ignore SAP system legacy events and not update the aggregate" do
      sap_system_id = UUID.uuid4()

      [database_registered_event, _] =
        initial_events = [
          build(
            :database_registered_event,
            database_id: sap_system_id
          ),
          build(
            :database_instance_registered_event,
            database_id: sap_system_id,
            system_replication: nil,
            system_replication_status: nil
          )
        ]

      assert_state(
        initial_events ++
          [
            %SapSystemEvents.ApplicationInstanceDeregistered{sap_system_id: sap_system_id},
            %SapSystemEvents.ApplicationInstanceHealthChanged{sap_system_id: sap_system_id},
            %SapSystemEvents.ApplicationInstanceMarkedAbsent{sap_system_id: sap_system_id},
            %SapSystemEvents.ApplicationInstanceMarkedPresent{sap_system_id: sap_system_id},
            %SapSystemEvents.ApplicationInstanceMoved{sap_system_id: sap_system_id},
            %SapSystemEvents.ApplicationInstanceRegistered{sap_system_id: sap_system_id},
            %SapSystemEvents.SapSystemDeregistered{sap_system_id: sap_system_id},
            %SapSystemEvents.SapSystemHealthChanged{sap_system_id: sap_system_id},
            %SapSystemEvents.SapSystemRegistered{sap_system_id: sap_system_id},
            %SapSystemEvents.SapSystemRestored{sap_system_id: sap_system_id},
            %SapSystemEvents.SapSystemUpdated{sap_system_id: sap_system_id},
            %SapSystemEvents.SapSystemRollUpRequested{sap_system_id: sap_system_id},
            %SapSystemEvents.SapSystemRolledUp{sap_system_id: sap_system_id},
            %SapSystemEvents.SapSystemTombstoned{sap_system_id: sap_system_id}
          ],
        [],
        fn database ->
          assert database.database_id == database_registered_event.database_id
          assert database.sid == database_registered_event.sid
          assert database.health == database_registered_event.health
        end
      )
    end
  end

  defp fake_sid,
    do: Enum.join([Faker.Util.letter(), Faker.Util.letter(), Faker.Util.letter()])
end
