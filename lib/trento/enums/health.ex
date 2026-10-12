# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Enums.Health do
  @moduledoc """
  Type that represents the possible health values in the system.
  """

  use Trento.Support.Enum, values: [:passing, :warning, :critical, :unknown]
end
