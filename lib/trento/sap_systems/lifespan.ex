defmodule Trento.SapSystems.Lifespan do
  @moduledoc """
  SapSystem aggregate lifespan.

  It controls the lifespan of the aggregate GenServer representing a sap system.
  """

  @behaviour Commanded.Aggregates.AggregateLifespan

  alias Commanded.Aggregates.DefaultLifespan

  alias Trento.SapSystems.Events.SapSystemRollUpRequested

  @doc """
  The SapSystem aggregate will be stopped after a SapSystemRollUpRequested event is received.
  This is needed to reset the aggregate version, so the aggregate can start appending events to the new stream.
  """
  def after_event(%SapSystemRollUpRequested{}), do: :stop

  def after_event(event), do: DefaultLifespan.after_event(event)

  def after_command(command), do: DefaultLifespan.after_command(command)

  @doc """
   If the aggregate is rolling up, it will be stopped to avoid processing any other event.
  """
  def after_error(:sap_system_rolling_up), do: :stop
  def after_error(:legacy_sap_system), do: :stop
  def after_error(error), do: DefaultLifespan.after_error(error)
end
