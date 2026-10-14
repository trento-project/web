# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Infrastructure.Jobs.SoftwareUpdatesDiscoveryJob do
  @moduledoc """
  Discovers the available software updates of the registered hosts.
  """

  use Oban.Worker, max_attempts: 1

  @impl Oban.Worker
  def perform(%Oban.Job{}) do
    case Trento.SoftwareUpdates.run_discovery() do
      :ok -> :ok
      {:error, :settings_not_configured} -> {:cancel, :settings_not_configured}
    end
  end
end
