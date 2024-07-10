defmodule Trento.ActivityLog.Logger.Parser.PhoenixConnParser do
  @moduledoc """
  Phoenix connection activity parser
  """

  alias Phoenix.Controller

  alias Trento.Users.User

  require Trento.ActivityLog.ActivityCatalog, as: ActivityCatalog

  @behaviour Trento.ActivityLog.Parser.ActivityParser

  @impl true
  def detect_activity(%Plug.Conn{} = conn) do
    {Controller.controller_module(conn), Controller.action_name(conn)}
  rescue
    _ -> nil
  end

  @impl true
  def get_activity_actor(ActivityCatalog.login_attempt(), %Plug.Conn{body_params: request_payload}),
      do: Map.get(request_payload, "username", "no_username")

  @impl true
  def get_activity_actor(_, %Plug.Conn{} = conn) do
    case Pow.Plug.current_user(conn) do
      %User{username: username} -> username
      _ -> "system"
    end
  end

  @impl true
  def get_activity_metadata(
        ActivityCatalog.login_attempt() = action,
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

  @impl true
  def get_activity_metadata(
        ActivityCatalog.resource_tagging(),
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

  @impl true
  def get_activity_metadata(
        ActivityCatalog.resource_untagging(),
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

  @impl true
  def get_activity_metadata(
        ActivityCatalog.api_key_generation(),
        %Plug.Conn{
          body_params: request_body
        }
      ) do
    request_body
  end

  @impl true
  def get_activity_metadata(
        action,
        %Plug.Conn{
          body_params: request_body
        }
      )
      when action in [
             ActivityCatalog.saving_suma_settings(),
             ActivityCatalog.changing_suma_settings()
           ] do
    request_body
    |> redact(:password)
    |> redact(:ca_cert)
  end

  @impl true
  def get_activity_metadata(
        action,
        %Plug.Conn{
          body_params: request_body
        }
      )
      when action in [
             ActivityCatalog.user_creation(),
             ActivityCatalog.user_modification(),
             ActivityCatalog.profile_update()
           ] do
    request_body
    |> redact(:password)
    |> redact(:current_password)
    |> redact(:password_confirmation)
  end

  @impl true
  def get_activity_metadata(_, _), do: %{}

  defp redact(request_body, key) do
    case Map.has_key?(request_body, key) && Map.fetch!(request_body, key) != nil do
      true -> Map.update!(request_body, key, fn _ -> "REDACTED" end)
      false -> request_body
    end
  end
end
