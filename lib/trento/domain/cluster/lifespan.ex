defmodule Trento.Domain.Cluster.Lifespan do
  @moduledoc """
  Cluster aggregate lifespan.

  It controls the lifespan of the aggregate GenServer representing a cluster.
  """

  @behaviour Commanded.Aggregates.AggregateLifespan

  alias Commanded.Aggregates.DefaultLifespan

  alias Trento.Domain.Events.ClusterRollUpRequested

  @doc """
  The cluster aggregate will be stopped after a ClusterRollUpRequested event is received.
  This is needed to reset the aggregate version, so the aggregate can start appending events to the new stream.
  """
  def after_event(%ClusterRollUpRequested{}), do: :stop
  def after_event(event), do: DefaultLifespan.after_event(event)

  def after_command(command), do: DefaultLifespan.after_command(command)

  @doc """
   If the aggregate is rolling up, it will be stopped to avoid processing any other event.
  """
  def after_error({:error, :cluster_rolling_up}), do: :stop
  def after_error(error), do: DefaultLifespan.after_error(error)
end
