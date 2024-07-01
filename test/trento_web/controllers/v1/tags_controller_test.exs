defmodule TrentoWeb.V1.TagsControllerTest do
  use TrentoWeb.ConnCase, async: true

  import OpenApiSpex.TestAssertions
  import Trento.Factory
  import Trento.Support.Helpers.AbilitiesTestHelper
  alias Faker.Color
  alias Trento.Tags.Tag

  setup :setup_api_spec_v1
  setup :setup_user

  describe "forbidden actions" do
    test "should not return forbidden on any controller action if the user have the right ability for the tag resource",
         %{conn: conn} do
      %{id: user_id} = insert(:user)

      for tag_resource <- [:host, :sap_system, :cluster, :database] do
        %{id: ability_id} = insert(:ability, name: "all", resource: "#{tag_resource}_tags")
        insert(:users_abilities, user_id: user_id, ability_id: ability_id)
        %{id: resource_id} = insert(tag_resource)

        conn =
          conn
          |> Pow.Plug.assign_current_user(%{"user_id" => user_id}, Pow.Plug.fetch_config(conn))
          |> put_req_header("content-type", "application/json")

        resp =
          post(conn, "/api/v1/#{tag_resource}s/#{resource_id}/tags", %{
            "value" => "thetag"
          })

        assert resp.status == 201

        resp =
          delete(conn, "/api/v1/#{tag_resource}s/#{resource_id}/tags/thetag")

        assert resp.status == 204
      end
    end

    test "should return forbidden on any controller action if the user does not have the right permission",
         %{conn: conn, api_spec: api_spec} do
      %{id: user_id} = insert(:user)

      conn =
        conn
        |> Pow.Plug.assign_current_user(%{"user_id" => user_id}, Pow.Plug.fetch_config(conn))
        |> put_req_header("content-type", "application/json")

      for tag_resource <- [:host, :sap_system, :cluster, :database] do
        Enum.each(
          [
            post(conn, "/api/v1/#{tag_resource}s/#{Faker.UUID.v4()}/tags", %{
              "value" => "thetag"
            }),
            delete(conn, "/api/v1/#{tag_resource}s/#{Faker.UUID.v4()}/tags/thetag")
          ],
          fn conn ->
            conn
            |> json_response(:forbidden)
            |> assert_schema("Forbidden", api_spec)
          end
        )
      end
    end
  end

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
