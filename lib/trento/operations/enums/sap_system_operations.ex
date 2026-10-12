# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Operations.Enums.SapSystemOperations do
  @moduledoc """
  SAP system operations
  """
  use Trento.Support.Enum, values: [:sap_system_start, :sap_system_stop]
end
