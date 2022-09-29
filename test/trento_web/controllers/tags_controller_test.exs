defmodule TrentoWeb.TagsControllerTest do
  use TrentoWeb.ConnCase, async: true

  import Trento.Factory

  alias Trento.Tag

  describe "Tag Validation" do
    test "should decline tag with whitespace", %{conn: conn} do
      conn =
        post(conn, Routes.hosts_tagging_path(conn, :add_tag, Faker.UUID.v4()), %{
          "value" => "     "
        })

      assert %{
               "errors" => %{
                 "value" => ["can't be blank"]
               }
             } = json_response(conn, 400)
    end

    test "should decline tag with forbidden characters", %{conn: conn} do
      conn =
        post(conn, Routes.hosts_tagging_path(conn, :add_tag, Faker.UUID.v4()), %{
          "value" => "This / is a \ wrong #tag"
        })

      assert %{
               "errors" => %{
                 "value" => ["has invalid format"]
               }
             } = json_response(conn, 400)
    end
  end

  describe "tagging sap systems and databases" do
    test "should add a tag to a sap system", %{conn: conn} do
      conn =
        post(conn, Routes.sap_systems_tagging_path(conn, :add_tag, Faker.UUID.v4()), %{
          "value" => String.replace(Faker.Beer.style(), " ", "")
        })

      assert 201 == conn.status
    end

    test "should remove a tag from a sap system", %{conn: conn} do
      %Tag{
        id: _id,
        value: value,
        resource_id: resource_id,
        resource_type: _resource_type
      } = insert(:tag, resource_type: :sap_system)

      conn = delete(conn, Routes.sap_systems_tagging_path(conn, :remove_tag, resource_id, value))

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
      } = insert(:tag, resource_type: :sap_system)

      conn =
        delete(
          conn,
          Routes.sap_systems_tagging_path(conn, :remove_tag, resource_id, "non-existing-tag")
        )

      assert 404 == conn.status
    end

    test "should add a tag to a database", %{conn: conn} do
      conn =
        post(conn, Routes.databases_tagging_path(conn, :add_tag, Faker.UUID.v4()), %{
          "value" => String.replace(Faker.Beer.style(), " ", "")
        })

      assert 201 == conn.status
    end

    test "should remove a tag from a database", %{conn: conn} do
      %Tag{
        id: _id,
        value: value,
        resource_id: resource_id,
        resource_type: _resource_type
      } = insert(:tag, resource_type: :database)

      conn = delete(conn, Routes.databases_tagging_path(conn, :remove_tag, resource_id, value))

      assert 204 == conn.status
    end
  end

  describe "tagging clusters" do
    test "should add a tag to a cluster", %{conn: conn} do
      conn =
        post(conn, Routes.clusters_tagging_path(conn, :add_tag, Faker.UUID.v4()), %{
          "value" => tag_value = String.replace(Faker.Beer.style(), " ", "")
        })

      assert json_response(conn, 201)["value"] == tag_value
    end

    test "should remove a tag from a cluster", %{conn: conn} do
      %Tag{
        id: _id,
        value: value,
        resource_id: resource_id,
        resource_type: _resource_type
      } = insert(:tag, resource_type: :cluster)

      conn = delete(conn, Routes.clusters_tagging_path(conn, :remove_tag, resource_id, value))

      assert 204 == conn.status
    end

    test "should fail when attempting to remove a non existing tag from a cluster", %{conn: conn} do
      %Tag{
        id: _id,
        value: _value,
        resource_id: resource_id,
        resource_type: _resource_type
      } = insert(:tag, resource_type: :cluster)

      conn =
        delete(
          conn,
          Routes.clusters_tagging_path(conn, :remove_tag, resource_id, "non-existing-tag")
        )

      assert 404 == conn.status
    end
  end

  describe "tagging hosts" do
    test "should add a tag to a host", %{conn: conn} do
      conn =
        post(conn, Routes.hosts_tagging_path(conn, :add_tag, Faker.UUID.v4()), %{
          "value" => String.replace(Faker.Beer.style(), " ", "")
        })

      assert 201 == conn.status
    end

    test "should remove a tag from a host", %{conn: conn} do
      %Tag{
        id: _id,
        value: value,
        resource_id: resource_id,
        resource_type: _resource_type
      } = insert(:tag, resource_type: :host)

      conn = delete(conn, Routes.hosts_tagging_path(conn, :remove_tag, resource_id, value))

      assert 204 == conn.status
    end

    test "should fail when attempting to remove a non existing tag from a host", %{conn: conn} do
      %Tag{
        id: _id,
        value: _value,
        resource_id: resource_id,
        resource_type: _resource_type
      } = insert(:tag, resource_type: :host)

      conn =
        delete(
          conn,
          Routes.hosts_tagging_path(conn, :remove_tag, resource_id, "non-existing-tag")
        )

      assert 404 == conn.status
    end
  end
end
