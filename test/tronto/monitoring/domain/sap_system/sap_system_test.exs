defmodule Tronto.Monitoring.SapSystemTest do
  use Tronto.AggregateCase, aggregate: Tronto.Monitoring.Domain.SapSystem, async: true

  import Tronto.Factory

  alias Tronto.Monitoring.Domain.Commands.{
    RegisterApplicationInstance,
    RegisterDatabaseInstance
  }

  alias Tronto.Monitoring.Domain.Events.{
    ApplicationInstanceRegistered,
    DatabaseInstanceRegistered,
    SapSystemRegistered
  }

  alias Tronto.Monitoring.Domain.SapSystem

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
        host_id: host_id
      ),
      %DatabaseInstanceRegistered{
        sap_system_id: sap_system_id,
        sid: sid,
        tenant: tenant,
        instance_number: instance_number,
        features: features,
        host_id: host_id
      },
      %SapSystem{
        sap_system_id: sap_system_id,
        # The SAP System aggregate is not complete yet.
        # The sid will be set when the first application instance is registered.
        sid: nil,
        database: %SapSystem.Database{
          sid: sid,
          tenant: tenant,
          instances: [
            %SapSystem.Instance{
              sid: sid,
              instance_number: instance_number,
              features: features,
              host_id: host_id
            }
          ]
        }
      }
    )
  end

  test "should add a database instance to an existing SAP System" do
    sap_system_id = Faker.UUID.v4()
    sid = Faker.StarWars.planet()
    tenant = Faker.Beer.style()
    instance_number = "00"
    features = Faker.Pokemon.name()
    host_id = Faker.UUID.v4()

    initial_event =
      database_instance_registered_event(
        sap_system_id: sap_system_id,
        sid: sid,
        tenant: tenant,
        instance_number: "10"
      )

    assert_events_and_state(
      initial_event,
      RegisterDatabaseInstance.new!(
        sap_system_id: sap_system_id,
        sid: sid,
        tenant: tenant,
        instance_number: instance_number,
        features: features,
        host_id: host_id
      ),
      %DatabaseInstanceRegistered{
        sap_system_id: sap_system_id,
        sid: sid,
        tenant: tenant,
        instance_number: instance_number,
        features: features,
        host_id: host_id
      },
      fn
        %SapSystem{
          database: %SapSystem.Database{
            instances: [
              %SapSystem.Instance{
                sid: ^sid,
                instance_number: ^instance_number,
                features: ^features,
                host_id: ^host_id
              }
              | _
            ]
          }
        } ->
          true

        _ ->
          false
      end
    )
  end

  test "should not add a database instance if the database instance was already registered" do
    initial_event = database_instance_registered_event()

    assert_events(
      initial_event,
      RegisterDatabaseInstance.new!(
        sap_system_id: initial_event.sap_system_id,
        sid: initial_event.sid,
        tenant: initial_event.tenant,
        instance_number: initial_event.instance_number,
        features: initial_event.features,
        host_id: initial_event.host_id
      ),
      []
    )
  end

  test "should register a SAP System and add an application instance" do
    initial_event = database_instance_registered_event()
    sid = Faker.StarWars.planet()
    db_host = Faker.Internet.ip_v4_address()
    tenant = Faker.Beer.style()
    features = Faker.Pokemon.name()
    host_id = Faker.UUID.v4()

    assert_events_and_state(
      initial_event,
      RegisterApplicationInstance.new!(
        sap_system_id: initial_event.sap_system_id,
        sid: sid,
        db_host: db_host,
        tenant: tenant,
        instance_number: "00",
        features: features,
        host_id: host_id
      ),
      [
        %SapSystemRegistered{
          sap_system_id: initial_event.sap_system_id,
          sid: sid,
          db_host: db_host,
          tenant: tenant
        },
        %ApplicationInstanceRegistered{
          sap_system_id: initial_event.sap_system_id,
          sid: sid,
          instance_number: "00",
          features: features,
          host_id: host_id
        }
      ],
      fn
        %SapSystem{
          sid: ^sid,
          application: %SapSystem.Application{
            sid: ^sid,
            instances: [
              %SapSystem.Instance{
                sid: ^sid,
                instance_number: "00",
                features: ^features,
                host_id: ^host_id
              }
            ]
          }
        } ->
          true

        _ ->
          false
      end
    )
  end

  test "should add an application instance to a registered SAP System" do
    sap_system_id = Faker.UUID.v4()
    sid = Faker.StarWars.planet()

    initial_events = [
      database_instance_registered_event(sap_system_id: sap_system_id),
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
        host_id: new_instance_host_id
      ),
      %ApplicationInstanceRegistered{
        sap_system_id: sap_system_id,
        sid: sid,
        instance_number: new_instance_number,
        features: new_instance_features,
        host_id: new_instance_host_id
      },
      fn
        %SapSystem{
          application: %SapSystem.Application{
            sid: ^sid,
            instances: [
              %SapSystem.Instance{
                sid: ^sid,
                instance_number: ^new_instance_number,
                features: ^new_instance_features,
                host_id: ^new_instance_host_id
              }
              | _
            ]
          }
        } ->
          true

        _ ->
          false
      end
    )
  end

  test "should not add a application instance if the application instance was already registered" do
    initial_event = application_instance_registered_event()

    assert_events(
      initial_event,
      RegisterApplicationInstance.new!(
        sap_system_id: initial_event.sap_system_id,
        sid: initial_event.sid,
        db_host: Faker.Internet.ip_v4_address(),
        tenant: Faker.Beer.hop(),
        instance_number: initial_event.instance_number,
        features: initial_event.features,
        host_id: initial_event.host_id
      ),
      []
    )
  end
end
