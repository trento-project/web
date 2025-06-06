defmodule Trento.ActivityLog.ActivityCatalog do
  @moduledoc """
  Activity logging catalog
  """

  alias Phoenix.Controller

  alias Trento.Checks.V1.{
    CheckCustomizationApplied,
    CheckCustomizationReset
  }

  alias Trento.Operations.V1.OperationCompleted

  @excluded_events [
    Trento.Hosts.Events.HostChecksSelected,
    Trento.Clusters.Events.ChecksSelected
  ]

  @type activity_type :: atom()
  @type connection_activity :: {controller :: module(), action :: atom()}
  @type domain_event_activity :: event_module :: module()
  @type queue_event_activity :: event_module :: module()
  @type logged_activity ::
          connection_activity() | domain_event_activity() | queue_event_activity()

  @spec supported_activities() :: [activity_type()]
  def supported_activities, do: Enum.map(activity_catalog(), &to_activity_type/1)

  @spec connection_activities() :: [activity_type()]
  def connection_activities, do: Enum.map(get_connection_activities(), &to_activity_type/1)

  @spec domain_event_activities() :: [activity_type()]
  def domain_event_activities, do: Enum.map(get_domain_events_activities(), &to_activity_type/1)

  @spec queue_event_activities() :: [activity_type()]
  def queue_event_activities, do: Enum.map(get_queue_events_activities(), &to_activity_type/1)

  @spec detect_activity_category(activity_type()) ::
          :connection_activity
          | :domain_event_activity
          | :queue_event_activity
          | :unsupported_activity
  def detect_activity_category(activity) do
    cond do
      activity in connection_activities() ->
        :connection_activity

      activity in domain_event_activities() ->
        :domain_event_activity

      activity in queue_event_activities() ->
        :queue_event_activity

      true ->
        :unsupported_activity
    end
  end

  @spec detect_activity(any()) :: {:ok, activity_type()} | {:error, :not_interesting}
  def detect_activity(activity_context) do
    with extracted_activity <- extract_activity(activity_context),
         true <- interested?(extracted_activity, activity_context) do
      {:ok, get_activity_type(extracted_activity)}
    else
      _ -> {:error, :not_interesting}
    end
  end

  defp to_activity_type({_, {activity_type, _}}), do: activity_type

  defp activity_catalog do
    get_connection_activities()
    |> Map.merge(get_domain_events_activities())
    |> Map.merge(get_queue_events_activities())
  end

  @spec get_activity_type(logged_activity()) :: activity_type() | nil
  defp get_activity_type(activity) do
    case Map.fetch(activity_catalog(), activity) do
      {:ok, {activity_type, _}} ->
        activity_type

      _ ->
        nil
    end
  end

  defp extract_activity(%Plug.Conn{} = conn) do
    {Controller.controller_module(conn), Controller.action_name(conn)}
  rescue
    _ -> nil
  end

  defp extract_activity(%{event: %event_module{}}), do: event_module

  defp extract_activity(%{queue_event: %event_module{}}), do: event_module

  defp extract_activity(_), do: nil

  defp interested?(activity, activity_context) do
    case Map.fetch(activity_catalog(), activity) do
      {:ok, activity} ->
        interesting_occurrence?(activity, activity_context)

      _ ->
        false
    end
  end

  @spec interesting_occurrence?(
          activity_occurrence :: {activity_type(), relevant_context :: any() | :always},
          activity_context :: any()
        ) :: boolean()
  defp interesting_occurrence?({_, :always}, _), do: true
  defp interesting_occurrence?({_, status}, %Plug.Conn{status: status}), do: true
  defp interesting_occurrence?(_, _), do: false

  defp get_domain_events_activities do
    case :application.get_key(:trento, :modules) do
      {:ok, modules} ->
        modules
        |> Enum.map(&Module.split/1)
        |> Enum.filter(fn
          ["Trento", resource_type, "Events", _]
          when resource_type in [
                 "Hosts",
                 "Clusters",
                 "SapSystems",
                 "Databases"
               ] ->
            true

          _ ->
            false
        end)
        |> Enum.map(&Module.concat/1)
        |> Enum.reject(&(&1.legacy?() or &1 in @excluded_events))
        |> Map.new(fn event_module ->
          {event_module,
           {event_module
            |> Module.split()
            |> List.last()
            |> Macro.underscore()
            |> String.to_atom(), :always}}
        end)

      _ ->
        %{}
    end
  end

  defp get_connection_activities do
    %{
      {TrentoWeb.SessionController, :create} => {:login_attempt, :always},
      {TrentoWeb.V1.TagsController, :add_tag} => {:resource_tagging, 201},
      {TrentoWeb.V1.TagsController, :remove_tag} => {:resource_untagging, 204},
      {TrentoWeb.V1.SettingsController, :update_api_key_settings} => {:api_key_generation, 200},
      {TrentoWeb.V1.SettingsController, :save_suse_manager_settings} =>
        {:saving_suma_settings, 201},
      {TrentoWeb.V1.SettingsController, :update_suse_manager_settings} =>
        {:changing_suma_settings, 200},
      {TrentoWeb.V1.SettingsController, :delete_suse_manager_settings} =>
        {:clearing_suma_settings, 204},
      {TrentoWeb.V1.UsersController, :create} => {:user_creation, 201},
      {TrentoWeb.V1.UsersController, :update} => {:user_modification, 200},
      {TrentoWeb.V1.UsersController, :delete} => {:user_deletion, 204},
      {TrentoWeb.V1.ProfileController, :update} => {:profile_update, 200},
      {TrentoWeb.V1.ClusterController, :request_checks_execution} =>
        {:cluster_checks_execution_request, 202},
      {TrentoWeb.V1.ClusterController, :select_checks} => {:cluster_checks_selected, 202},
      {TrentoWeb.V1.HostController, :request_checks_execution} =>
        {:host_checks_execution_request, 202},
      {TrentoWeb.V1.HostController, :select_checks} => {:host_checks_selected, 202},
      {TrentoWeb.V1.SettingsController, :update_activity_log_settings} =>
        {:activity_log_settings_update, 200},
      {TrentoWeb.V1.HostController, :request_operation} => {:host_operation_requested, 202},
      {TrentoWeb.V1.ClusterController, :request_operation} => {:cluster_operation_requested, 202},
      {TrentoWeb.V1.SapSystemController, :request_instance_operation} =>
        {:application_instance_operation_requested, 202},
      {TrentoWeb.V1.HostController, :delete} => {:host_cleanup_requested, 204}
    }
  end

  defp get_queue_events_activities do
    %{
      OperationCompleted => {:operation_completed, :always},
      CheckCustomizationApplied => {:check_customization_applied, :always},
      CheckCustomizationReset => {:check_customization_reset, :always}
    }
  end
end
