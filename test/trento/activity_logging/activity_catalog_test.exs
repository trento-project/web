defmodule Trento.ActivityLog.ActivityCatalogTest do
  @moduledoc false

  import Trento.Factory

  use TrentoWeb.ConnCase, async: false

  alias Trento.ActivityLog.ActivityCatalog

  require Trento.ActivityLog.ActivityCatalog, as: ActivityCatalog

  describe "activity exposure" do
    test "should expose connection related activities" do
      logged_connection_activities = [
        :login_attempt,
        :resource_tagging,
        :resource_untagging,
        :api_key_generation,
        :saving_suma_settings,
        :changing_suma_settings,
        :clearing_suma_settings,
        :saving_alerting_settings,
        :changing_alerting_settings,
        :user_creation,
        :user_modification,
        :user_deletion,
        :profile_update,
        :cluster_checks_selected,
        :cluster_checks_execution_request,
        :host_checks_selected,
        :host_checks_execution_request,
        :host_cleanup_requested,
        :sap_system_cleanup_requested,
        :database_cleanup_requested,
        :activity_log_settings_update,
        :host_operation_requested,
        :cluster_operation_requested,
        :application_instance_operation_requested
      ]

      connection_activity_catalog = ActivityCatalog.connection_activities()

      assert length(logged_connection_activities) == length(connection_activity_catalog)

      for connection_activity <- logged_connection_activities do
        assert connection_activity in connection_activity_catalog
      end
    end

    test "should expose domain event related activities" do
      domain_events = [
        :host_restored,
        :host_rolled_up,
        :software_updates_discovery_cleared,
        :saptune_status_updated,
        :host_roll_up_requested,
        :heartbeat_failed,
        :host_details_updated,
        :host_health_changed,
        :host_deregistered,
        :provider_updated,
        :host_saptune_health_changed,
        :software_updates_health_changed,
        :software_updates_discovery_requested,
        :heartbeat_succeeded,
        :sles_subscriptions_updated,
        :host_checks_health_changed,
        :host_deregistration_requested,
        :host_tombstoned,
        :host_registered,
        :cluster_registered,
        :cluster_rolled_up,
        :cluster_tombstoned,
        :cluster_roll_up_requested,
        :cluster_checks_health_changed,
        :host_added_to_cluster,
        :cluster_deregistered,
        :cluster_health_changed,
        :cluster_restored,
        :cluster_discovered_health_changed,
        :host_removed_from_cluster,
        :cluster_details_updated,
        :database_deregistered,
        :database_tombstoned,
        :database_roll_up_requested,
        :database_rolled_up,
        :database_instance_system_replication_changed,
        :database_instance_marked_absent,
        :database_instance_health_changed,
        :database_instance_marked_present,
        :database_instance_deregistered,
        :database_tenants_updated,
        :database_restored,
        :database_registered,
        :database_instance_registered,
        :database_health_changed,
        :application_instance_marked_absent,
        :sap_system_health_changed,
        :sap_system_tombstoned,
        :sap_system_database_health_changed,
        :sap_system_rolled_up,
        :application_instance_deregistered,
        :sap_system_registered,
        :application_instance_marked_present,
        :sap_system_restored,
        :sap_system_deregistered,
        :application_instance_health_changed,
        :sap_system_roll_up_requested,
        :sap_system_updated,
        :application_instance_moved,
        :application_instance_registered
      ]

      events_activities_catalog = ActivityCatalog.domain_event_activities()

      assert length(domain_events) <= length(events_activities_catalog)

      for event_module <- domain_events do
        assert event_module in events_activities_catalog
      end
    end

    test "should expose queue event related activities" do
      queue_events = [
        :operation_completed,
        :check_customization_applied,
        :check_customization_reset
      ]

      queue_activity_catalog = ActivityCatalog.queue_event_activities()

      assert length(queue_events) == length(queue_activity_catalog)

      for queue_event <- queue_events do
        assert queue_event in queue_activity_catalog
      end
    end
  end

  describe "activity detection" do
    test "should not detect activity from invalid input" do
      Enum.each([nil, %{}, "", 42, Foo.Bar.Event], fn input ->
        assert {:error, :not_interesting} == ActivityCatalog.detect_activity(input)
      end)
    end

    test "should not be able to detect an activity from a connection without controller/action info",
         %{conn: conn} do
      assert {:error, :not_interesting} == ActivityCatalog.detect_activity(conn)
    end

    test "should ignore activity from not interesting connections with controller/action info", %{
      conn: conn
    } do
      assert {:error, :not_interesting} ==
               conn
               |> Plug.Conn.put_private(:phoenix_controller, Foo.Bar.AcmeController)
               |> Plug.Conn.put_private(:phoenix_action, :foo_action)
               |> ActivityCatalog.detect_activity()
    end

    scenarios = [
      %{
        activity: :login_attempt,
        connection_info: {TrentoWeb.SessionController, :create},
        interesting_statuses: [200, 401, 404, 500]
      },
      %{
        activity: :resource_tagging,
        connection_info: {TrentoWeb.V1.TagsController, :add_tag},
        interesting_statuses: 201,
        not_interesting_statuses: [400, 401, 403, 404, 500]
      },
      %{
        activity: :resource_untagging,
        connection_info: {TrentoWeb.V1.TagsController, :remove_tag},
        interesting_statuses: 204,
        not_interesting_statuses: [400, 401, 403, 404, 500]
      },
      %{
        activity: :api_key_generation,
        connection_info: {TrentoWeb.V1.SettingsController, :update_api_key_settings},
        interesting_statuses: 200,
        not_interesting_statuses: [400, 401, 403, 404, 500]
      },
      %{
        activity: :saving_suma_settings,
        connection_info: {TrentoWeb.V1.SettingsController, :save_suse_manager_settings},
        interesting_statuses: 201,
        not_interesting_statuses: [400, 401, 403, 404, 500]
      },
      %{
        activity: :changing_suma_settings,
        connection_info: {TrentoWeb.V1.SettingsController, :update_suse_manager_settings},
        interesting_statuses: 200,
        not_interesting_statuses: [400, 401, 403, 404, 500]
      },
      %{
        activity: :clearing_suma_settings,
        connection_info: {TrentoWeb.V1.SettingsController, :delete_suse_manager_settings},
        interesting_statuses: 204,
        not_interesting_statuses: [400, 401, 403, 404, 500]
      },
      %{
        activity: :saving_alerting_settings,
        connection_info: {TrentoWeb.V1.SettingsController, :create_alerting_settings},
        interesting_statuses: 201,
        not_interesting_statuses: [400, 401, 403, 404, 500]
      },
      %{
        activity: :changing_alerting_settings,
        connection_info: {TrentoWeb.V1.SettingsController, :update_alerting_settings},
        interesting_statuses: 200,
        not_interesting_statuses: [400, 401, 403, 404, 500]
      },
      %{
        activity: :user_creation,
        connection_info: {TrentoWeb.V1.UsersController, :create},
        interesting_statuses: 201,
        not_interesting_statuses: [400, 401, 403, 404, 500]
      },
      %{
        activity: :user_modification,
        connection_info: {TrentoWeb.V1.UsersController, :update},
        interesting_statuses: 200,
        not_interesting_statuses: [400, 401, 403, 404, 500]
      },
      %{
        activity: :user_deletion,
        connection_info: {TrentoWeb.V1.UsersController, :delete},
        interesting_statuses: 204,
        not_interesting_statuses: [400, 401, 403, 404, 500]
      },
      %{
        activity: :profile_update,
        connection_info: {TrentoWeb.V1.ProfileController, :update},
        interesting_statuses: 200,
        not_interesting_statuses: [400, 401, 403, 404, 500]
      },
      %{
        activity: :cluster_checks_selected,
        connection_info: {TrentoWeb.V1.ClusterController, :select_checks},
        interesting_statuses: 202,
        not_interesting_statuses: [400, 401, 403, 404, 500]
      },
      %{
        activity: :cluster_checks_execution_request,
        connection_info: {TrentoWeb.V1.ClusterController, :request_checks_execution},
        interesting_statuses: 202,
        not_interesting_statuses: [400, 401, 403, 404, 500]
      },
      %{
        activity: :host_checks_selected,
        connection_info: {TrentoWeb.V1.HostController, :select_checks},
        interesting_statuses: 202,
        not_interesting_statuses: [400, 401, 403, 404, 500]
      },
      %{
        activity: :host_checks_execution_request,
        connection_info: {TrentoWeb.V1.HostController, :request_checks_execution},
        interesting_statuses: 202,
        not_interesting_statuses: [400, 401, 403, 404, 500]
      },
      %{
        activity: :host_operation_requested,
        connection_info: {TrentoWeb.V1.HostController, :request_operation},
        interesting_statuses: 202,
        not_interesting_statuses: [400, 401, 403, 404, 500]
      },
      %{
        activity: :cluster_operation_requested,
        connection_info: {TrentoWeb.V1.ClusterController, :request_operation},
        interesting_statuses: 202,
        not_interesting_statuses: [400, 401, 403, 404, 500]
      },
      %{
        activity: :application_instance_operation_requested,
        connection_info: {TrentoWeb.V1.SapSystemController, :request_instance_operation},
        interesting_statuses: 202,
        not_interesting_statuses: [400, 401, 403, 404, 500]
      }
    ]

    for %{activity: scenario_name} = scenario <- scenarios do
      @scenario scenario

      test "should detect connection activity for: #{scenario_name}",
           %{
             conn: conn
           } do
        %{
          activity: activity,
          connection_info: connection_info,
          interesting_statuses: interesting_statuses
        } = @scenario

        populate_conn = fn conn, {controller, action}, status ->
          conn
          |> Plug.Conn.put_private(:phoenix_controller, controller)
          |> Plug.Conn.put_private(:phoenix_action, action)
          |> put_status(status)
        end

        interesting_statuses
        |> List.wrap()
        |> Enum.each(fn status ->
          assert {:ok, ^activity} =
                   conn
                   |> populate_conn.(connection_info, status)
                   |> ActivityCatalog.detect_activity()
        end)

        Map.get(@scenario, :not_interesting_statuses, [])
        |> List.wrap()
        |> Enum.each(fn status ->
          assert {:error, :not_interesting} ==
                   conn
                   |> populate_conn.(connection_info, status)
                   |> ActivityCatalog.detect_activity()
        end)
      end
    end

    test "should detect activity from domain events" do
      events = [
        {build(:host_registered_event), :host_registered},
        {build(:heartbeat_succeded), :heartbeat_succeeded},
        {build(:heartbeat_failed), :heartbeat_failed},
        {build(:host_checks_health_changed), :host_checks_health_changed},
        {build(:software_updates_discovery_requested_event),
         :software_updates_discovery_requested}
      ]

      for {event, expected_activity_type} <- events do
        assert {:ok, expected_activity_type} ==
                 ActivityCatalog.detect_activity(%{event: event, metadata: %{}})
      end
    end

    test "should differentiate between legacy and current domain events" do
      legacy_event =
        Trento.SapSystems.Events.DatabaseDeregistered.new!(%{
          sap_system_id: Faker.UUID.v4(),
          deregistered_at: Faker.DateTime.backward(1)
        })

      current_event =
        Trento.Databases.Events.DatabaseDeregistered.new!(%{
          sap_system_id: Faker.UUID.v4(),
          deregistered_at: Faker.DateTime.backward(1)
        })

      assert {:error, :not_interesting} = ActivityCatalog.detect_activity(%{event: legacy_event})

      assert {:ok, :database_deregistered} =
               ActivityCatalog.detect_activity(%{event: current_event})
    end

    test "should ignore specific domain events" do
      excluded_events = [
        :host_checks_selected_event,
        :cluster_checks_selected_event
      ]

      for excluded_event <- excluded_events do
        assert {:error, :not_interesting} =
                 ActivityCatalog.detect_activity(%{event: build(excluded_event)})
      end
    end

    test "should detect activity from queue events" do
      events = [
        {build(:operation_completed_v1), :operation_completed},
        {build(:check_customization_applied_v1), :check_customization_applied},
        {build(:check_customization_reset_v1), :check_customization_reset}
      ]

      for {event, expected_activity_type} <- events do
        assert {:ok, expected_activity_type} ==
                 ActivityCatalog.detect_activity(%{queue_event: event, metadata: %{}})
      end
    end
  end
end
