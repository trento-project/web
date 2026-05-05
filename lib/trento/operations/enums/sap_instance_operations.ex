# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Operations.Enums.SapInstanceOperations do
  @moduledoc """
  SAP instance operations
  """
  use Trento.Support.Enum, values: [:sap_instance_start, :sap_instance_stop]
end
