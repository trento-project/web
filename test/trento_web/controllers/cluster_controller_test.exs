defmodule TrentoWeb.ClusterControllerTest do
  use TrentoWeb.ConnCase, async: true

  import Trento.Factory

  alias Trento.Tag

  describe "tags" do
    test "should add a tag to a cluster", %{conn: conn} do
      conn =
        post(conn, Routes.cluster_path(conn, :create_tag, Faker.UUID.v4()), %{
          "value" => tag_value = Faker.Beer.style()
        })

      assert json_response(conn, 201)["value"] == tag_value
    end

    test "should remove a tag from a cluster", %{conn: conn} do
      %Tag{
        id: _id,
        value: value,
        resource_id: resource_id,
        resource_type: _resource_type
      } = tag()

      conn = delete(conn, Routes.cluster_path(conn, :delete_tag, resource_id, value))

      assert 204 == conn.status
    end

    test "should fail when attempting to remove a non existing tag from a cluster", %{conn: conn} do
      %Tag{
        id: _id,
        value: _value,
        resource_id: resource_id,
        resource_type: _resource_type
      } = tag()

      conn = delete(conn, Routes.cluster_path(conn, :delete_tag, resource_id, "non-existing-tag"))

      assert 404 == conn.status
    end
  end

  describe "list" do
    test "should list all clusters", %{conn: conn} do
      [
        %{id: cluster_id_1, name: cluster_name_1},
        %{id: cluster_id_2, name: cluster_name_2},
        %{id: cluster_id_3, name: cluster_name_3}
      ] =
        0..2
        |> Enum.map(fn _ -> cluster_projection() end)
        |> Enum.sort_by(& &1.name)

      conn = get(conn, Routes.cluster_path(conn, :list))

      assert [
               %{
                 "id" => ^cluster_id_1,
                 "name" => ^cluster_name_1
               },
               %{
                 "id" => ^cluster_id_2,
                 "name" => ^cluster_name_2
               },
               %{
                 "id" => ^cluster_id_3,
                 "name" => ^cluster_name_3
               }
             ] = json_response(conn, 200)
    end
  end
end
