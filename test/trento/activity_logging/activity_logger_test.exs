defmodule Trento.ActivityLog.ActivityLoggerTest do
  @moduledoc false

  use TrentoWeb.ConnCase, async: true
  use Trento.MessagingCase
  use Plug.Test

  import Trento.Factory

  import Mox

  alias Trento.Abilities.Ability

  alias Trento.ActivityLog.{ActivityLog, ActivityLogger}
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

  describe "changing activity log retention time detection" do
    defp change_retention_time(conn, retention_time) do
      conn
      |> put_req_header("content-type", "application/json")
      |> put("/api/v1/settings/activity_log", retention_time)
    end

    test "should not log a failing update of the activity log settings",
         %{conn: conn, user: %{id: user_id}} do
      insert(:activity_log_settings)

      conn
      |> with_token(user_id)
      |> change_retention_time(%{
        retention_time: %{
          value: 42,
          unit: :invalid_unit
        }
      })
      |> json_response(422)

      wait_for_tasks_completion()

      assert [] = Trento.Repo.all(ActivityLog)
    end

    test "should log a successful update of the activity log settings",
         %{conn: conn, user: %{id: user_id, username: username}} do
      insert(:activity_log_settings)

      conn
      |> with_token(user_id)
      |> change_retention_time(%{
        retention_time: %{
          value: 42,
          unit: :day
        }
      })
      |> json_response(200)

      wait_for_tasks_completion()

      assert [
               %ActivityLog{
                 type: "activity_log_settings_update",
                 actor: ^username,
                 metadata: %{
                   "retention_time" => %{
                     "unit" => "day",
                     "value" => 42
                   }
                 }
               }
             ] = Trento.Repo.all(ActivityLog)
    end
  end

  describe "checks execution request activity detection" do
    defp request_checks_execution(conn, component_id, component_type) do
      conn
      |> put_req_header("content-type", "application/json")
      |> post("/api/v1/#{component_type}/#{component_id}/checks/request_execution")
    end

    test "should not log a checks execution request failing because of a non existent resource",
         %{conn: conn, user: %{id: user_id}} do
      for component_type <- ["clusters", "hosts"] do
        conn
        |> with_token(user_id)
        |> request_checks_execution(Faker.UUID.v4(), component_type)
        |> json_response(404)

        wait_for_tasks_completion()

        assert [] = Trento.Repo.all(ActivityLog)
      end
    end

    test "should not log a checks execution request failing because of empty checks selection", %{
      conn: conn,
      user: %{id: user_id}
    } do
      for {component_type, factory_reference} <- [{"clusters", :cluster}, {"hosts", :host}] do
        %{id: component_id} = insert(factory_reference, selected_checks: [])

        conn
        |> with_token(user_id)
        |> request_checks_execution(component_id, component_type)
        |> json_response(422)

        wait_for_tasks_completion()

        assert [] = Trento.Repo.all(ActivityLog)
      end
    end

    successful_checks_execution_request_scenarios = [
      %{
        component_type: "clusters",
        factory_reference: :cluster,
        expected_activity_type: "cluster_checks_execution_request",
        expected_metadata_entry: "cluster_id"
      },
      %{
        component_type: "hosts",
        factory_reference: :host,
        expected_activity_type: "host_checks_execution_request",
        expected_metadata_entry: "host_id"
      }
    ]

    for %{component_type: component_type} = scenario <-
          successful_checks_execution_request_scenarios do
      @scenario scenario

      test "should log a successful checks execution request for #{component_type}", %{
        conn: conn,
        user: %{id: user_id, username: username}
      } do
        %{
          component_type: component_type,
          factory_reference: factory_reference,
          expected_activity_type: expected_activity_type,
          expected_metadata_entry: expected_metadata_entry
        } = @scenario

        %{id: component_id} = insert(factory_reference)

        conn
        |> with_token(user_id)
        |> request_checks_execution(component_id, component_type)
        |> json_response(202)

        wait_for_tasks_completion()

        expected_metadata = %{
          expected_metadata_entry => component_id
        }

        assert [
                 %ActivityLog{
                   type: ^expected_activity_type,
                   actor: ^username,
                   metadata: ^expected_metadata
                 }
               ] = Trento.Repo.all(ActivityLog)
      end
    end
  end

  test "domain event activity logging" do
    heartbeat_succeeded_event = build(:heartbeat_succeded)
    heartbeat_failed_event = build(:heartbeat_failed)
    host_registered_event = build(:host_registered_event)
    host_checks_health_changed_event = build(:host_checks_health_changed)
    host_checks_selected_event = build(:host_checks_selected)

    software_updates_discovery_requested_event =
      build(:software_updates_discovery_requested_event)

    events = [
      {host_registered_event, "host_registered"},
      {heartbeat_succeeded_event, "heartbeat_succeeded"},
      {heartbeat_failed_event, "heartbeat_failed"},
      {host_checks_health_changed_event, "host_checks_health_changed"},
      {host_checks_selected_event, "host_checks_selected"},
      {software_updates_discovery_requested_event, "software_updates_discovery_requested"}
    ]

    Enum.each(events, fn {event, _} ->
      assert :ok == ActivityLogger.log_activity(%{event: event, metadata: %{}})
    end)

    activity_log = Trento.Repo.all(ActivityLog)

    assert Enum.count(activity_log) == length(events)

    for {event, expected_activity_type} <- events do
      metadata =
        event
        |> Jason.encode!()
        |> Jason.decode!()

      assert %ActivityLog{
               type: ^expected_activity_type,
               actor: "system",
               metadata: ^metadata
             } =
               Enum.find(activity_log, &(&1.type == expected_activity_type))
    end
  end
end
