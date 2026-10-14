# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.ChecksScheduling.Interval do
  @moduledoc """
  Checks execution intervals, in minutes, that a user can select.

  5, 15 and 30 minutes, 1, 6, 12 and 24 hours, 1, 2 and 4 weeks.
  """

  import Ecto.Changeset

  @default 5
  @values [5, 15, 30, 60, 360, 720, 1440, 10_080, 20_160, 40_320]

  @spec default() :: pos_integer()
  def default, do: @default

  @spec values() :: [pos_integer()]
  def values, do: @values

  @spec validate(Ecto.Changeset.t(), atom()) :: Ecto.Changeset.t()
  def validate(changeset, field),
    do: validate_inclusion(changeset, field, @values, message: "is not an allowed interval")
end
