defmodule TrentoWeb.V1.TagsControllerTest do
  use TrentoWeb.ConnCase, async: true

  import Trento.Factory
  alias Faker.Color
  alias Trento.Tag

  describe "Tag Validation" do
    test "should decline tag with whitespace", %{conn: conn} do
      conn =
        conn
        |> put_req_header("content-type", "application/json")
        |> post("/api/v1/hosts/#{Faker.UUID.v4()}/tags", %{
          "value" => "     "
        })

      assert %{
               "errors" => [
                 %{
                   "detail" => "can't be blank",
                   "source" => %{"pointer" => "/value"},
                   "title" => "Invalid value"
                 }
               ]
             } = json_response(conn, 422)
    end

    test "should decline tag with forbidden characters", %{conn: conn} do
      conn =
        conn
        |> put_req_header("content-type", "application/json")
        |> post("/api/v1/hosts/#{Faker.UUID.v4()}/tags", %{
          "value" => "This / is a \ wrong #tag"
        })

      assert %{
               "errors" => [
                 %{
                   "detail" => "has invalid format",
                   "source" => %{"pointer" => "/value"},
                   "title" => "Invalid value"
                 }
               ]
             } = json_response(conn, 422)
    end
  end

  describe "tagging sap systems and databases" do
    test "should add a tag to a sap system", %{conn: conn} do
      conn =
        conn
        |> put_req_header("content-type", "application/json")
        |> post("/api/v1/sap_systems/#{Faker.UUID.v4()}/tags", %{
          "value" => Color.En.name()
        })

      assert 201 == conn.status
    end

    test "should remove a tag from a sap system", %{conn: conn} do
      %Tag{
        value: value,
        resource_id: resource_id
      } = insert(:tag, resource_type: :sap_system)

      conn = delete(conn, "/api/v1/sap_systems/#{resource_id}/tags/#{value}")

      assert 204 == conn.status
    end

    test "should fail when attempting to remove a non existing tag from a sap system", %{
      conn: conn
    } do
      %Tag{
        resource_id: resource_id
      } = insert(:tag, resource_type: :sap_system)

      conn =
        delete(
          conn,
          "/api/v1/sap_systems/#{resource_id}/tags/non-existing-tag"
        )

      assert 404 == conn.status
    end

    test "should add a tag to a database", %{conn: conn} do
      conn =
        conn
        |> put_req_header("content-type", "application/json")
        |> post("/api/v1/databases/#{Faker.UUID.v4()}/tags", %{
          "value" => Color.En.name()
        })

      assert 201 == conn.status
    end

    test "should remove a tag from a database", %{conn: conn} do
      %Tag{
        value: value,
        resource_id: resource_id
      } = insert(:tag, resource_type: :database)

      conn = delete(conn, "/api/v1/databases/#{resource_id}/tags/#{value}")

      assert 204 == conn.status
    end
  end

  describe "tagging clusters" do
    test "should add a tag to a cluster", %{conn: conn} do
      %{"value" => value} =
        conn
        |> put_req_header("content-type", "application/json")
        |> post("/api/v1/clusters/#{Faker.UUID.v4()}/tags", %{
          "value" => tag_value = Color.En.name()
        })
        |> json_response(201)

      assert value == tag_value
    end

    test "should remove a tag from a cluster", %{conn: conn} do
      %Tag{
        value: value,
        resource_id: resource_id
      } = insert(:tag, resource_type: :cluster)

      conn = delete(conn, "/api/v1/clusters/#{resource_id}/tags/#{value}")

      assert 204 == conn.status
    end

    test "should fail when attempting to remove a non existing tag from a cluster", %{conn: conn} do
      %Tag{
        resource_id: resource_id
      } = insert(:tag, resource_type: :cluster)

      conn =
        delete(
          conn,
          "/api/v1/clusters/#{resource_id}/tags/non-existing-tag"
        )

      assert 404 == conn.status
    end
  end

  describe "tagging hosts" do
    test "should add a tag to a host", %{conn: conn} do
      conn =
        conn
        |> put_req_header("content-type", "application/json")
        |> post("/api/v1/hosts/#{Faker.UUID.v4()}/tags", %{
          "value" => Color.En.name()
        })

      assert 201 == conn.status
    end

    test "should remove a tag from a host", %{conn: conn} do
      %Tag{
        value: value,
        resource_id: resource_id
      } = insert(:tag, resource_type: :host)

      conn = delete(conn, "/api/v1/hosts/#{resource_id}/tags/#{value}")

      assert 204 == conn.status
    end

    test "should fail when attempting to remove a non existing tag from a host", %{conn: conn} do
      %Tag{
        resource_id: resource_id
      } = insert(:tag, resource_type: :host)

      conn =
        delete(
          conn,
          "/api/v1/hosts/#{resource_id}/tags/non-existing-tag"
        )

      assert 404 == conn.status
    end
  end
end
