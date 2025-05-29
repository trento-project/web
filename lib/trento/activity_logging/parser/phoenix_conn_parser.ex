defmodule Trento.ActivityLog.Logger.Parser.PhoenixConnParser do
  @moduledoc """
  Phoenix connection activity parser
  """

  alias Trento.Users.User

  def get_activity_actor(:login_attempt, %Plug.Conn{body_params: request_payload}),
    do: Map.get(request_payload, "username", "no_username")

  def get_activity_actor(_, %Plug.Conn{} = conn) do
    case Pow.Plug.current_user(conn) do
      %User{username: username} -> username
      _ -> "system"
    end
  end

  def get_activity_metadata(
        :login_attempt = action,
        %Plug.Conn{
          assigns: %{
            reason: reason
          },
          status: 401
        } = conn
      ) do
    %{
      username: get_activity_actor(action, conn),
      reason: reason
    }
  end

  def get_activity_metadata(
        :resource_tagging,
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

  def get_activity_metadata(
        :resource_untagging,
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

  def get_activity_metadata(
        activity,
        %Plug.Conn{
          body_params: request_body
        }
      )
      when activity in [:api_key_generation, :activity_log_settings_update] do
    request_body
  end

  def get_activity_metadata(
        action,
        %Plug.Conn{
          body_params: request_body
        }
      )
      when action in [
             :saving_suma_settings,
             :changing_suma_setting
           ] do
    request_body
    |> redact(:password)
    |> redact(:ca_cert)
  end

  def get_activity_metadata(
        action,
        %Plug.Conn{
          body_params: request_body
        }
      )
      when action in [
             :user_creation,
             :user_modification,
             :profile_update
           ] do
    request_body
    |> redact(:password)
    |> redact(:current_password)
    |> redact(:password_confirmation)
  end

  def get_activity_metadata(
        activity,
        %Plug.Conn{
          params: params,
          body_params: request_body
        }
      )
      when activity in [:cluster_checks_selected, :cluster_checks_execution_request],
      do: Map.merge(request_body, %{cluster_id: Map.get(params, :cluster_id)})

  def get_activity_metadata(
        activity,
        %Plug.Conn{
          params: params,
          body_params: request_body
        }
      )
      when activity in [:host_checks_selected, :host_checks_execution_request],
      do: Map.merge(request_body, %{host_id: Map.get(params, :id)})

  def get_activity_metadata(:user_deletion, %Plug.Conn{
        params: params
      }),
      do: %{user_id: Map.get(params, :id)}

  def get_activity_metadata(
        activity,
        %Plug.Conn{
          params: params,
          body_params: body_params,
          resp_body: resp_body
        }
      )
      when activity in [:cluster_operation_requested, :host_operation_requested] do
    %{
      resource_id: Map.get(params, :id),
      operation: params |> Map.get(:operation) |> String.to_existing_atom(),
      operation_id: resp_body |> Jason.decode!() |> Map.get("operation_id"),
      params: body_params
    }
  end

  def get_activity_metadata(_, _), do: %{}

  defp redact(request_body, key) do
    case Map.has_key?(request_body, key) && Map.fetch!(request_body, key) != nil do
      true -> Map.update!(request_body, key, fn _ -> "REDACTED" end)
      false -> request_body
    end
  end
end
