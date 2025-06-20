defmodule Trento.ActivityLog.EventParser do
  @moduledoc false

  use TrentoWeb.ConnCase, async: false
  use Plug.Test

  import Trento.Factory

  alias Trento.ActivityLog.Logger.Parser.EventParser

  @recognized_inputs [
    {:host_registered, build(:host_registered_event)},
    {:heartbeat_succeeded, build(:heartbeat_succeded)},
    {:heartbeat_failed, build(:heartbeat_failed)},
    {:host_checks_health_changed, build(:host_checks_health_changed)},
    {:host_checks_selected, build(:host_checks_selected_event)},
    {:software_updates_discovery_requested, build(:software_updates_discovery_requested_event)},
    {:foo_bar, TestEvent.new!(%{data: "some event"})}
  ]

  @unrecognized_inputs [
    {:foo_bar, "baz"},
    {"foo_bar", %{bar: "baz"}},
    {nil, %{}},
    {42, []},
    {[], nil},
    {{}, 42},
    {build(:heartbeat_succeded), %{baz: "foo"}}
  ]

  describe "actor detection" do
    test "should not detect actor for unrecognized input" do
      for {event_activity, event_context} <- @unrecognized_inputs do
        assert nil == EventParser.get_activity_actor(event_activity, event_context)
      end
    end

    test "should detect actor for recognized input" do
      for {event_activity, event} <- @recognized_inputs do
        assert "system" == EventParser.get_activity_actor(event_activity, %{event: event})
      end
    end
  end

  describe "metadata extraction" do
    test "should fallback to empty map for unrecognized input" do
      for {event_activity, event_context} <- @unrecognized_inputs do
        assert %{} == EventParser.get_activity_metadata(event_activity, event_context)
      end
    end

    test "should detect metadata for recognized input" do
      for {event_activity, event} <- @recognized_inputs do
        correlation_id = UUID.uuid4()
        metadata = %{correlation_id: correlation_id}

        extracted_metadata =
          EventParser.get_activity_metadata(event_activity, %{event: event, metadata: metadata})

        trimmed_event =
          event
          |> Map.reject(fn {k, _} -> k in [:version, :__struct__] end)
          |> Map.put(:correlation_id, correlation_id)

        assert Map.equal?(extracted_metadata, trimmed_event)
      end
    end
  end
end
