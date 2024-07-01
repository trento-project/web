defmodule TrentoWeb.Plugs.ActivityLoggingPlugTest do
  @moduledoc false
  use Plug.Test
  use TrentoWeb.ConnCase, async: true
  use Trento.TaskCase

  import Mox

  import Trento.Factory

  alias Trento.Users.User
  alias TrentoWeb.Plugs.ActivityLoggingPlug

  require Logger

  setup :verify_on_exit!

  describe "logging activity on connections" do
    for method <- [:get, :post, :put, :patch, :delete] do
      @method method
      test "should log activity on requests without user information - method: #{method}" do
        %{private: private} = conn = build_conn(@method, "/foo/bar", nil)
        refute Map.has_key?(private, :before_send)

        expect(Trento.ActivityLog.ActivityLogger.Mock, :log_activity, 1, fn %Plug.Conn{
                                                                              assigns: assigns
                                                                            } ->
          refute Map.has_key?(assigns, :current_user)
          :ok
        end)

        %{private: %{before_send: [logging_function | _]}} =
          conn_with_registered_logger = ActivityLoggingPlug.call(conn)

        logging_function.(conn_with_registered_logger)

        wait_for_tasks_completion()
      end

      test "should log activity on requests with stateless user information - method #{method}" do
        %{id: user_id} = insert(:user)

        pow_config = [otp_app: :trento]
        conn = Pow.Plug.put_config(build_conn(), pow_config)

        conn = Pow.Plug.assign_current_user(conn, %{"user_id" => user_id}, pow_config)

        expect(Trento.ActivityLog.ActivityLogger.Mock, :log_activity, 1, fn %Plug.Conn{
                                                                              assigns: %{
                                                                                current_user:
                                                                                  %User{
                                                                                    id: ^user_id
                                                                                  }
                                                                              }
                                                                            } ->
          :ok
        end)

        %{private: %{before_send: [logging_function | _]}} =
          conn_with_registered_logger = ActivityLoggingPlug.call(conn)

        logging_function.(conn_with_registered_logger)

        wait_for_tasks_completion()
      end

      test "should log activity on requests with already loaded user information - method #{method}" do
        user = insert(:user)

        pow_config = [otp_app: :trento]
        conn = Pow.Plug.put_config(build_conn(), pow_config)

        conn = Pow.Plug.assign_current_user(conn, user, pow_config)

        expect(Trento.ActivityLog.ActivityLogger.Mock, :log_activity, 1, fn %Plug.Conn{
                                                                              assigns: %{
                                                                                current_user:
                                                                                  ^user
                                                                              }
                                                                            } ->
          :ok
        end)

        %{private: %{before_send: [logging_function | _]}} =
          conn_with_registered_logger = ActivityLoggingPlug.call(conn)

        logging_function.(conn_with_registered_logger)

        wait_for_tasks_completion()
      end
    end
  end

  describe "logging activity on requests" do
    test "should log tagging activity", %{conn: conn} do
      expect(Trento.ActivityLog.ActivityLogger.Mock, :log_activity, 1, fn %Plug.Conn{
                                                                            body_params: %{
                                                                              value: "some-tag"
                                                                            },
                                                                            assigns: %{
                                                                              current_user: _,
                                                                              resource_type: :host
                                                                            },
                                                                            status: 201
                                                                          } ->
        :ok
      end)

      conn
      |> put_req_header("content-type", "application/json")
      |> post("/api/v1/hosts/#{Faker.UUID.v4()}/tags", %{
        "value" => "some-tag"
      })
    end
  end
end
