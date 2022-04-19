defmodule TrentoWeb.SapSystemControllerTest do
  use TrentoWeb.ConnCase, async: true

  import Trento.Factory

  describe "list" do
    test "should list all sap_systems", %{conn: conn} do
      [
        %{
          id: sap_system_id_1,
          sid: sap_system_sid_1
        },
        %{
          id: sap_system_id_2,
          sid: sap_system_sid_2
        },
        %{
          id: sap_system_id_3,
          sid: sap_system_sid_3
        }
      ] =
        0..2
        |> Enum.map(fn _ -> sap_system_projection() end)
        |> Enum.sort_by(& &1.sid)

      conn = get(conn, Routes.sap_system_path(conn, :list))

      assert [
               %{
                 "id" => ^sap_system_id_1,
                 "sid" => ^sap_system_sid_1
               },
               %{
                 "id" => ^sap_system_id_2,
                 "sid" => ^sap_system_sid_2
               },
               %{
                 "id" => ^sap_system_id_3,
                 "sid" => ^sap_system_sid_3
               }
             ] = json_response(conn, 200)
    end

    test "should list all databases", %{conn: conn} do
      [
        %{
          id: database_id_1,
          sid: database_sid_1
        },
        %{
          id: database_id_2,
          sid: database_sid_2
        },
        %{
          id: database_id_3,
          sid: database_sid_3
        }
      ] =
        0..2
        |> Enum.map(fn _ -> database_projection() end)
        |> Enum.sort_by(& &1.sid)

      conn = get(conn, Routes.sap_system_path(conn, :list_databases))

      assert [
               %{
                 "id" => ^database_id_1,
                 "sid" => ^database_sid_1
               },
               %{
                 "id" => ^database_id_2,
                 "sid" => ^database_sid_2
               },
               %{
                 "id" => ^database_id_3,
                 "sid" => ^database_sid_3
               }
             ] = json_response(conn, 200)
    end
  end
end
