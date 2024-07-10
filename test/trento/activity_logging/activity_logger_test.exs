defmodule Trento.ActivityLog.ActivityLoggerTest do
  @moduledoc false

  use TrentoWeb.ConnCase, async: true
  use Plug.Test

  import Trento.Factory

  import Mox

  alias Trento.Abilities.Ability

  alias Trento.ActivityLog.ActivityLog
  alias Trento.Tags.Tag

  alias TrentoWeb.Auth.AccessToken

  setup [:set_mox_from_context, :verify_on_exit!]

  setup do
    {:ok, user} =
      Trento.Users.create_user(%{
        username: "admin",
        password: "testpassword",
        confirm_password: "testpassword",
        email: "test@trento.com",
        fullname: "Full Name",
        abilities: [%Ability{id: 1}]
      })

    stub(
      Joken.CurrentTime.Mock,
      :current_time,
      fn ->
        1_671_715_992
      end
    )

    {:ok, user: user}
  end

  defp with_token(conn, user_id) do
    jwt = AccessToken.generate_access_token!(%{"sub" => user_id})

    Plug.Conn.put_req_header(conn, "authorization", "Bearer " <> jwt)
  end

  describe "login activity detection" do
    defp login(conn, credentials) do
      post(conn, "/api/session", credentials)
    end

    login_scenarios = [
      %{
        name: "with invalid credentials",
        credentials: %{
          username: "foo",
          password: "bar"
        },
        expected_metadata: %{
          "username" => "foo",
          "reason" => "Invalid credentials."
        }
      },
      %{
        name: "with valid credentials",
        credentials: %{
          username: "admin",
          password: "testpassword"
        },
        expected_metadata: %{}
      }
    ]

    for %{name: name} = scenario <- login_scenarios do
      @scenario scenario

      test "should get the metadata for a login attempt: #{name}", %{conn: conn} do
        %{credentials: %{username: username} = credentials, expected_metadata: expected_metadata} =
          @scenario

        login(conn, credentials)

        wait_for_tasks_completion()

        assert [
                 %ActivityLog{
                   type: "login_attempt",
                   actor: ^username,
                   metadata: ^expected_metadata
                 }
               ] = Trento.Repo.all(ActivityLog)
      end
    end
  end

  describe "tagging/untagging activity detection" do
    defp tag_resource(conn, resource_id, resource_type, tag) do
      conn
      |> put_req_header("content-type", "application/json")
      |> post("/api/v1/#{resource_type}/#{resource_id}/tags", %{
        "value" => tag
      })
    end

    defp untag_resource(conn, resource_id, resource_type, tag) do
      conn
      |> put_req_header("content-type", "application/json")
      |> delete("/api/v1/#{resource_type}/#{resource_id}/tags/#{tag}")
    end

    tagging_extraction_scenarios = [
      %{
        path_resource: "hosts",
        expected_resource_type: "host"
      },
      %{
        path_resource: "clusters",
        expected_resource_type: "cluster"
      },
      %{
        path_resource: "databases",
        expected_resource_type: "database"
      },
      %{
        path_resource: "sap_systems",
        expected_resource_type: "sap_system"
      }
    ]

    for %{path_resource: path_resource} = scenario <- tagging_extraction_scenarios do
      @scenario scenario

      test "should get the metadata for resource tagging activity: #{path_resource}", %{
        conn: conn,
        user: %{id: user_id, username: username}
      } do
        %{path_resource: path_resource, expected_resource_type: expected_resource_type} =
          @scenario

        resource_id = Faker.UUID.v4()
        tag = Faker.Lorem.word()

        conn
        |> with_token(user_id)
        |> tag_resource(resource_id, path_resource, tag)

        wait_for_tasks_completion()

        assert [
                 %ActivityLog{
                   type: "resource_tagging",
                   actor: ^username,
                   metadata: %{
                     "resource_id" => ^resource_id,
                     "resource_type" => ^expected_resource_type,
                     "added_tag" => ^tag
                   }
                 }
               ] = Trento.Repo.all(ActivityLog)
      end
    end

    for %{path_resource: path_resource} = scenario <- tagging_extraction_scenarios do
      @scenario scenario

      test "should get the metadata for resource untagging activity: #{path_resource}", %{
        conn: conn,
        user: %{id: user_id, username: username}
      } do
        %{path_resource: path_resource, expected_resource_type: expected_resource_type} =
          @scenario

        %Tag{
          value: tag,
          resource_id: resource_id
        } = insert(:tag, resource_type: expected_resource_type)

        conn
        |> with_token(user_id)
        |> untag_resource(resource_id, path_resource, tag)

        wait_for_tasks_completion()

        assert [
                 %ActivityLog{
                   type: "resource_untagging",
                   actor: ^username,
                   metadata: %{
                     "resource_id" => ^resource_id,
                     "resource_type" => ^expected_resource_type,
                     "removed_tag" => ^tag
                   }
                 }
               ] = Trento.Repo.all(ActivityLog)
      end
    end
  end
end
