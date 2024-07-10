defmodule Trento.ActivityLog.PhoenixConnParserTest do
  @moduledoc false

  use TrentoWeb.ConnCase, async: false
  use Plug.Test

  alias Trento.ActivityLog.Parser.ActivityParser

  describe "to_activity_log" do
    test "should return false if the activity is not interesting for logging" do
      conn = %Plug.Conn{
        private: %{
          phoenix_controller: Foo.Bar.AcmeController,
          phoenix_action: :foo_action
        }
      }

      assert false == ActivityParser.to_activity_log(conn)
    end

    test "should return nil if any problem parsing the activity" do
      conn = "invalid"

      assert nil == ActivityParser.to_activity_log(conn)
    end

    test "should return the activity log entry for login attempt with username" do
      conn = %Plug.Conn{
        body_params: %{"username" => "foo"},
        private: %{
          phoenix_controller: TrentoWeb.SessionController,
          phoenix_action: :create
        }
      }

      expected = %{
        type: "login_attempt",
        actor: "foo",
        metadata: %{}
      }

      assert expected == ActivityParser.to_activity_log(conn)
    end
  end
end
