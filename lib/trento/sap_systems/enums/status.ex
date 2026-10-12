# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.SapSystems.Enums.Status do
  @moduledoc """
  Type that represents SAP and HANA instances status.
  """

  use Trento.Support.Enum, values: [:green, :yellow, :red, :gray]
end
