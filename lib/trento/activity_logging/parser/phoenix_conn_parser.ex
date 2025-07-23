defmodule Trento.ActivityLog.Logger.Parser.PhoenixConnParser do
  @moduledoc """
  Phoenix connection activity parser
  """

  alias Trento.ActivityLog.Correlations
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
        action,
        %Plug.Conn{
          assigns: %{
            correlation_id: correlation_id
          },
          path_params: path_params
        } = _conn
      )
      when action in [
             :host_cleanup_requested,
             :sap_system_cleanup_requested,
             :database_cleanup_requested
           ] do
    key =
      case action do
        :host_cleanup_requested -> :host_id
        _ -> :sap_system_id
      end

    %{
      correlation_id: correlation_id
    }
    |> Map.merge(path_params)
    |> Map.put(key, path_params["id"])
    |> Map.delete("id")
    |> Map.new(fn
      {key, value} when is_binary(key) -> {String.to_existing_atom(key), value}
      {key, value} -> {key, value}
    end)
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
        :api_key_generation = _action,
        %Plug.Conn{
          body_params: request_body
        }
      ) do
    maybe_correlation_id = Correlations.get_correlation_id("api_key")
    Map.merge(%{correlation_id: maybe_correlation_id}, request_body)
  end

  def get_activity_metadata(
        :activity_log_settings_update = _action,
        %Plug.Conn{
          body_params: request_body
        }
      ) do
    request_body
  end

  def get_activity_metadata(
        action,
        %Plug.Conn{
          body_params: request_body,
          assigns: %{
            correlation_id: correlation_id
          }
        }
      )
      when action in [
             :saving_suma_settings,
             :changing_suma_settings
           ] do
    request_body
    |> redact(:password)
    |> redact(:ca_cert)
    |> Map.put(:correlation_id, correlation_id)
  end

  def get_activity_metadata(
        action,
        %Plug.Conn{
          body_params: request_body
        }
      )
      when action in [
             :saving_alerting_settings,
             :changing_alerting_setting
           ] do
    redact(request_body, :smtp_password)
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
        } = conn
      )
      when activity in [
             :application_instance_operation_requested,
             :cluster_operation_requested,
             :host_operation_requested,
             :cluster_host_operation_requested
           ] do
    operation_id = resp_body |> Jason.decode!() |> Map.get("operation_id")

    %{
      correlation_id: operation_id,
      operation: params |> Map.get(:operation) |> String.to_existing_atom(),
      operation_id: operation_id,
      params: body_params
    }
    |> Map.put(get_operation_resource_id_field(activity), Map.get(params, :id))
    |> maybe_add_additional_fields(activity, conn)
  end

  def get_activity_metadata(_, _), do: %{}

  defp redact(request_body, key) do
    case Map.has_key?(request_body, key) && Map.fetch!(request_body, key) != nil do
      true -> Map.update!(request_body, key, fn _ -> "REDACTED" end)
      false -> request_body
    end
  end

  defp get_operation_resource_id_field(:application_instance_operation_requested),
    do: :sap_system_id

  defp get_operation_resource_id_field(activity)
       when activity in [:cluster_operation_requested, :cluster_host_operation_requested],
       do: :cluster_id

  defp get_operation_resource_id_field(:host_operation_requested), do: :host_id

  defp maybe_add_additional_fields(
         metadata,
         :application_instance_operation_requested,
         %Plug.Conn{
           params: %{
             host_id: host_id,
             instance_number: instance_number
           }
         }
       ) do
    metadata
    |> Map.put(:host_id, host_id)
    |> Map.put(:instance_number, instance_number)
  end

  defp maybe_add_additional_fields(
         metadata,
         :cluster_host_operation_requested,
         %Plug.Conn{
           params: %{
             host_id: host_id
           }
         }
       ) do
    Map.put(metadata, :host_id, host_id)
  end

  defp maybe_add_additional_fields(metadata, _, _), do: metadata
end
