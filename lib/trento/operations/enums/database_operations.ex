# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Operations.Enums.DatabaseOperations do
  @moduledoc """
  Database operations
  """
  use Trento.Support.Enum, values: [:database_start, :database_stop]
end
