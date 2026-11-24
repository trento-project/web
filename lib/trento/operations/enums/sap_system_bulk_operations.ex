# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Operations.Enums.SapSystemBulkOperations do
  @moduledoc """
  SAP system operations that can be requested on multiple SAP systems at once
  """
  use Trento.Support.Enum, values: [:sap_system_start, :sap_system_stop]
end
