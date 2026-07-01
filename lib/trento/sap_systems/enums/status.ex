# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.SapSystems.Enums.Status do
  @moduledoc """
  Type that represents SAP and HANA instances status.
  """

  use Trento.Support.Enum, values: [:green, :yellow, :red, :gray]
end
