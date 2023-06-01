defmodule Trento.Domain.Host.Lifespan do
  @moduledoc """
  Host aggregate lifespan.

  It controls the lifespan of the aggregate GenServer representing a host.
  """

  @behaviour Commanded.Aggregates.AggregateLifespan

  alias Commanded.Aggregates.DefaultLifespan

  alias Trento.Domain.Events.{
    HostRollUpRequested
  }

  @doc """
  The host aggregate will be stopped after a HostRollUpRequested event is received.
  This is needed to reset the aggregate version, so the aggregate can start appending events to the new stream.

  The host aggregate will be stopped after a HostTombstoned event is received.
  The host is decommissioned and can be safely stopped.
  """
  def after_event(%HostRollUpRequested{}), do: :stop
  def after_event(event), do: DefaultLifespan.after_event(event)

  def after_command(command), do: DefaultLifespan.after_command(command)

  @doc """
   If the aggregate is rolling up, it will be stopped to avoid processing any other event.
  """
  def after_error(:host_rolling_up), do: :stop
  def after_error(error), do: DefaultLifespan.after_error(error)
end
