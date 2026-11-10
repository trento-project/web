# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Checks.Enums.FrequencyUnit do
  @moduledoc """
  Type that represents the units of the checks frequency.
  """

  use Trento.Support.Enum, values: [:minute, :hour, :week]
end
