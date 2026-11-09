# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Operations.Enums.HostBulkOperations do
  @moduledoc """
  Host operations that can be requested on multiple hosts at once
  """
  use Trento.Support.Enum, values: [:reboot]
end
