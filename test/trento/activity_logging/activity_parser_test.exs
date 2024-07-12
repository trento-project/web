defmodule Trento.ActivityLog.ActivityParserTest do
  @moduledoc false

  use TrentoWeb.ConnCase, async: false
  use Plug.Test

  alias Trento.ActivityLog.Parser.ActivityParser

  # require Trento.ActivityLog.ActivityCatalog, as: ActivityCatalog

  describe "to_activity_log" do
    test "should return false if the activity is not interesting for logging" do
      conn = %Plug.Conn{
        private: %{
          phoenix_controller: Foo.Bar.AcmeController,
          phoenix_action: :foo_action
        }
      }

      assert {:error, :cannot_parse_activity} ==
               ActivityParser.to_activity_log({Foo.Bar.AcmeController, :foo_action}, conn)
    end

    test "should return an error if any problem parsing the activity" do
      conn = "invalid"

      assert {:error, :cannot_parse_activity} == ActivityParser.to_activity_log(:foo, conn)
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

      assert {:ok, expected} ==
               ActivityParser.to_activity_log({TrentoWeb.SessionController, :create}, conn)
    end
  end
end
