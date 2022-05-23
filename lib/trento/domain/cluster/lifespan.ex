defmodule Trento.Domain.Cluster.Lifespan do
  @moduledoc false

  @behaviour Commanded.Aggregates.AggregateLifespan

  alias Trento.Domain.Events.ClusterRolledUp

  def after_event(%ClusterRolledUp{applied: false}), do: :stop
  def after_event(_), do: :infinity

  def after_command(_), do: :infinity

  def after_error(_), do: :stop
end
