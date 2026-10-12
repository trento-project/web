# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.SoftwareUpdates.Enums.SoftwareUpdatesHealth do
  @moduledoc """
  Type that represents the possible health values for the software updates discovery process.
  """

  use Trento.Support.Enum, values: [:passing, :warning, :critical, :unknown, :not_set]
end
