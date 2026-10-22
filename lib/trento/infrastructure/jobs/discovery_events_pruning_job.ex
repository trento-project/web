# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Infrastructure.Jobs.DiscoveryEventsPruningJob do
  @moduledoc """
  Deletes the discovery events older than `older_than` days.
  """

  use Oban.Worker, max_attempts: 1

  @impl Oban.Worker
  def perform(%Oban.Job{args: %{"older_than" => older_than}}),
    do: Trento.Discovery.prune_discovery_events(older_than)
end
