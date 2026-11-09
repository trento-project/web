# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Infrastructure.Jobs.SoftwareUpdatesDiscoveryJob do
  @moduledoc """
  Discovers the available software updates of the registered hosts.
  """

  use Trento.Infrastructure.Jobs.Worker, call: {Trento.SoftwareUpdates, :run_discovery}
end
