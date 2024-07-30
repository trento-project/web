defmodule Trento.ActivityLog.EventParser do
  @moduledoc false

  use TrentoWeb.ConnCase, async: false
  use Plug.Test

  import Trento.Factory

  alias Trento.ActivityLog.Logger.Parser.EventParser

  require Trento.ActivityLog.ActivityCatalog, as: ActivityCatalog

  @events [
    build(:heartbeat_succeded),
    build(:heartbeat_failed),
    build(:host_registered_event),
    build(:host_checks_health_changed),
    build(:host_checks_selected),
    build(:software_updates_discovery_requested_event)
  ]

  @unsupported_activities [
    {Foo.Bar.Events.ThingHappened, %{event: %{"foo" => "bar"}}},
    {"foo_bar", %{event: %{"bar" => "baz"}}},
    {nil, %{event: %{"qux" => "quux"}}},
    {42, %{event: %{"qux" => "quux"}}},
    {[], %{event: %{"quux" => "bar"}}},
    {{}, %{event: %{"quux" => "baz"}}}
  ]

  describe "actor detection" do
    test "should not detect actor for unsupported domain event activities" do
      for {event_type, event_context} <- @unsupported_activities do
        assert nil == EventParser.get_activity_actor(event_type, event_context)
      end
    end

    test "should detect actor for supported domain event activity" do
      for %event_type{} = event <- @events do
        assert "system" == EventParser.get_activity_actor(event_type, %{event: event})
      end
    end
  end

  describe "metadata extraction" do
    test "should not detect metadata for unsupported domain event activities" do
      for {event_type, event_context} <- @unsupported_activities do
        assert %{} == EventParser.get_activity_metadata(event_type, event_context)
      end
    end

    test "should detect metadata for supported domain event activity" do
      for %event_type{} = event <- @events do
        assert event == EventParser.get_activity_metadata(event_type, %{event: event})
      end
    end
  end
end
