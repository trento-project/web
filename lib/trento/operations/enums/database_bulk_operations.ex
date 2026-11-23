# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Operations.Enums.DatabaseBulkOperations do
  @moduledoc """
  Database operations that can be requested on multiple databases at once
  """
  use Trento.Support.Enum, values: [:database_start, :database_stop]
end
