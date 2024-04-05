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

      database_instances = [
        build(:database_instance, database_id: database_id)
      ]

      database_instance = Enum.at(database_instances, 0)

      application_instances = [build(:application_instance)]
      application_instance = Enum.at(application_instances, 0)

      sap_system =
        build(:sap_system,
          tags: [],
          database_id: database_id,
          database: database,
          database_instances: database_instances,
          application_instances: application_instances
        )

      expected_sap_system_json =
        [
          %{
            id: sap_system.id,
            tags: [],
            inserted_at: nil,
            updated_at: nil,
            health: sap_system.health,
            tenant: sap_system.tenant,
            sid: sap_system.sid,
            database_instances: [
              %{
                sap_system_id: database_id,
                # keep backward compatibility between sap_system_id and database_id
                database_id: database_id,
                sid: database_instance.sid,
                tenant: database_instance.tenant,
                instance_number: database_instance.instance_number,
                instance_hostname: nil,
                features: database_instance.features,
                http_port: nil,
                https_port: nil,
                start_priority: nil,
                host_id: database_instance.host_id,
                system_replication: database_instance.system_replication,
                system_replication_status: database_instance.system_replication_status,
                health: database_instance.health,
                absent_at: nil,
                inserted_at: nil,
                updated_at: nil
              }
            ],
            database_id: database_id,
            application_instances: [
              %{
                sap_system_id: application_instance.sap_system_id,
                sid: application_instance.sid,
                instance_number: application_instance.instance_number,
                features: application_instance.features,
                host_id: application_instance.host_id,
                health: application_instance.health,
                absent_at: nil,
                inserted_at: nil,
                updated_at: nil,
                start_priority: nil,
                instance_hostname: nil,
                https_port: nil,
                http_port: nil
              }
            ],
            ensa_version: sap_system.ensa_version,
            database_sid: database_sid,
            db_host: sap_system.db_host
          }
        ]

      assert ^expected_sap_system_json =
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
