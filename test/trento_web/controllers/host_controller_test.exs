defmodule TrentoWeb.HostControllerTest do
  use TrentoWeb.ConnCase, async: true

  import Trento.Factory

  alias Trento.{
    HostReadModel,
    Tag
  }

  describe "tags" do
    test "add a tag to a host", %{conn: conn} do
      conn =
        post(conn, Routes.host_path(conn, :create_tag, Faker.UUID.v4()), %{
          "value" => Faker.Beer.style()
        })

      assert 201 == conn.status
    end

    test "remove a tag from a host", %{conn: conn} do
      %Tag{
        id: _id,
        value: value,
        resource_id: resource_id,
        resource_type: _resource_type
      } = tag()

      conn = delete(conn, Routes.host_path(conn, :delete_tag, resource_id, value))

      assert 204 == conn.status
    end

    test "remove a non existing tag from a host", %{conn: conn} do
      %Tag{
        id: _id,
        value: _value,
        resource_id: resource_id,
        resource_type: _resource_type
      } = tag()

      conn = delete(conn, Routes.host_path(conn, :delete_tag, resource_id, "non-existing-tag"))

      assert 404 == conn.status
    end
  end

  describe "list" do
    test "list all hosts", %{conn: conn} do
      %HostReadModel{} = host_projection()

      conn = get(conn, Routes.host_path(conn, :list))

      assert 200 == conn.status
    end
  end
end
