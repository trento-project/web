defmodule Trento.ActivityLog.Logger.Parser.QueueEventParser do
  @moduledoc """
  Queue event activity parser
  """

  alias Trento.Users
  alias Trento.Users.User

  alias Trento.Hosts

  alias Trento.Checks.V1.{
    CheckCustomizationApplied,
    CheckCustomizationReset
  }

  alias Trento.Operations.V1.{
    OperationCompleted,
    OperationErrorDetails
  }

  alias Trento.Infrastructure.Operations

  alias Trento.ActivityLog

  alias Trento.Support.StructHelper

  def get_activity_actor(
        :operation_completed,
        %{
          queue_event: %OperationCompleted{operation_id: operation_id}
        }
      ) do
    case ActivityLog.list_activity_log(%{type: "operation_requested", search: operation_id}) do
      {:ok, [%{actor: actor}], _meta} -> actor
      _ -> "system"
    end
  end

  def get_activity_actor(activity, %{metadata: %{user_id: user_id}}) when is_integer(user_id) do
    case Users.by_id(user_id) do
      {:ok, %User{} = user} ->
        User.with_polished_username(user).username

      {:error, _} = error ->
        get_activity_actor(activity, error)
    end
  end

  def get_activity_actor(_, _), do: "system"

  def get_activity_metadata(
        :operation_completed,
        %{
          queue_event:
            %OperationCompleted{
              operation_id: operation_id,
              group_id: group_id,
              operation_type: operation_type,
              result: result
            } = event
        }
      ) do
    operation = Operations.map_operation_type(operation_type)

    metadata =
      case ActivityLog.list_activity_log(%{type: "operation_requested", search: operation_id}) do
        {:ok, [%{metadata: request_metadata}], _meta} ->
          request_metadata
          |> StructHelper.to_atomized_map()
          |> Map.put(:operation, operation)
          |> Map.put(:result, result)
          |> Map.put(:correlation_id, operation_id)

        _ ->
          %{
            correlation_id: operation_id,
            resource_id: group_id,
            operation: operation,
            operation_id: operation_id,
            result: result
          }
      end

    maybe_put_error_details(metadata, event)
  end

  def get_activity_metadata(
        :check_customization_applied,
        %{
          queue_event: %CheckCustomizationApplied{
            check_id: check_id,
            group_id: group_id,
            target_type: target_type,
            custom_values: custom_values
          }
        }
      ) do
    %{
      check_id: check_id,
      group_id: group_id,
      target_type: target_type,
      custom_values:
        Enum.map(custom_values, fn %{name: name, value: {_, value}} ->
          %{name: name, value: value}
        end)
    }
  end

  def get_activity_metadata(
        :check_customization_reset,
        %{
          queue_event: %CheckCustomizationReset{
            check_id: check_id,
            group_id: group_id,
            target_type: target_type
          }
        }
      ) do
    %{
      check_id: check_id,
      group_id: group_id,
      target_type: target_type
    }
  end

  def get_activity_metadata(_, _), do: %{}

  defp maybe_put_error_details(metadata, %{
         details:
           {:error_details, %OperationErrorDetails{step: step, target_errors: target_errors}}
       })
       when map_size(target_errors) == 0 do
    Map.put(metadata, :failed_step, step)
  end

  defp maybe_put_error_details(metadata, %{
         details:
           {:error_details, %OperationErrorDetails{step: step, target_errors: target_errors}}
       }) do
    errors =
      Enum.into(target_errors, %{}, fn {host_id, error} ->
        case Hosts.by_id(host_id) do
          {:ok, %{hostname: name}} -> {name, error}
          {:error, :not_found} -> {host_id, error}
        end
      end)

    metadata
    |> Map.put(:failed_step, step)
    |> Map.put(:errors, errors)
  end

  defp maybe_put_error_details(metadata, _), do: metadata
end
