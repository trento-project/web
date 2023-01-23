defmodule Trento.Integration.Checks.Wanda do
  @moduledoc """
  Wanda integration adapter
  """

  @behaviour Trento.Integration.Checks.Gen

  alias Trento.Messaging
  alias Trento.Messaging.Mapper

  @impl true
  def request_execution(execution_id, group_id, provider, targets, selected_checks) do
    execution_requested =
      Mapper.to_execution_requested(
        execution_id,
        group_id,
        provider,
        targets,
        selected_checks
      )

    :ok = Messaging.publish("executions", execution_requested)
  end
end
