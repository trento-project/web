# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.ChecksScheduling.Interval do
  @moduledoc """
  Checks execution intervals a user can choose: 5, 15 and 30 minutes,
  1, 6, 12 and 24 hours, 1, 2 and 4 weeks, or disabled.

  The CHECKS_INTERVAL environment variable used to take a number of minutes.
  Those numbers are still accepted when they match one of the intervals.
  """

  import Ecto.Changeset

  @minutes %{
    "5m" => 5,
    "15m" => 15,
    "30m" => 30,
    "1h" => 60,
    "6h" => 360,
    "12h" => 720,
    "24h" => 1_440,
    "1w" => 10_080,
    "2w" => 20_160,
    "4w" => 40_320,
    "disabled" => nil
  }

  @values ~w(5m 15m 30m 1h 6h 12h 24h 1w 2w 4w disabled)
  @default "5m"

  @type t :: String.t()

  @spec values() :: [t()]
  def values, do: @values

  @spec default() :: t()
  def default, do: @default

  @spec to_minutes(t()) :: pos_integer() | nil
  def to_minutes(interval), do: Map.fetch!(@minutes, interval)

  @spec parse(String.t() | nil) :: {:ok, t()} | :error
  def parse(value) when value in @values, do: {:ok, value}

  def parse(value) when is_binary(value) do
    with {minutes, ""} <- Integer.parse(value),
         {interval, _} <- Enum.find(@minutes, fn {_, m} -> m == minutes end) do
      {:ok, interval}
    else
      _ -> :error
    end
  end

  def parse(_), do: :error

  @spec validate(Ecto.Changeset.t(), atom()) :: Ecto.Changeset.t()
  def validate(changeset, field),
    do: validate_inclusion(changeset, field, @values, message: "is not an allowed interval")
end
