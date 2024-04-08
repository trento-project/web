defmodule TrentoWeb.V1.SapSystemViewTest do
  use TrentoWeb.ConnCase, async: true

  import Phoenix.View
  import Trento.Factory
  alias Trento.Databases.Projections.DatabaseInstanceReadModel
  alias Trento.SapSystems.Projections.SapSystemReadModel
  alias TrentoWeb.V1.SapSystemView

  describe "SapSystemView" do
    test "should render sap_systems.json" do
      %{id: database_id, sid: database_sid} = database = insert(:database)

      [database_instance] =
        database_instances = build_list(1, :database_instance, database_id: database_id)

      %{
        sid: database_instance_sid,
        tenant: database_instance_tenant,
        instance_number: database_instance_number,
        instance_hostname: database_instance_hostname,
        features: database_instance_features,
        http_port: database_instance_http_port,
        https_port: database_instance_https_port,
        start_priority: database_instance_start_priority,
        host_id: database_instance_host_id,
        system_replication: database_instance_system_replication,
        system_replication_status: database_instance_system_replication_status,
        health: database_instance_health,
        absent_at: database_instance_absent_at,
        inserted_at: database_instance_inserted_at,
        updated_at: database_instance_updated_at
      } = database_instance

      [application_instance] = application_instances = build_list(1, :application_instance)

      %{
        sap_system_id: application_instance_sap_system_id,
        sid: application_instance_sid,
        instance_number: application_instance_number,
        features: application_instance_features,
        host_id: application_instance_host_id,
        health: application_instance_health,
        absent_at: application_instance_absent_at,
        inserted_at: application_instance_inserted_at,
        updated_at: application_instance_updated_at,
        start_priority: application_instance_start_priority,
        instance_hostname: application_instance_hostname,
        https_port: application_instance_https_port,
        http_port: application_instance_http_port
      } = application_instance

      %{
        id: sap_system_id,
        tags: sap_system_tags,
        health: sap_system_health,
        tenant: sap_system_tenant,
        sid: sap_system_sid,
        ensa_version: sap_system_ensa_version,
        db_host: sap_system_db_host,
        inserted_at: sap_system_inserted_at,
        updated_at: sap_system_updated_at
      } =
        sap_system =
        build(:sap_system,
          tags: [],
          database_id: database_id,
          database: database,
          database_instances: database_instances,
          application_instances: application_instances
        )

      expect_sap_system_json =
        [
          %{
            id: sap_system_id,
            tags: sap_system_tags,
            inserted_at: sap_system_inserted_at,
            updated_at: sap_system_updated_at,
            health: sap_system_health,
            tenant: sap_system_tenant,
            sid: sap_system_sid,
            database_instances: [
              %{
                database_id: database_id,
                # keep backward compatibility between sap_system_id and database_id
                sap_system_id: database_id,
                sid: database_instance_sid,
                tenant: database_instance_tenant,
                instance_number: database_instance_number,
                instance_hostname: database_instance_hostname,
                features: database_instance_features,
                http_port: database_instance_http_port,
                https_port: database_instance_https_port,
                start_priority: database_instance_start_priority,
                host_id: database_instance_host_id,
                system_replication: database_instance_system_replication,
                system_replication_status: database_instance_system_replication_status,
                health: database_instance_health,
                absent_at: database_instance_absent_at,
                inserted_at: database_instance_inserted_at,
                updated_at: database_instance_updated_at
              }
            ],
            database_id: database_id,
            application_instances: [
              %{
                sap_system_id: application_instance_sap_system_id,
                sid: application_instance_sid,
                instance_number: application_instance_number,
                features: application_instance_features,
                host_id: application_instance_host_id,
                health: application_instance_health,
                absent_at: application_instance_absent_at,
                inserted_at: application_instance_inserted_at,
                updated_at: application_instance_updated_at,
                start_priority: application_instance_start_priority,
                instance_hostname: application_instance_hostname,
                https_port: application_instance_https_port,
                http_port: application_instance_http_port
              }
            ],
            ensa_version: sap_system_ensa_version,
            database_sid: database_sid,
            db_host: sap_system_db_host
          }
        ]

      assert expect_sap_system_json ==
               render(SapSystemView, "sap_systems.json", %{
                 sap_systems: [sap_system]
               })
    end

    test "should add the system replication status to the secondary instance and should remove it from the primary one" do
      database = build(:database)

      [%{database_instances: database_instances}] =
        render(SapSystemView, "sap_systems.json", %{
          sap_systems: [
            %SapSystemReadModel{
              database: database,
              database_instances: [
                %DatabaseInstanceReadModel{
                  system_replication: "Secondary",
                  system_replication_status: "",
                  tenant: "ed758b1b-358b-47cf-ae99-f9e17da0cc54"
                },
                %DatabaseInstanceReadModel{
                  system_replication: "Primary",
                  system_replication_status: "ACTIVE",
                  tenant: "5d4f71dd-b672-470c-b9de-79d2b943a9fd"
                }
              ],
              application_instances: []
            }
          ]
        })

      assert Enum.any?(database_instances, fn
               %{
                 system_replication: "Secondary",
                 system_replication_status: "ACTIVE"
               } ->
                 true

               _ ->
                 false
             end)
    end
  end
end
