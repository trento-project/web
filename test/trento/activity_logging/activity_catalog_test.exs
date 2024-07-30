defmodule Trento.ActivityLog.ActivityCatalogTest do
  @moduledoc false

  import Trento.Factory

  use TrentoWeb.ConnCase, async: false

  alias Trento.ActivityLog.ActivityCatalog

  require Trento.ActivityLog.ActivityCatalog, as: ActivityCatalog

  describe "activity exposure" do
    test "should expose connection related activities" do
      logged_connection_activities = [
        {TrentoWeb.SessionController, :create},
        {TrentoWeb.V1.ClusterController, :request_checks_execution},
        {TrentoWeb.V1.ProfileController, :update},
        {TrentoWeb.V1.SettingsController, :delete_suse_manager_settings},
        {TrentoWeb.V1.SettingsController, :save_suse_manager_settings},
        {TrentoWeb.V1.SettingsController, :update_api_key_settings},
        {TrentoWeb.V1.SettingsController, :update_suse_manager_settings},
        {TrentoWeb.V1.TagsController, :add_tag},
        {TrentoWeb.V1.TagsController, :remove_tag},
        {TrentoWeb.V1.UsersController, :create},
        {TrentoWeb.V1.UsersController, :delete},
        {TrentoWeb.V1.UsersController, :update}
      ]

      connection_activity_catalog = ActivityCatalog.connection_activities()

      assert length(logged_connection_activities) == length(connection_activity_catalog)

      for connection_activity <- logged_connection_activities do
        assert connection_activity in connection_activity_catalog
      end
    end

    test "should expose domain event related activities" do
      domain_events = [
        Trento.Hosts.Events.HostRestored,
        Trento.Hosts.Events.HostRolledUp,
        Trento.Hosts.Events.SoftwareUpdatesDiscoveryCleared,
        Trento.Hosts.Events.SaptuneStatusUpdated,
        Trento.Hosts.Events.HostRollUpRequested,
        Trento.Hosts.Events.HeartbeatFailed,
        Trento.Hosts.Events.HostDetailsUpdated,
        Trento.Hosts.Events.HostHealthChanged,
        Trento.Hosts.Events.HostDeregistered,
        Trento.Hosts.Events.ProviderUpdated,
        Trento.Hosts.Events.HostSaptuneHealthChanged,
        Trento.Hosts.Events.SoftwareUpdatesHealthChanged,
        Trento.Hosts.Events.SoftwareUpdatesDiscoveryRequested,
        Trento.Hosts.Events.HeartbeatSucceeded,
        Trento.Hosts.Events.HostChecksSelected,
        Trento.Hosts.Events.SlesSubscriptionsUpdated,
        Trento.Hosts.Events.HostChecksHealthChanged,
        Trento.Hosts.Events.HostDeregistrationRequested,
        Trento.Hosts.Events.HostTombstoned,
        Trento.Hosts.Events.HostRegistered,
        Trento.Clusters.Events.ClusterRegistered,
        Trento.Clusters.Events.ClusterRolledUp,
        Trento.Clusters.Events.ClusterTombstoned,
        Trento.Clusters.Events.ClusterRollUpRequested,
        Trento.Clusters.Events.ClusterChecksHealthChanged,
        Trento.Clusters.Events.HostAddedToCluster,
        Trento.Clusters.Events.ClusterDeregistered,
        Trento.Clusters.Events.ClusterHealthChanged,
        Trento.Clusters.Events.ClusterRestored,
        Trento.Clusters.Events.ClusterDiscoveredHealthChanged,
        Trento.Clusters.Events.HostRemovedFromCluster,
        Trento.Clusters.Events.ChecksSelected,
        Trento.Clusters.Events.ClusterDetailsUpdated,
        Trento.Databases.Events.DatabaseDeregistered,
        Trento.Databases.Events.DatabaseTombstoned,
        Trento.Databases.Events.DatabaseRollUpRequested,
        Trento.Databases.Events.DatabaseRolledUp,
        Trento.Databases.Events.DatabaseInstanceSystemReplicationChanged,
        Trento.Databases.Events.DatabaseInstanceMarkedAbsent,
        Trento.Databases.Events.DatabaseInstanceHealthChanged,
        Trento.Databases.Events.DatabaseInstanceMarkedPresent,
        Trento.Databases.Events.DatabaseInstanceDeregistered,
        Trento.Databases.Events.DatabaseTenantsUpdated,
        Trento.Databases.Events.DatabaseRestored,
        Trento.Databases.Events.DatabaseRegistered,
        Trento.Databases.Events.DatabaseInstanceRegistered,
        Trento.Databases.Events.DatabaseHealthChanged,
        Trento.SapSystems.Events.ApplicationInstanceMarkedAbsent,
        Trento.SapSystems.Events.SapSystemHealthChanged,
        Trento.SapSystems.Events.SapSystemTombstoned,
        Trento.SapSystems.Events.SapSystemDatabaseHealthChanged,
        Trento.SapSystems.Events.SapSystemRolledUp,
        Trento.SapSystems.Events.ApplicationInstanceDeregistered,
        Trento.SapSystems.Events.SapSystemRegistered,
        Trento.SapSystems.Events.ApplicationInstanceMarkedPresent,
        Trento.SapSystems.Events.SapSystemRestored,
        Trento.SapSystems.Events.SapSystemDeregistered,
        Trento.SapSystems.Events.ApplicationInstanceHealthChanged,
        Trento.SapSystems.Events.SapSystemRollUpRequested,
        Trento.SapSystems.Events.SapSystemUpdated,
        Trento.SapSystems.Events.ApplicationInstanceMoved,
        Trento.SapSystems.Events.ApplicationInstanceRegistered
      ]

      events_activities_catalog = ActivityCatalog.domain_event_activities()

      assert length(domain_events) <= length(events_activities_catalog)

      for event_module <- domain_events do
        assert event_module in events_activities_catalog
      end
    end
  end

  describe "activity detection" do
    test "should not detect activity from invalid input" do
      Enum.each([nil, %{}, "", 42], fn input ->
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
        activity: ActivityCatalog.login_attempt(),
        interesting_statuses: [200, 401, 404, 500],
        name: :login_attempt
      },
      %{
        activity: ActivityCatalog.resource_tagging(),
        interesting_statuses: 201,
        not_interesting_statuses: [400, 401, 403, 404, 500],
        name: :resource_tagging
      },
      %{
        activity: ActivityCatalog.resource_untagging(),
        interesting_statuses: 204,
        not_interesting_statuses: [400, 401, 403, 404, 500],
        name: :resource_untagging
      },
      %{
        activity: ActivityCatalog.api_key_generation(),
        interesting_statuses: 200,
        not_interesting_statuses: [400, 401, 403, 404, 500],
        name: :api_key_generation
      },
      %{
        activity: ActivityCatalog.saving_suma_settings(),
        interesting_statuses: 201,
        not_interesting_statuses: [400, 401, 403, 404, 500],
        name: :saving_suma_settings
      },
      %{
        activity: ActivityCatalog.changing_suma_settings(),
        interesting_statuses: 200,
        not_interesting_statuses: [400, 401, 403, 404, 500],
        name: :changing_suma_settings
      },
      %{
        activity: ActivityCatalog.clearing_suma_settings(),
        interesting_statuses: 204,
        not_interesting_statuses: [400, 401, 403, 404, 500],
        name: :clearing_suma_settings
      },
      %{
        activity: ActivityCatalog.user_creation(),
        interesting_statuses: 201,
        not_interesting_statuses: [400, 401, 403, 404, 500],
        name: :user_creation
      },
      %{
        activity: ActivityCatalog.user_modification(),
        interesting_statuses: 200,
        not_interesting_statuses: [400, 401, 403, 404, 500],
        name: :user_modification
      },
      %{
        activity: ActivityCatalog.user_deletion(),
        interesting_statuses: 204,
        not_interesting_statuses: [400, 401, 403, 404, 500],
        name: :user_deletion
      },
      %{
        activity: ActivityCatalog.profile_update(),
        interesting_statuses: 200,
        not_interesting_statuses: [400, 401, 403, 404, 500],
        name: :profile_update
      },
      %{
        activity: ActivityCatalog.cluster_checks_execution_request(),
        interesting_statuses: 202,
        not_interesting_statuses: [400, 401, 403, 404, 500],
        name: :cluster_checks_execution_request
      }
    ]

    for %{name: scenario_name} = scenario <- scenarios do
      @scenario scenario

      test "should detect connection activity for: #{scenario_name}",
           %{
             conn: conn
           } do
        %{
          activity: activity,
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
                   |> populate_conn.(activity, status)
                   |> ActivityCatalog.detect_activity()
        end)

        Map.get(@scenario, :not_interesting_statuses, [])
        |> List.wrap()
        |> Enum.each(fn status ->
          assert {:error, :not_interesting} ==
                   conn
                   |> populate_conn.(activity, status)
                   |> ActivityCatalog.detect_activity()
        end)
      end
    end

    test "should detect activity from domain events" do
      events = [
        build(:heartbeat_succeded),
        build(:heartbeat_failed),
        build(:host_registered_event),
        build(:host_checks_health_changed),
        build(:host_checks_selected)
      ]

      for %event_module{} = event <- events do
        assert {:ok, event_module} ==
                 ActivityCatalog.detect_activity(%{event: event, metadata: %{}})
      end
    end
  end

  describe "activity type detection" do
    test "should ignore irrelevant activities" do
      Enum.each([%{bar: "baz"}, "not-interesting", %{}, 42], fn activity ->
        assert nil == ActivityCatalog.get_activity_type(activity)
      end)
    end

    test "should detect activity type for interesting connections" do
      scenarios = [
        {ActivityCatalog.login_attempt(), :login_attempt},
        {ActivityCatalog.resource_tagging(), :resource_tagging},
        {ActivityCatalog.resource_untagging(), :resource_untagging},
        {ActivityCatalog.api_key_generation(), :api_key_generation},
        {ActivityCatalog.saving_suma_settings(), :saving_suma_settings},
        {ActivityCatalog.changing_suma_settings(), :changing_suma_settings},
        {ActivityCatalog.clearing_suma_settings(), :clearing_suma_settings},
        {ActivityCatalog.user_creation(), :user_creation},
        {ActivityCatalog.user_modification(), :user_modification},
        {ActivityCatalog.user_deletion(), :user_deletion},
        {ActivityCatalog.profile_update(), :profile_update},
        {ActivityCatalog.cluster_checks_execution_request(), :cluster_checks_execution_request}
      ]

      for {activity, expected_activity_type} <- scenarios do
        assert expected_activity_type == ActivityCatalog.get_activity_type(activity)
      end
    end

    test "should detect correct activity type" do
      %heartbeat_succeeded_event{} = build(:heartbeat_succeded)
      %heartbeat_failed_event{} = build(:heartbeat_failed)
      %host_registered_event{} = build(:host_registered_event)
      %host_checks_health_changed_event{} = build(:host_checks_health_changed)
      %host_checks_selected_event{} = build(:host_checks_selected)

      %software_updates_discovery_requested_event{} =
        build(:software_updates_discovery_requested_event)

      event_to_activity_type_map = [
        {host_registered_event, :host_registered},
        {heartbeat_succeeded_event, :heartbeat_succeeded},
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
end
