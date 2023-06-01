defmodule Trento.Domain.SapSystem.Lifespan do
  @moduledoc """
  SapSystem aggregate lifespan.

  It controls the lifespan of the aggregate GenServer representing a sap system.
  """

  @behaviour Commanded.Aggregates.AggregateLifespan

  alias Commanded.Aggregates.DefaultLifespan

  alias Trento.Domain.Events.{
    SapSystemRollUpRequested
  }

  @doc """
  The SapSystem aggregate will be stopped after a SapSystemRollUpRequested event is received.
  This is needed to reset the aggregate version, so the aggregate can start appending events to the new stream.

  The aggregate will also stop on SapSystemTombstoned event, meaning that the sap system aggregate is deregistered
  and without applications/databases left.
  """
  def after_event(%SapSystemRollUpRequested{}), do: :stop

  def after_event(event), do: DefaultLifespan.after_event(event)

  def after_command(command), do: DefaultLifespan.after_command(command)

  @doc """
   If the aggregate is rolling up, it will be stopped to avoid processing any other event.
  """
  def after_error(:sap_system_rolling_up), do: :stop
  def after_error(error), do: DefaultLifespan.after_error(error)
end
