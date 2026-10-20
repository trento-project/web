# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.SapSystems.Enums.EnsaVersion do
  @moduledoc """
  Type that represents the supported ENSA versions.
  """

  use Trento.Support.Enum, values: [:no_ensa, :ensa1, :ensa2]
end
