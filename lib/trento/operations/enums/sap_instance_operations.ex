# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Operations.Enums.SapInstanceOperations do
  @moduledoc """
  SAP instance operations
  """
  use Trento.Support.Enum, values: [:sap_instance_start, :sap_instance_stop]
end
