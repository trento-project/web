# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Operations.Enums.DatabaseOperations do
  @moduledoc """
  Database operations
  """
  use Trento.Support.Enum, values: [:database_start, :database_stop]
end
