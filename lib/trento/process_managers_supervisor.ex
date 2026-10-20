# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.ProcessManagersSupervisor do
  @moduledoc false

  use Supervisor

  def start_link(init_arg) do
    Supervisor.start_link(__MODULE__, init_arg, name: __MODULE__)
  end

  @impl true
  def init(_init_arg) do
    children = [
      Trento.Infrastructure.Commanded.ProcessManagers.DeregistrationProcessManager
    ]

    Supervisor.init(children, strategy: :one_for_one)
  end
end
