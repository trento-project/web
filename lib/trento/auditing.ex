defmodule Trento.Auditing do
  @moduledoc """
  Auditing
  """

  require Logger

  alias Phoenix.Controller

  # alias Trento.Domain.Events.HostRegistered

  alias Trento.Auditing.AuditLog
  alias Trento.Repo
  alias Trento.Users.User

  import Ecto.Query

  @login_attempt {TrentoWeb.SessionController, :create}

  @tagging {TrentoWeb.V1.TagsController, :add_tag}
  @untagging {TrentoWeb.V1.TagsController, :remove_tag}

  @api_key_generation {TrentoWeb.V1.SettingsController, :update_api_key_settings}

  @saving_suma_settings {TrentoWeb.V1.SUMACredentialsController, :create}
  @changing_suma_settings {TrentoWeb.V1.SUMACredentialsController, :update}
  @clearing_suma_settings {TrentoWeb.V1.SUMACredentialsController, :delete}

  @user_creation {TrentoWeb.V1.UsersController, :create}
  @user_modification {TrentoWeb.V1.UsersController, :update}
  @user_deletion {TrentoWeb.V1.UsersController, :delete}
  @profile_update {TrentoWeb.V1.ProfileController, :update}

  # @cluster_checks_selection {TrentoWeb.V1.ClusterController, :select_checks} # <-- this is event sourced
  @cluster_checks_execution_request {TrentoWeb.V1.ClusterController, :request_checks_execution}

  # @audited_actions [
  #   @login_attempt,
  #   @tagging,
  #   @untagging,
  #   @api_key_generation,
  #   @saving_suma_settings,
  #   @changing_suma_settings,
  #   @clearing_suma_settings
  # ]

  def audit_request(%Plug.Conn{} = conn) do
    action = detect_action(conn)

    IO.inspect(action, label: "action")

    if audited?(action, conn.status) do
      %AuditLog{}
      |> AuditLog.changeset(%{
        type: audit_type(action),
        actor: extract_actor(action, conn),
        outcome: audit_outcome(action, conn.status),
        metadata: action_metadata(action, conn)
      })
      # |> IO.inspect(label: "audit changeset")
      |> Repo.insert!()
    end
  end

  defp detect_action(%Plug.Conn{} = conn) do
    {Controller.controller_module(conn), Controller.action_name(conn)}
  rescue
    _ -> nil
  end

  defp audited?(@login_attempt, _), do: true
  defp audited?(@tagging, 201), do: true
  defp audited?(@untagging, 204), do: true

  defp audited?(@api_key_generation, 200), do: true

  defp audited?(@saving_suma_settings, 201), do: true
  defp audited?(@changing_suma_settings, 200), do: true
  defp audited?(@clearing_suma_settings, 204), do: true

  defp audited?(@user_creation, 201), do: true
  defp audited?(@user_modification, 200), do: true
  defp audited?(@user_deletion, 204), do: true
  defp audited?(@profile_update, 200), do: true

  defp audited?(@cluster_checks_execution_request, 202), do: true

  defp audited?(_, _), do: false

  defp audit_type(@login_attempt), do: "login_attempt"

  defp audit_type(@tagging), do: "resource_tagging"
  defp audit_type(@untagging), do: "resource_untagging"

  defp audit_type(@api_key_generation), do: "api_key_generation"

  defp audit_type(@saving_suma_settings), do: "saving_suma_settings"
  defp audit_type(@changing_suma_settings), do: "changing_suma_settings"
  defp audit_type(@clearing_suma_settings), do: "clearing_suma_settings"

  defp audit_type(@user_creation), do: "user_creation"
  defp audit_type(@user_modification), do: "user_modification"
  defp audit_type(@user_deletion), do: "user_deletion"
  defp audit_type(@profile_update), do: "profile_update"

  defp audit_type(@cluster_checks_execution_request), do: "cluster_checks_selection"

  defp audit_outcome(@login_attempt, 200), do: "successful"
  defp audit_outcome(@login_attempt, _), do: "failed"

  defp audit_outcome(_, _), do: "operation_completed"

  defp extract_actor(@login_attempt, %Plug.Conn{body_params: request_payload}),
    do: Map.get(request_payload, "username", "no_username")

  defp extract_actor(_, %Plug.Conn{} = conn) do
    case Pow.Plug.current_user(conn) do
      %User{username: username} -> username
      _ -> "system"
    end
  end

  defp action_metadata(
         @login_attempt = action,
         %Plug.Conn{
           assigns: %{
             reason: reason
           },
           status: 401
         } = conn
       ) do
    %{
      username: extract_actor(action, conn),
      reason: reason
    }
  end

  defp action_metadata(
         @tagging,
         %Plug.Conn{
           params: %{id: resource_id},
           assigns: %{
             resource_type: resource_type
           },
           body_params: %{value: added_tag}
         }
       ) do
    %{
      resource_id: resource_id,
      resource_type: resource_type,
      added_tag: added_tag
    }
  end

  defp action_metadata(
         @untagging,
         %Plug.Conn{
           params: %{
             id: resource_id,
             value: removed_tag
           },
           assigns: %{
             resource_type: resource_type
           }
         }
       ) do
    %{
      resource_id: resource_id,
      resource_type: resource_type,
      removed_tag: removed_tag
    }
  end

  defp action_metadata(
         @api_key_generation,
         %Plug.Conn{
           body_params: request_body
         }
       ) do
    request_body
  end

  defp action_metadata(
         action,
         %Plug.Conn{
           body_params: request_body
         }
       )
       when action in [@saving_suma_settings, @changing_suma_settings] do
    request_body
    |> redact(:password)
    |> redact(:ca_cert)
  end

  defp action_metadata(
         action,
         %Plug.Conn{
           body_params: request_body
         }
       )
       when action in [@user_creation, @user_modification, @profile_update] do
    request_body
    |> redact(:password)
    |> redact(:current_password)
    |> redact(:password_confirmation)
  end

  defp redact(request_body, key) do
    case Map.has_key?(request_body, key) && Map.fetch!(request_body, key) != nil do
      true -> Map.update!(request_body, key, fn _ -> "REDACTED" end)
      false -> request_body
    end
  end

  defp action_metadata(_, conn) do
    IO.inspect(conn, label: "connz")
    %{}
  end
end
