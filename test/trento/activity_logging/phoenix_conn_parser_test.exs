defmodule Trento.ActivityLog.PhoenixConnParserTest do
  @moduledoc false

  use TrentoWeb.ConnCase, async: false
  use Plug.Test

  import Trento.Factory

  alias Trento.ActivityLog.Logger.Parser.PhoenixConnParser

  require Trento.ActivityLog.ActivityCatalog, as: ActivityCatalog

  describe "actor detection" do
    test "should get the actor from the request payload for login attempts", %{conn: conn} do
      scenarios = [
        %{
          body_params: %{"username" => "foo"},
          expected_username: "foo"
        },
        %{
          body_params: %{"not-username" => "bar"},
          expected_username: "no_username"
        },
        %{
          body_params: %{},
          expected_username: "no_username"
        }
      ]

      for %{body_params: body_params, expected_username: expected_username} <- scenarios do
        assert PhoenixConnParser.get_activity_actor(:login_attempt, %{
                 conn
                 | body_params: body_params
               }) == expected_username
      end
    end

    test "should get the actor from the current user", %{conn: conn} do
      %{username: expected_username} = user = build(:user)

      pow_config = [otp_app: :trento]

      conn =
        conn
        |> Pow.Plug.put_config(pow_config)
        |> Pow.Plug.assign_current_user(user, pow_config)

      assert_for_relevant_activity(fn activity ->
        assert PhoenixConnParser.get_activity_actor(activity, conn) == expected_username
      end)
    end

    test "should fallback to system actor", %{conn: conn} do
      pow_config = [otp_app: :trento]

      conn = Pow.Plug.put_config(conn, pow_config)

      assert_for_relevant_activity(fn activity ->
        assert PhoenixConnParser.get_activity_actor(activity, conn) == "system"
      end)
    end
  end

  describe "metadata detection" do
    test "should extract the request body as metadata for relevant activities", %{conn: conn} do
      for activity <- [:api_key_generation, :activity_log_settings_update] do
        request_body = %{"foo" => "bar"}

        assert request_body ==
                 PhoenixConnParser.get_activity_metadata(activity, %Plug.Conn{
                   conn
                   | body_params: request_body
                 })
      end
    end

    test "should extract component id when requesting checks execution", %{conn: conn} do
      host_id = Faker.UUID.v4()
      cluster_id = Faker.UUID.v4()

      scenarios = [
        %{
          action: :cluster_checks_execution_request,
          params: %{:cluster_id => cluster_id},
          expected_metadata: %{:cluster_id => cluster_id}
        },
        %{
          action: :host_checks_execution_request,
          params: %{:id => host_id},
          expected_metadata: %{:host_id => host_id}
        },
        %{
          action: :host_checks_execution_request,
          params: %{:foo => "bar"},
          expected_metadata: %{:host_id => nil}
        },
        %{
          action: :cluster_checks_execution_request,
          params: %{:foo => "bar"},
          expected_metadata: %{:cluster_id => nil}
        }
      ]

      for %{
            action: action,
            params: params,
            expected_metadata: expected_metadata
          } <- scenarios do
        assert expected_metadata ==
                 PhoenixConnParser.get_activity_metadata(action, %Plug.Conn{
                   conn
                   | params: params,
                     body_params: %{}
                 })
      end
    end

    test "should extract component id when applying a checks selection", %{conn: conn} do
      host_id = Faker.UUID.v4()
      cluster_id = Faker.UUID.v4()

      checks = ["foo", "bar"]

      scenarios = [
        %{
          action: :cluster_checks_selected,
          params: %{:cluster_id => cluster_id},
          expected_metadata: %{:cluster_id => cluster_id, checks: checks}
        },
        %{
          action: :host_checks_selected,
          params: %{:id => host_id},
          expected_metadata: %{:host_id => host_id, checks: checks}
        },
        %{
          action: :host_checks_selected,
          params: %{:foo => "bar"},
          expected_metadata: %{:host_id => nil, checks: checks}
        },
        %{
          action: :cluster_checks_selected,
          params: %{:foo => "bar"},
          expected_metadata: %{:cluster_id => nil, checks: checks}
        }
      ]

      for %{
            action: action,
            params: params,
            expected_metadata: expected_metadata
          } <- scenarios do
        assert expected_metadata ==
                 PhoenixConnParser.get_activity_metadata(action, %Plug.Conn{
                   conn
                   | params: params,
                     body_params: %{
                       checks: checks
                     }
                 })
      end
    end

    @correlation_id Faker.UUID.v4()
    for scenario <- [
          %{
            action: :host_cleanup_requested,
            conn_assigns: %{correlation_id: @correlation_id},
            expected_metadata: %{correlation_id: @correlation_id}
          },
          %{
            action: :sap_system_cleanup_requested,
            conn_assigns: %{correlation_id: @correlation_id},
            expected_metadata: %{correlation_id: @correlation_id}
          },
          %{
            action: :database_cleanup_requested,
            conn_assigns: %{correlation_id: @correlation_id},
            expected_metadata: %{correlation_id: @correlation_id}
          }
        ] do
      @scenario scenario
      test "should extract correlation_id from #{@scenario.action} action", %{
        conn: conn
      } do
        assert Map.equal?(
                 @scenario.expected_metadata,
                 PhoenixConnParser.get_activity_metadata(@scenario.action, %Plug.Conn{
                   conn
                   | assigns: @scenario.conn_assigns
                 })
               )
      end
    end

    test "should extract operation metadata from requested operation", %{conn: conn} do
      resource_id = Faker.UUID.v4()
      operation_id = Faker.UUID.v4()
      body_params = %{"key" => "value"}

      # No need to add all operations. One operation per resource type is enough
      scenarios = [
        %{
          action: :cluster_operation_requested,
          operation: "cluster_maintenance_change",
          atom_operation: :cluster_maintenance_change
        },
        %{
          action: :host_operation_requested,
          operation: "saptune_solution_apply",
          atom_operation: :saptune_solution_apply
        }
      ]

      for %{
            action: action,
            operation: operation,
            atom_operation: atom_operation
          } <- scenarios do
        assert %{
                 :resource_id => resource_id,
                 :operation => atom_operation,
                 :operation_id => operation_id,
                 :params => body_params
               } ==
                 PhoenixConnParser.get_activity_metadata(action, %Plug.Conn{
                   conn
                   | params: %{id: resource_id, operation: operation},
                     body_params: body_params,
                     resp_body: Jason.encode!(%{operation_id: operation_id})
                 })
      end
    end
  end

  defp assert_for_relevant_activity(assertion_function) do
    ActivityCatalog.connection_activities()
    |> Enum.filter(&(&1 != :login_attempt))
    |> Enum.each(fn activity -> assertion_function.(activity) end)
  end
end
