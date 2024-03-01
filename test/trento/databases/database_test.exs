defmodule Trento.Databases.DatabaseTest do
  use Trento.AggregateCase, aggregate: Trento.Databases.Database, async: true

  import Trento.Factory

  require Trento.SapSystems.Enums.EnsaVersion, as: EnsaVersion

  alias Trento.SapSystems.Commands.{
    DeregisterApplicationInstance,
    DeregisterDatabaseInstance,
    MarkApplicationInstanceAbsent,
    MarkDatabaseInstanceAbsent,
    RegisterApplicationInstance,
    RegisterDatabaseInstance,
    RollUpSapSystem
  }

  alias Trento.SapSystems.Events.{
    ApplicationInstanceDeregistered,
    ApplicationInstanceHealthChanged,
    ApplicationInstanceMarkedAbsent,
    ApplicationInstanceMarkedPresent,
    ApplicationInstanceMoved,
    ApplicationInstanceRegistered,
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
    Instance
  }

  alias Trento.Databases.Database

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
      %Database{
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
      %Database{
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
  test "should not restore a deregistered database when the registering database instance has Secondary role" do
    sap_system_id = UUID.uuid4()

    primary_database_host_id = UUID.uuid4()
    secondary_database_host_id = UUID.uuid4()

    deregistered_at = DateTime.utc_now()

    db_instance_number_1 = "00"
    db_instance_number_2 = "01"

    db_sid = fake_sid()
    application_sid = fake_sid()

    message_server_host_id = UUID.uuid4()
    message_server_instance_number = "00"
    abap_host_id = UUID.uuid4()
    abap_instance_number = "01"

    initial_events = [
      build(
        :database_registered_event,
        sap_system_id: sap_system_id,
        sid: db_sid
      ),
      build(
        :database_instance_registered_event,
        sap_system_id: sap_system_id,
        host_id: primary_database_host_id,
        sid: db_sid,
        instance_number: db_instance_number_1,
        system_replication: "Primary"
      ),
      build(
        :database_instance_registered_event,
        sap_system_id: sap_system_id,
        host_id: secondary_database_host_id,
        instance_number: db_instance_number_2,
        system_replication: "Secondary",
        sid: db_sid
      ),
      build(:database_instance_deregistered_event,
        sap_system_id: sap_system_id,
        host_id: primary_database_host_id,
        instance_number: db_instance_number_1,
        deregistered_at: deregistered_at
      ),
      build(:database_deregistered_event,
        sap_system_id: sap_system_id,
        deregistered_at: deregistered_at
      ),
    ]

    command =
      build(:register_database_instance_command,
        system_replication: "Secondary",
        sid: db_sid,
        sap_system_id: sap_system_id
      )

    assert_error(
      initial_events,
      command,
      {:error, :sap_system_not_registered}
    )
  end

  test "should restore a deregistered database when the registering database instance has system replication disabled, with database instance leftovers" do
    sap_system_id = UUID.uuid4()

    primary_database_host_id = UUID.uuid4()
    secondary_database_host_id = UUID.uuid4()

    deregistered_at = DateTime.utc_now()

    db_instance_number_1 = "00"
    db_instance_number_2 = "01"

    db_sid = fake_sid()
    application_sid = fake_sid()

    message_server_host_id = UUID.uuid4()
    message_server_instance_number = "00"
    abap_host_id = UUID.uuid4()
    abap_instance_number = "01"

    initial_events = [
      build(
        :database_registered_event,
        sap_system_id: sap_system_id,
        sid: db_sid
      ),
      build(
        :database_instance_registered_event,
        sap_system_id: sap_system_id,
        host_id: primary_database_host_id,
        sid: db_sid,
        instance_number: db_instance_number_1,
        system_replication: "Primary"
      ),
      build(
        :database_instance_registered_event,
        sap_system_id: sap_system_id,
        host_id: secondary_database_host_id,
        instance_number: db_instance_number_2,
        system_replication: "Secondary",
        sid: db_sid
      ),
      build(:database_instance_deregistered_event,
        sap_system_id: sap_system_id,
        host_id: primary_database_host_id,
        instance_number: db_instance_number_1,
        deregistered_at: deregistered_at
      ),
      build(:database_deregistered_event,
        sap_system_id: sap_system_id,
        deregistered_at: deregistered_at
      ),
    ]

    %{features: features, instance_number: instance_number, health: health} =
      command =
      build(:register_database_instance_command,
        system_replication: nil,
        sid: db_sid,
        sap_system_id: sap_system_id
      )

    assert_events_and_state(
      initial_events,
      command,
      [
        %DatabaseInstanceRegistered{
          sap_system_id: sap_system_id,
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
          sap_system_id: sap_system_id,
          health: command.health
        }
      ],
      fn sap_system ->
        assert  %Database{
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
                 } = sap_system
      end
    )
  end

  test "should restore a deregistered database when the registering database instance has system replication disabled, without database instance leftovers" do
    sap_system_id = UUID.uuid4()

    primary_database_host_id = UUID.uuid4()
    secondary_database_host_id = UUID.uuid4()

    deregistered_at = DateTime.utc_now()

    db_instance_number_1 = "00"
    db_instance_number_2 = "01"

    db_sid = fake_sid()
    application_sid = fake_sid()

    message_server_host_id = UUID.uuid4()
    message_server_instance_number = "00"
    abap_host_id = UUID.uuid4()
    abap_instance_number = "01"

    initial_events = [
      build(
        :database_registered_event,
        sap_system_id: sap_system_id,
        sid: db_sid
      ),
      build(
        :database_instance_registered_event,
        sap_system_id: sap_system_id,
        host_id: primary_database_host_id,
        sid: db_sid,
        instance_number: db_instance_number_1,
        system_replication: "Primary"
      ),
      build(
        :database_instance_registered_event,
        sap_system_id: sap_system_id,
        host_id: secondary_database_host_id,
        instance_number: db_instance_number_2,
        system_replication: "Secondary",
        sid: db_sid
      ),
      build(:database_instance_deregistered_event,
        sap_system_id: sap_system_id,
        host_id: primary_database_host_id,
        instance_number: db_instance_number_1,
        deregistered_at: deregistered_at
      ),
      build(:database_instance_deregistered_event,
        sap_system_id: sap_system_id,
        host_id: secondary_database_host_id,
        instance_number: db_instance_number_2,
        deregistered_at: deregistered_at
      ),
      build(:database_deregistered_event,
        sap_system_id: sap_system_id,
        deregistered_at: deregistered_at
      )
    ]

    %{features: features, instance_number: instance_number, health: health} =
      command =
      build(:register_database_instance_command,
        system_replication: nil,
        sid: db_sid,
        sap_system_id: sap_system_id
      )

    assert_events_and_state(
      initial_events,
      command,
      [
        %DatabaseInstanceRegistered{
          sap_system_id: sap_system_id,
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
          sap_system_id: sap_system_id,
          health: command.health
        }
      ],
      fn sap_system ->
        assert Kernel.length(sap_system.database.instances) == 1

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
                 } = sap_system
      end
    )
  end

  test "should restore a deregistered database when the registering database instance is a primary, without database instance leftovers" do
    sap_system_id = UUID.uuid4()

    primary_database_host_id = UUID.uuid4()
    secondary_database_host_id = UUID.uuid4()

    deregistered_at = DateTime.utc_now()

    db_instance_number_1 = "00"
    db_instance_number_2 = "01"

    db_sid = fake_sid()
    application_sid = fake_sid()

    message_server_host_id = UUID.uuid4()
    message_server_instance_number = "00"
    abap_host_id = UUID.uuid4()
    abap_instance_number = "01"

    initial_events = [
      build(
        :database_registered_event,
        sap_system_id: sap_system_id,
        sid: db_sid
      ),
      build(
        :database_instance_registered_event,
        sap_system_id: sap_system_id,
        host_id: primary_database_host_id,
        sid: db_sid,
        instance_number: db_instance_number_1,
        system_replication: "Primary"
      ),
      build(
        :database_instance_registered_event,
        sap_system_id: sap_system_id,
        host_id: secondary_database_host_id,
        instance_number: db_instance_number_2,
        system_replication: "Secondary",
        sid: db_sid
      ),
      build(:database_instance_deregistered_event,
        sap_system_id: sap_system_id,
        host_id: primary_database_host_id,
        instance_number: db_instance_number_1,
        deregistered_at: deregistered_at
      ),
      build(:database_instance_deregistered_event,
        sap_system_id: sap_system_id,
        host_id: secondary_database_host_id,
        instance_number: db_instance_number_2,
        deregistered_at: deregistered_at
      ),
      build(:database_deregistered_event,
        sap_system_id: sap_system_id,
        deregistered_at: deregistered_at
      ),
    ]

    %{features: features, instance_number: instance_number, health: health} =
      command =
      build(:register_database_instance_command,
        system_replication: "Primary",
        sid: db_sid,
        sap_system_id: sap_system_id
      )

    assert_events_and_state(
      initial_events,
      command,
      [
        %DatabaseInstanceRegistered{
          sap_system_id: sap_system_id,
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
          sap_system_id: sap_system_id,
          health: command.health
        }
      ],
      fn sap_system ->
        assert Kernel.length(sap_system.database.instances) == 1

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
                 }  = sap_system
      end
    )
  end

  test "should restore a deregistered database when the registering database instance is a primary, with database instance leftovers" do
    sap_system_id = UUID.uuid4()

    primary_database_host_id = UUID.uuid4()
    secondary_database_host_id = UUID.uuid4()

    deregistered_at = DateTime.utc_now()

    db_instance_number_1 = "00"
    db_instance_number_2 = "01"

    db_sid = fake_sid()
    application_sid = fake_sid()

    message_server_host_id = UUID.uuid4()
    message_server_instance_number = "00"
    abap_host_id = UUID.uuid4()
    abap_instance_number = "01"

    initial_events = [
      build(
        :database_registered_event,
        sap_system_id: sap_system_id,
        sid: db_sid
      ),
      build(
        :database_instance_registered_event,
        sap_system_id: sap_system_id,
        host_id: primary_database_host_id,
        sid: db_sid,
        instance_number: db_instance_number_1,
        system_replication: "Primary"
      ),
      build(
        :database_instance_registered_event,
        sap_system_id: sap_system_id,
        host_id: secondary_database_host_id,
        instance_number: db_instance_number_2,
        system_replication: "Secondary",
        sid: db_sid
      ),
      build(:database_instance_deregistered_event,
        sap_system_id: sap_system_id,
        host_id: primary_database_host_id,
        instance_number: db_instance_number_1,
        deregistered_at: deregistered_at
      ),
      build(:database_deregistered_event,
        sap_system_id: sap_system_id,
        deregistered_at: deregistered_at
      ),
    ]

    %{features: features, instance_number: instance_number, health: health} =
      command =
      build(:register_database_instance_command,
        system_replication: "Primary",
        sid: db_sid,
        sap_system_id: sap_system_id
      )

    assert_events_and_state(
      initial_events,
      command,
      [
        %DatabaseInstanceRegistered{
          sap_system_id: sap_system_id,
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
          sap_system_id: sap_system_id,
          health: command.health
        }
      ],
      fn sap_system ->
        assert Kernel.length(sap_system.database.instances) == 2

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
                 } = sap_system
      end
    )
  end


  test "should deregister a secondary DB instance, no SAP system registered." do
    sap_system_id = UUID.uuid4()
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
          sap_system_id: sap_system_id,
          sid: db_sid
        ),
        build(
          :database_instance_registered_event,
          sap_system_id: sap_system_id,
          system_replication: "Primary",
          sid: db_sid,
          instance_number: instance_number_1,
          host_id: primary_db_host_id
        ),
        build(
          :database_instance_registered_event,
          sap_system_id: sap_system_id,
          system_replication: "Secondary",
          sid: db_sid,
          host_id: secondary_db_host_id,
          instance_number: instance_number_2
        )
      ],
      %DeregisterDatabaseInstance{
        sap_system_id: sap_system_id,
        host_id: secondary_db_host_id,
        instance_number: instance_number_2,
        deregistered_at: deregistered_at
      },
      %DatabaseInstanceDeregistered{
        sap_system_id: sap_system_id,
        host_id: secondary_db_host_id,
        instance_number: instance_number_2,
        deregistered_at: deregistered_at
      },
      fn sap_system ->
        assert %Database{
                   sid: ^db_sid,
                   deregistered_at: nil,
                   instances: [%Instance{instance_number: ^instance_number_1}]
                 } = sap_system
      end
    )
  end

  defp fake_sid,
    do: Enum.join([Faker.Util.letter(), Faker.Util.letter(), Faker.Util.letter()])
end
