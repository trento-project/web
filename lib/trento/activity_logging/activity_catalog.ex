defmodule Trento.ActivityLog.ActivityCatalog do
  @moduledoc """
  Activity logging catalog
  """

  alias Phoenix.Controller

  @login_attempt {TrentoWeb.SessionController, :create}
  @api_key_generation {TrentoWeb.V1.SettingsController, :update_api_key_settings}
  @saving_suma_settings {TrentoWeb.V1.SettingsController, :save_suse_manager_settings}
  @changing_suma_settings {TrentoWeb.V1.SettingsController, :update_suse_manager_settings}
  @clearing_suma_settings {TrentoWeb.V1.SettingsController, :delete_suse_manager_settings}
  @tagging {TrentoWeb.V1.TagsController, :add_tag}
  @untagging {TrentoWeb.V1.TagsController, :remove_tag}
  @user_creation {TrentoWeb.V1.UsersController, :create}
  @user_modification {TrentoWeb.V1.UsersController, :update}
  @user_deletion {TrentoWeb.V1.UsersController, :delete}
  @profile_update {TrentoWeb.V1.ProfileController, :update}
  @cluster_checks_execution_request {TrentoWeb.V1.ClusterController, :request_checks_execution}

  @connection_activities %{
    @login_attempt => {:login_attempt, :always},
    @tagging => {:resource_tagging, 201},
    @untagging => {:resource_untagging, 204},
    @api_key_generation => {:api_key_generation, 200},
    @saving_suma_settings => {:saving_suma_settings, 201},
    @changing_suma_settings => {:changing_suma_settings, 200},
    @clearing_suma_settings => {:clearing_suma_settings, 204},
    @user_creation => {:user_creation, 201},
    @user_modification => {:user_modification, 200},
    @user_deletion => {:user_deletion, 204},
    @profile_update => {:profile_update, 200},
    @cluster_checks_execution_request => {:cluster_checks_execution_request, 202}
  }

  # Make sure trento application is loaded so that we can safely access its modules
  Application.ensure_loaded(:trento)

  # The following code extracts the domain event activities from the event modules found in trento application.
  # Event modules are expected to be in the form of `Trento.{ResourceType}.Events.{EventName}`, for instance:
  #   - Trento.Hosts.Events.HostRegistered
  #   - Trento.Clusters.Events.ChecksSelected
  #   - Trento.SapSystems.Events.SapSystemDeregistered
  #   - Trento.Databases.Events.DatabaseHealthChanged
  #
  # For an event to be taken into account, the <ResourceType> in the second position of the module name
  # must be one of the following:
  #   - Hosts
  #   - Clusters
  #   - SapSystems
  #   - Databases
  #
  # Any event module that lives in a directory containing the word `legacy` is ignored.
  # This check is needed to avoid naming clashes with the valid event modules.
  #
  # Once the list of the relevant event modules is extracted, it gets transformed to a map with the following shape:
  # %{
  #   <EventModule>: {<EventActivityType>, <WhenOccurrenceIsInteresting>}
  # }
  #
  # <EventActivityType> is the lowercase and underscored version of the last part of the event module name.
  # <WhenOccurrenceIsInteresting> is anything useful to mark as interesting an activity occurrence.
  # For connection related activities it is the status code that makes the occurrence interesting for logging.
  #
  # Marking <WhenOccurrenceIsInteresting> as `:always` means the occurrence is always interesting for logging.
  # Currently, all events are marked as `:always` interesting for logging.
  #
  # example:
  # %{
  #   Trento.Hosts.Events.HostRegistered: {:host_registered, :always},
  #   Trento.Clusters.Events.ChecksSelected: {:checks_selected, :always},
  #   Trento.SapSystems.Events.SapSystemDeregistered: {:sap_system_deregistered, :always},
  #   Trento.Databases.Events.DatabaseHealthChanged: {:database_health_changed, :always},
  #   ...
  # }
  #
  # Note that this is the same shape as the @connection_activities map.

  quote do
    unquote(
      @domain_event_activities (case :application.get_key(:trento, :modules) do
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
                                    %{:unsupported => {:unsupported, :always}}
                                end)
    )
  end

  @doc """
  Merge connection activities and domain event activities into a single catalog
  """
  @activity_catalog Map.merge(@connection_activities, @domain_event_activities)

  @type connection_activity_type ::
          :login_attempt
          | :resource_tagging
          | :resource_untagging
          | :api_key_generation
          | :saving_suma_settings
          | :changing_suma_settings
          | :clearing_suma_settings
          | :user_creation
          | :user_modification
          | :user_deletion
          | :profile_update
          | :cluster_checks_execution_request

  # Define `domain_event_activity_type` based on the discovered domain event modules.
  # The result is a union type of all the domain event activities types as follows:
  #
  # @type domain_event_activity_type ::
  #         :provider_updated
  #         | :host_deregistered
  #         | :database_health_changed
  #         | :cluster_tombstoned
  #         | :cluster_deregistered
  #         | :host_saptune_health_changed
  #         | :host_checks_selected
  #         | :cluster_health_changed
  #         | :cluster_checks_health_changed
  #         | ...
  quote do
    unquote(
      @type domain_event_activity_type ::
              unquote(
                @domain_event_activities
                |> Enum.map(fn {_, {event_activity_type, _}} -> event_activity_type end)
                |> Enum.reduce(&{:|, [], [&1, &2]})
              )
    )
  end

  @type activity_type :: connection_activity_type() | domain_event_activity_type()

  @type connection_activity :: {controller :: module(), action :: atom()}

  # Define `domain_event_activity` type based on the discovered domain event modules.
  # The result is a union type of all the discovered domain event modules as follows:
  #
  # @type domain_event_activity ::
  #         Trento.Hosts.Events.HostDetailsUpdated
  #         | Trento.Clusters.Events.ChecksSelected
  #         | Trento.Databases.Events.DatabaseTenantsUpdated
  #         | Trento.Clusters.Events.HostRemovedFromCluster
  #         | Trento.Hosts.Events.SlesSubscriptionsUpdated
  #         | Trento.SapSystems.Events.ApplicationInstanceMarkedPresent
  #         | Trento.SapSystems.Events.SapSystemRestored
  #         | ...
  quote do
    unquote(
      @type domain_event_activity ::
              event_module ::
              unquote(
                @domain_event_activities
                |> Enum.map(fn {event_module, _} -> event_module end)
                |> Enum.reduce(&{:|, [], [&1, &2]})
              )
    )
  end

  @type logged_activity :: connection_activity() | domain_event_activity()

  Enum.each(@activity_catalog, fn {activity, {activity_type, _}} ->
    @spec unquote(activity_type)() :: logged_activity()
    defmacro unquote(activity_type)(), do: unquote(activity)
  end)

  @spec connection_activities() :: [connection_activity()]
  defmacro connection_activities, do: Map.keys(@connection_activities)

  @spec domain_event_activities() :: [domain_event_activity()]
  defmacro domain_event_activities, do: Map.keys(@domain_event_activities)

  @spec activity_catalog() :: [logged_activity()]
  defmacro activity_catalog, do: Map.keys(@activity_catalog)

  @spec detect_activity(any()) :: {:ok, logged_activity()} | {:error, any()}
  def detect_activity(activity_context) do
    with extracted_activity <- extract_activity(activity_context),
         true <- interested?(extracted_activity, activity_context) do
      {:ok, extracted_activity}
    else
      _ -> {:error, :not_interesting}
    end
  end

  @spec get_activity_type(logged_activity()) :: activity_type() | nil
  def get_activity_type(activity) when activity in activity_catalog() do
    @activity_catalog
    |> Map.fetch!(activity)
    |> elem(0)
  end

  def get_activity_type(_), do: nil

  defp extract_activity(%Plug.Conn{} = conn) do
    {Controller.controller_module(conn), Controller.action_name(conn)}
  rescue
    _ -> nil
  end

  defp extract_activity(%{event: %event_module{}}), do: event_module

  defp extract_activity(_), do: nil

  defp interested?(activity, activity_context) when activity in activity_catalog(),
    do:
      @activity_catalog
      |> Map.fetch!(activity)
      |> interesting_occurrence?(activity_context)

  defp interested?(_, _), do: false

  @spec interesting_occurrence?(
          activity_occurrence :: {activity_type(), relevant_context :: any() | :always},
          activity_context :: any()
        ) :: boolean()
  defp interesting_occurrence?({_, :always}, _), do: true
  defp interesting_occurrence?({_, status}, %Plug.Conn{status: status}), do: true
  defp interesting_occurrence?(_, _), do: false
end
