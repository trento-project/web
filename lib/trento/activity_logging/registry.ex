defmodule Trento.ActivityLogging.Registry do
  @moduledoc """
  Activity logging registry
  """

  @type logged_activity :: {controller :: module(), action :: atom()}

  @login_attempt {TrentoWeb.SessionController, :create}
  @api_key_generation {TrentoWeb.V1.SettingsController, :update_api_key_settings}
  @saving_suma_settings {TrentoWeb.V1.SUMACredentialsController, :create}
  @changing_suma_settings {TrentoWeb.V1.SUMACredentialsController, :update}
  @clearing_suma_settings {TrentoWeb.V1.SUMACredentialsController, :delete}
  @tagging {TrentoWeb.V1.TagsController, :add_tag}
  @untagging {TrentoWeb.V1.TagsController, :remove_tag}
  @user_creation {TrentoWeb.V1.UsersController, :create}
  @user_modification {TrentoWeb.V1.UsersController, :update}
  @user_deletion {TrentoWeb.V1.UsersController, :delete}
  @profile_update {TrentoWeb.V1.ProfileController, :update}
  # @cluster_checks_selection {TrentoWeb.V1.ClusterController, :select_checks} # <-- this is event sourced
  @cluster_checks_execution_request {TrentoWeb.V1.ClusterController, :request_checks_execution}

  @action_registry %{
    @login_attempt => {:login_attempt, :any},
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
    @cluster_checks_execution_request => {:cluster_checks_selection, 202}
  }

  Enum.each(@action_registry, fn {action, {action_type, _}} ->
    defmacro unquote(action_type)(), do: unquote(action)
  end)

  def interested?(activity, %Plug.Conn{status: status}),
    do:
      Map.has_key?(@action_registry, activity) &&
        @action_registry
        |> Map.fetch!(activity)
        |> interesting_status?(status)

  def interested?(_, _), do: false

  @spec get_activity_type(logged_activity()) :: atom()
  def get_activity_type(activity) do
    @action_registry
    |> Map.fetch!(activity)
    |> elem(0)
  end

  @spec interesting_status?(
          request_activity :: {activity_type :: atom(), relevant_status :: integer() | :any},
          detected_status :: integer()
        ) ::
          boolean()
  defp interesting_status?({_, :any}, _), do: true
  defp interesting_status?({_, status}, status), do: true
  defp interesting_status?(_, _), do: false
end
