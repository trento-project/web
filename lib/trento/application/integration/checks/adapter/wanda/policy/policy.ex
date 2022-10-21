defmodule Trento.Integration.Checks.Wanda.Policy do
  @moduledoc """
  Wanda event policies
  """

  @behaviour Trento.Integration.Checks.Wanda.Behaviour

  alias Trento.Checks.V1.ExecutionCompleted
  alias Trento.Domain.Commands.CompleteChecksExecutionWanda

  def handle(%ExecutionCompleted{
        execution_id: execution_id,
        group_id: group_id,
        result: result
      }) do
    case CompleteChecksExecutionWanda.new(%{
           cluster_id: group_id,
           health: map_health(result)
         }) do
      {:ok, command} ->
        opts = [correlation_id: execution_id]
        {:ok, command, opts}

      error ->
        error
    end
  end

  defp map_health(:CRITICAL), do: :critical
  defp map_health(:WARNING), do: :warning
  defp map_health(:PASSING), do: :passing
end
