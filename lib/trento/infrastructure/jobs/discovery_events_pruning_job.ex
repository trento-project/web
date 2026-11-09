# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Infrastructure.Jobs.DiscoveryEventsPruningJob do
  @moduledoc """
  Deletes the discovery events older than `older_than` days.
  """

  use Trento.Infrastructure.Jobs.Worker,
    call: {Trento.Discovery, :prune_discovery_events},
    args: ["older_than"]
end
