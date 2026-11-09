# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Infrastructure.Jobs.SoftwareUpdatesDiscoveryJob do
  @moduledoc """
  Discovers the available software updates of the registered hosts.
  """

  use Oban.Worker, max_attempts: 1, unique: [period: :infinity, states: :incomplete]

  @impl Oban.Worker
  def perform(%Oban.Job{}) do
    Trento.SoftwareUpdates.run_discovery()

    :ok
  end
end
