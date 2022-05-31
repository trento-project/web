defmodule Trento.RollupEventHandler do
  @moduledoc """
  This event handler is responsible for rolling up aggregates.
  """

  use Commanded.Event.Handler,
    application: Trento.Commanded,
    name: "roll_up_event_handler",
    consistency: :strong

  use Trento.Support.EventHandlerFailureContext,
    after_max_retries_reached: &after_max_retries_reached/3

  alias Trento.Rollup

  alias Trento.Domain.Commands.AbortClusterRollup
  alias Trento.Domain.Events.ClusterRolledUp

  def handle(
        %ClusterRolledUp{cluster_id: cluster_id, applied: false} = event,
        _
      ) do
    Rollup.rollup_aggregate(cluster_id, event)
  end

  defp after_max_retries_reached(%ClusterRolledUp{cluster_id: cluster_id}, _, _) do
    %{cluster_id: cluster_id}
    |> AbortClusterRollup.new!()
    |> Trento.Commanded.dispatch()
  end
end
