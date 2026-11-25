# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Services.HealthService do
  @moduledoc """
  This module contains the domain logic for health computation and status conversions.
  """

  require Trento.Enums.Health, as: Health
  require Trento.SapSystems.Enums.Status, as: Status

  @spec compute_aggregated_health([Health.t()]) :: Health.t()
  def compute_aggregated_health([]), do: :unknown

  def compute_aggregated_health(healths) do
    healths
    |> Enum.map(&{&1, health_weight(&1)})
    |> Enum.max_by(fn {_, weight} -> weight end)
    |> elem(0)
  end

  @spec compute_instances_health([%{status: Status.t()}]) :: Health.t()
  def compute_instances_health([]), do: Health.unknown()

  def compute_instances_health(instances) when is_list(instances) do
    instances
    |> Enum.map(fn %{status: status} -> derive_health_from_status(status) end)
    |> compute_aggregated_health()
  end

  @spec derive_health_from_status(Status.t()) :: Health.t()
  def derive_health_from_status(Status.green()), do: Health.passing()
  def derive_health_from_status(Status.yellow()), do: Health.warning()
  def derive_health_from_status(Status.red()), do: Health.critical()
  def derive_health_from_status(Status.gray()), do: Health.unknown()

  defp health_weight(:unknown), do: 3
  defp health_weight(:critical), do: 2
  defp health_weight(:warning), do: 1
  defp health_weight(:passing), do: 0
end
