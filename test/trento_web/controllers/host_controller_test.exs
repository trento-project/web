defmodule TrentoWeb.HostControllerTest do
  use TrentoWeb.ConnCase, async: true

  import Trento.Factory

  alias Trento.Tag

  describe "tags" do
    test "should add a tag to a host", %{conn: conn} do
      conn =
        post(conn, Routes.host_path(conn, :create_tag, Faker.UUID.v4()), %{
          "value" => Faker.Beer.style()
        })

      assert 201 == conn.status
    end

    test "should remove a tag from a host", %{conn: conn} do
      %Tag{
        id: _id,
        value: value,
        resource_id: resource_id,
        resource_type: _resource_type
      } = tag()

      conn = delete(conn, Routes.host_path(conn, :delete_tag, resource_id, value))

      assert 204 == conn.status
    end

    test "should fail when attempting to remove a non existing tag from a host", %{conn: conn} do
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
    test "should list all hosts", %{conn: conn} do
      [
        %{id: host_id_1, hostname: host_name_1},
        %{id: host_id_2, hostname: host_name_2},
        %{id: host_id_3, hostname: host_name_3}
      ] =
        0..2
        |> Enum.map(fn _ -> host_projection() end)
        |> Enum.sort_by(& &1.hostname)

      conn = get(conn, Routes.host_path(conn, :list))

      assert [
               %{
                 "id" => ^host_id_1,
                 "hostname" => ^host_name_1
               },
               %{
                 "id" => ^host_id_2,
                 "hostname" => ^host_name_2
               },
               %{
                 "id" => ^host_id_3,
                 "hostname" => ^host_name_3
               }
             ] = json_response(conn, 200)
    end
  end
end
