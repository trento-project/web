defmodule TrentoWeb.SapSystemViewTest do
  use TrentoWeb.ConnCase, async: true

  import Phoenix.View

  test "should add the system replication status to the secondary instance and should remove it from the primary one" do
    [%{database_instances: database_instances}] =
      render(TrentoWeb.SapSystemView, "sap_systems.json", %{
        sap_systems: [
          %{
            database_instances: [
              %Trento.DatabaseInstanceReadModel{
                system_replication: "Secondary",
                system_replication_status: "",
                tenant: "ed758b1b-358b-47cf-ae99-f9e17da0cc54"
              },
              %Trento.DatabaseInstanceReadModel{
                system_replication: "Primary",
                system_replication_status: "ACTIVE",
                tenant: "5d4f71dd-b672-470c-b9de-79d2b943a9fd"
              }
            ]
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
