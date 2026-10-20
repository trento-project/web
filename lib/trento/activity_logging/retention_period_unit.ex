# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.ActivityLog.RetentionPeriodUnit do
  @moduledoc """
  Type that represents the possible retention period units.
  """

  use Trento.Support.Enum, values: [:day, :week, :month, :year]
end
