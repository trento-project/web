defmodule Trento.ActivityLog.ActivityCatalog do
  @moduledoc """
  Activity logging catalog
  """

  alias Phoenix.Controller

  @type activity_type :: atom()
  @type connection_activity :: {controller :: module(), action :: atom()}
  @type domain_event_activity :: event_module :: module()
  @type logged_activity :: connection_activity() | domain_event_activity()

  defp load_domain_events do
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
        |> Enum.filter(fn module_name ->
          module_location =
            module_name.__info__(:compile)
            |> Keyword.get(:source)
            |> Path.split()

          "legacy" not in module_location
        end)
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

  defp load_connection_activities do
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
        {:cluster_checks_execution_request, 202}
    }
  end

  def supported_activities, do: Enum.map(activity_catalog(), &to_activity_type/1)

  @spec connection_activities() :: [activity_type()]
  def connection_activities, do: Enum.map(load_connection_activities(), &to_activity_type/1)

  @spec domain_event_activities() :: [activity_type()]
  def domain_event_activities, do: Enum.map(load_domain_events(), &to_activity_type/1)

  defp activity_catalog, do: Map.merge(load_connection_activities(), load_domain_events())

  @spec detect_activity_category(activity_type()) ::
          :connection_activity | :domain_event_activity | :unsupported_activity
  def detect_activity_category(activity) do
    is_connection_activity? = activity in connection_activities()
    is_domain_event_activity? = activity in domain_event_activities()

    case {is_connection_activity?, is_domain_event_activity?} do
      {true, false} ->
        :connection_activity

      {false, true} ->
        :domain_event_activity

      _ ->
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
end
