defmodule TrentoWeb.SapSystemControllerTest do
  use TrentoWeb.ConnCase, async: true

  import Trento.Factory

  alias Trento.{
    SapSystemReadModel,
    Tag
  }

  describe "tags" do
    test "add a tag to a sap system", %{conn: conn} do
      conn =
        post(conn, Routes.sap_system_path(conn, :create_tag, Faker.UUID.v4()), %{
          "value" => Faker.Beer.style()
        })

      assert 201 == conn.status
    end

    test "remove a tag from a sap system", %{conn: conn} do
      %Tag{
        id: _id,
        value: value,
        resource_id: resource_id,
        resource_type: _resource_type
      } = tag()

      conn = delete(conn, Routes.sap_system_path(conn, :delete_tag, resource_id, value))

      assert 204 == conn.status
    end

    test "remove a non existing tag from a sap system", %{conn: conn} do
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
  end

  describe "list" do
    test "list all sap systems", %{conn: conn} do
      %SapSystemReadModel{} = sap_system_projection()

      conn = get(conn, Routes.sap_system_path(conn, :list))

      assert 200 == conn.status
    end
  end
end
