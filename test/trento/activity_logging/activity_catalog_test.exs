defmodule Trento.ActivityLog.ActivityCatalogTest do
  @moduledoc false

  import Trento.Factory

  use TrentoWeb.ConnCase, async: false

  alias Trento.ActivityLog.ActivityCatalog

  require Trento.ActivityLog.ActivityCatalog, as: ActivityCatalog

  describe "activity detection" do
    test "should not detect activity from invalid input" do
      Enum.each([nil, %{}, "", 42], fn input ->
        assert nil == ActivityCatalog.detect_activity(input)
      end)
    end

    test "should not be able to detect an activity from a connection without controller/action info",
         %{conn: conn} do
      assert nil == ActivityCatalog.detect_activity(conn)
    end

    test "should detect activity from a connection with controller/action info", %{conn: conn} do
      assert {Foo.Bar.AcmeController, :foo_action} ==
               conn
               |> Plug.Conn.put_private(:phoenix_controller, Foo.Bar.AcmeController)
               |> Plug.Conn.put_private(:phoenix_action, :foo_action)
               |> ActivityCatalog.detect_activity()
    end

    test "should detect activity from domain events" do
      %event_module{} = event = build(:host_registered_event)
      metadata = %{}
      assert event_module == ActivityCatalog.detect_activity(%{event: event, metadata: metadata})
    end
  end

  test "should ignore unknown activities", %{
    conn: conn
  } do
    Enum.each([:foo_bar, %{bar: "baz"}, "not-interesting", nil, %{}, 42], fn activity ->
      refute ActivityCatalog.interested?(activity, conn)
      assert nil == ActivityCatalog.get_activity_type(activity)
    end)
  end

  describe "activity type detectiion" do
    test "should detect correct activity type" do
      %heartbeat_succeded_event{} = build(:heartbeat_succeded)
      %heartbeat_failed_event{} = build(:heartbeat_failed)
      %host_registered_event{} = build(:host_registered_event)
      %host_checks_health_changed_event{} = build(:host_checks_health_changed)
      %host_checks_selected_event{} = build(:host_checks_selected)

      %software_updates_discovery_requested_event{} =
        build(:software_updates_discovery_requested_event)

      event_to_activity_type_map = [
        {host_registered_event, :host_registered},
        {heartbeat_succeded_event, :heartbeat_succeeded},
        {heartbeat_failed_event, :heartbeat_failed},
        {host_checks_health_changed_event, :host_checks_health_changed},
        {host_checks_selected_event, :host_checks_selected},
        {software_updates_discovery_requested_event, :software_updates_discovery_requested}
      ]

      for {event_module, expected_activity_type} <- event_to_activity_type_map do
        assert expected_activity_type == ActivityCatalog.get_activity_type(event_module)
      end
    end
  end

  scenarios = [
    %{
      activity: ActivityCatalog.login_attempt(),
      interesting_statuses: [200, 401, 404, 500],
      expected_activity_type: :login_attempt
    },
    %{
      activity: ActivityCatalog.resource_tagging(),
      interesting_statuses: 201,
      not_interesting_statuses: [400, 401, 403, 404, 500],
      expected_activity_type: :resource_tagging
    },
    %{
      activity: ActivityCatalog.resource_untagging(),
      interesting_statuses: 204,
      not_interesting_statuses: [400, 401, 403, 404, 500],
      expected_activity_type: :resource_untagging
    },
    %{
      activity: ActivityCatalog.api_key_generation(),
      interesting_statuses: 200,
      not_interesting_statuses: [400, 401, 403, 404, 500],
      expected_activity_type: :api_key_generation
    },
    %{
      activity: ActivityCatalog.saving_suma_settings(),
      interesting_statuses: 201,
      not_interesting_statuses: [400, 401, 403, 404, 500],
      expected_activity_type: :saving_suma_settings
    },
    %{
      activity: ActivityCatalog.changing_suma_settings(),
      interesting_statuses: 200,
      not_interesting_statuses: [400, 401, 403, 404, 500],
      expected_activity_type: :changing_suma_settings
    },
    %{
      activity: ActivityCatalog.clearing_suma_settings(),
      interesting_statuses: 204,
      not_interesting_statuses: [400, 401, 403, 404, 500],
      expected_activity_type: :clearing_suma_settings
    },
    %{
      activity: ActivityCatalog.user_creation(),
      interesting_statuses: 201,
      not_interesting_statuses: [400, 401, 403, 404, 500],
      expected_activity_type: :user_creation
    },
    %{
      activity: ActivityCatalog.user_modification(),
      interesting_statuses: 200,
      not_interesting_statuses: [400, 401, 403, 404, 500],
      expected_activity_type: :user_modification
    },
    %{
      activity: ActivityCatalog.user_deletion(),
      interesting_statuses: 204,
      not_interesting_statuses: [400, 401, 403, 404, 500],
      expected_activity_type: :user_deletion
    },
    %{
      activity: ActivityCatalog.profile_update(),
      interesting_statuses: 200,
      not_interesting_statuses: [400, 401, 403, 404, 500],
      expected_activity_type: :profile_update
    },
    %{
      activity: ActivityCatalog.cluster_checks_execution_request(),
      interesting_statuses: 202,
      not_interesting_statuses: [400, 401, 403, 404, 500],
      expected_activity_type: :cluster_checks_execution_request
    }
  ]

  for %{expected_activity_type: expected_activity_type} = scenario <- scenarios do
    @scenario scenario

    test "should detect interesting connection for activity #{expected_activity_type}", %{
      conn: conn
    } do
      %{
        activity: activity,
        interesting_statuses: interesting_statuses,
        expected_activity_type: expected_activity_type
      } = @scenario

      interesting_statuses
      |> List.wrap()
      |> Enum.each(fn status ->
        assert ActivityCatalog.interested?(activity, put_status(conn, status))
      end)

      Map.get(@scenario, :not_interesting_statuses, [])
      |> List.wrap()
      |> Enum.each(fn status ->
        refute ActivityCatalog.interested?(activity, put_status(conn, status))
      end)

      assert ActivityCatalog.get_activity_type(activity) == expected_activity_type
    end
  end
end
