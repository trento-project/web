# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

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
    SapSystemDatabaseStaleAtEventHandler,
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
      SapSystemDatabaseStaleAtEventHandler,
      SaptuneStatusUpdateEventHandler
    ]

    Supervisor.init(children, strategy: :one_for_one)
  end
end
