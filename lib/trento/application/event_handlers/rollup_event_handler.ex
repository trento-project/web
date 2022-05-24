defmodule Trento.RollupEventHandler do
  @moduledoc """
  This event handler is responsible for rolling up aggregates.
  """

  use Commanded.Event.Handler,
    application: Trento.Commanded,
    name: "roll_up_event_handler",
    consistency: :strong

  alias Trento.Rollup

  alias Trento.Domain.Events.ClusterRolledUp

  def handle(
        %ClusterRolledUp{cluster_id: cluster_id, applied: false} = event,
        _
      ) do
    Rollup.rollup_aggregate(cluster_id, event)
  end
end
