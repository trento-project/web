defmodule Trento.ActivityLog.Logger.Parser.QueueEventParser do
  @moduledoc """
  Queue event activity parser
  """

  alias Trento.Operations.V1.OperationCompleted

  alias Trento.Infrastructure.Operations

  alias Trento.ActivityLog

  def get_activity_actor(:operation_completed, %OperationCompleted{operation_id: operation_id}) do
    case ActivityLog.list_activity_log(%{type: "operation_requested", search: operation_id}) do
      {:ok, [%{actor: actor}], _meta} -> actor
      _ -> "system"
    end
  end

  def get_activity_actor(_, _), do: nil

  def get_activity_metadata(
        :operation_completed,
        %OperationCompleted{
          operation_id: operation_id,
          group_id: group_id,
          operation_type: operation_type,
          result: result
        }
      ) do
    %{
      resource_id: group_id,
      operation: Operations.map_operation_type(operation_type),
      operation_id: operation_id,
      result: result
    }
  end

  def get_activity_metadata(_, _), do: %{}
end
