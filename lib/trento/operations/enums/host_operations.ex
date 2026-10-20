# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Operations.Enums.HostOperations do
  @moduledoc """
  Host operations
  """
  use Trento.Support.Enum,
    values: [:saptune_solution_apply, :saptune_solution_change, :reboot]
end
