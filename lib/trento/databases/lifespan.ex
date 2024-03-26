defmodule Trento.Databases.Lifespan do
  @moduledoc """
  Database aggregate lifespan.

  It controls the lifespan of the aggregate GenServer representing a database.
  """

  @behaviour Commanded.Aggregates.AggregateLifespan

  alias Commanded.Aggregates.DefaultLifespan

  alias Trento.Databases.Events.DatabaseRollUpRequested

  @doc """
  The Database aggregate will be stopped after a DatabaseRollUpRequested event is received.
  This is needed to reset the aggregate version, so the aggregate can start appending events to the new stream.
  """
  def after_event(%DatabaseRollUpRequested{}), do: :stop

  def after_event(event), do: DefaultLifespan.after_event(event)

  def after_command(command), do: DefaultLifespan.after_command(command)

  @doc """
   If the aggregate is rolling up, it will be stopped to avoid processing any other event.
  """
  def after_error(:database_rolling_up), do: :stop
  def after_error(error), do: DefaultLifespan.after_error(error)
end
