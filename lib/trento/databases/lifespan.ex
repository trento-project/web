defmodule Trento.Databases.Lifespan do
  @moduledoc """
  Database aggregate lifespan.

  It controls the lifespan of the aggregate GenServer representing a database.
  """

  @behaviour Commanded.Aggregates.AggregateLifespan

  alias Commanded.Aggregates.DefaultLifespan

  def after_event(event), do: DefaultLifespan.after_event(event)

  def after_command(command), do: DefaultLifespan.after_command(command)

  def after_error(error), do: DefaultLifespan.after_error(error)
end
