defmodule Trento.EventHandlersSupervisor do
  @moduledoc false

  use Supervisor

  alias Trento.Infrastructure.Commanded.EventHandlers.{
    ActivityLogEventHandler,
    AlertsEventHandler,
    DatabaseDeregistrationEventHandler,
    DatabaseRestoreEventHandler,
    RollUpEventHandler,
    SapSystemDatabaseHealthEventHandler,
    SaptuneStatusUpdateEventHandler,
    SoftwareUpdatesDiscoveryEventHandler,
    StreamRollUpEventHandler
  }

  def start_link(init_arg) do
    Supervisor.start_link(__MODULE__, init_arg, name: __MODULE__)
  end

  @impl true
  def init(_init_arg) do
    children = [
      ActivityLogEventHandler,
      AlertsEventHandler,
      RollUpEventHandler,
      StreamRollUpEventHandler,
      SoftwareUpdatesDiscoveryEventHandler,
      DatabaseDeregistrationEventHandler,
      DatabaseRestoreEventHandler,
      SapSystemDatabaseHealthEventHandler,
      SaptuneStatusUpdateEventHandler
    ]

    Supervisor.init(children, strategy: :one_for_one)
  end
end
