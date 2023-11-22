defmodule Trento.EventHandlersSupervisor do
  @moduledoc false

  use Supervisor

  def start_link(init_arg) do
    Supervisor.start_link(__MODULE__, init_arg, name: __MODULE__)
  end

  @impl true
  def init(_init_arg) do
    children = [
      Trento.Infrastructure.Commanded.EventHandlers.AlertsEventHandler,
      Trento.Infrastructure.Commanded.EventHandlers.RollUpEventHandler,
      Trento.Infrastructure.Commanded.EventHandlers.StreamRollUpEventHandler
    ]

    Supervisor.init(children, strategy: :one_for_one)
  end
end
