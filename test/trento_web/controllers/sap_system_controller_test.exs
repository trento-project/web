defmodule TrentoWeb.SapSystemControllerTest do
  use TrentoWeb.ConnCase, async: true

  import Trento.Factory

  alias Trento.Tag

  describe "tags" do
    test "should add a tag to a sap system", %{conn: conn} do
      conn =
        post(conn, Routes.sap_system_path(conn, :create_tag, Faker.UUID.v4()), %{
          "value" => Faker.Beer.style()
        })

      assert 201 == conn.status
    end

    test "should remove a tag from a sap system", %{conn: conn} do
      %Tag{
        id: _id,
        value: value,
        resource_id: resource_id,
        resource_type: _resource_type
      } = tag()

      conn = delete(conn, Routes.sap_system_path(conn, :delete_tag, resource_id, value))

      assert 204 == conn.status
    end

    test "should fail when attempting to remove a non existing tag from a sap system", %{
      conn: conn
    } do
      %Tag{
        id: _id,
        value: _value,
        resource_id: resource_id,
        resource_type: _resource_type
      } = tag()

      conn =
        delete(conn, Routes.sap_system_path(conn, :delete_tag, resource_id, "non-existing-tag"))

      assert 404 == conn.status
    end

    test "should add a tag to a database", %{conn: conn} do
      conn =
        post(conn, Routes.sap_system_path(conn, :create_database_tag, Faker.UUID.v4()), %{
          "value" => Faker.Beer.style()
        })

      assert 201 == conn.status
    end

    test "should remove a tag from a database", %{conn: conn} do
      %Tag{
        id: _id,
        value: value,
        resource_id: resource_id,
        resource_type: _resource_type
      } = tag()

      conn = delete(conn, Routes.sap_system_path(conn, :delete_tag, resource_id, value))

      assert 204 == conn.status
    end
  end

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
