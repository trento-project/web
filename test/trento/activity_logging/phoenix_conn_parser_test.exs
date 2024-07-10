defmodule Trento.ActivityLog.PhoenixConnParserTest do
  @moduledoc false

  use TrentoWeb.ConnCase, async: false
  use Plug.Test

  import Trento.Factory

  alias Trento.ActivityLog.Logger.Parser.PhoenixConnParser

  require Trento.ActivityLog.ActivityCatalog, as: ActivityCatalog

  describe "activity detection" do
    test "should not be able to detect an activity from a connection without controller/action info",
         %{conn: conn} do
      assert nil == PhoenixConnParser.detect_activity(conn)
    end

    test "should detect activity from a connection with controller/action info", %{conn: conn} do
      assert {Foo.Bar.AcmeController, :foo_action} ==
               conn
               |> Plug.Conn.put_private(:phoenix_controller, Foo.Bar.AcmeController)
               |> Plug.Conn.put_private(:phoenix_action, :foo_action)
               |> PhoenixConnParser.detect_activity()
    end
  end

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
        assert PhoenixConnParser.get_activity_actor(ActivityCatalog.login_attempt(), %{
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

  defp assert_for_relevant_activity(assertion_function) do
    ActivityCatalog.activity_catalog()
    |> Enum.filter(&(&1 != ActivityCatalog.login_attempt()))
    |> Enum.each(fn activity -> assertion_function.(activity) end)
  end
end
