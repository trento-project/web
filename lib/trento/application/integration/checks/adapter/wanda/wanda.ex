defmodule Trento.Integration.Checks.Wanda do
  @moduledoc """
  Wanda integration adapter
  """

  @behaviour Trento.Integration.Checks.Gen

  alias Trento.Messaging
  alias Trento.Messaging.Mapper

  alias Trento.Integration.Checks.{
    FlatCatalogDto,
    FlatCheckDto
  }

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

  @impl true
  def get_catalog do
    {:ok,
     %FlatCatalogDto{
       checks: [
         %FlatCheckDto{
           description: "description 1",
           group: "Group 1",
           id: "156F64",
           implementation: "implementation 1",
           labels: "labels",
           name: "test 1",
           provider: :azure,
           remediation: "remediation 1",
           premium: true
         }
       ]
     }}
  end
end
