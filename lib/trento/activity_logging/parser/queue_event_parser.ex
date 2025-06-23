defmodule Trento.ActivityLog.Logger.Parser.QueueEventParser do
  @moduledoc """
  Queue event activity parser
  """

  alias Trento.Users
  alias Trento.Users.User

  alias Trento.Checks.V1.{
    CheckCustomizationApplied,
    CheckCustomizationReset
  }

  alias Trento.Operations.V1.OperationCompleted

  alias Trento.Infrastructure.Operations

  alias Trento.ActivityLog

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
          queue_event: %OperationCompleted{
            operation_id: operation_id,
            group_id: group_id,
            operation_type: operation_type,
            result: result
          }
        }
      ) do
    {:ok, correlation_id} = Cachex.get(:activity_correlations, operation_id)
    _ = Cachex.expire(:activity_correlations, operation_id, :timer.seconds(5))

    %{
      resource_id: group_id,
      operation: Operations.map_operation_type(operation_type),
      operation_id: operation_id,
      result: result,
      correlation_id: correlation_id
    }
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
end
