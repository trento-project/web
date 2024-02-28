defmodule Trento.EventHandlersSupervisor do
  @moduledoc false

  use Supervisor

  alias Trento.Infrastructure.Commanded.EventHandlers.{
    AlertsEventHandler,
    RollUpEventHandler,
    StreamRollUpEventHandler,
    SoftwareUpdatesDiscoveryEventHandler
  }

  def start_link(init_arg) do
    Supervisor.start_link(__MODULE__, init_arg, name: __MODULE__)
  end

  @impl true
  def init(_init_arg) do
    children = [
      AlertsEventHandler,
      RollUpEventHandler,
      StreamRollUpEventHandler
    ]

    # children = children ++ [SoftwareUpdatesDiscoveryEventHandler]

    Supervisor.init(children, strategy: :one_for_one)
  end
end
