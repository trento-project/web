defmodule Trento.Messaging.Mapper do
  @moduledoc """
  Maps domain structures to integration events.
  """

  alias Trento.Checks.V1.{
    ExecutionRequested,
    Target
  }

  def to_execution_requested(execution_id, group_id, provider, targets, selected_checks) do
    ExecutionRequested.new!(
      execution_id: execution_id,
      group_id: group_id,
      targets:
        Enum.map(targets, fn %{host_id: host_id} ->
          Target.new!(agent_id: host_id, checks: selected_checks)
        end),
      env: %{"provider" => %{kind: {:string_value, Atom.to_string(provider)}}}
    )
  end
end
