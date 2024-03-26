defmodule TrentoWeb.V1.SapSystemViewTest do
  use TrentoWeb.ConnCase, async: true

  import Phoenix.View

  alias Trento.Databases.Projections.DatabaseInstanceReadModel
  alias Trento.SapSystems.Projections.SapSystemReadModel

  test "should add the system replication status to the secondary instance and should remove it from the primary one" do
    [%{database_instances: database_instances}] =
      render(TrentoWeb.V1.SapSystemView, "sap_systems.json", %{
        sap_systems: [
          %SapSystemReadModel{
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
