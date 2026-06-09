# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.SapSystems.Services.HealthService do
  @moduledoc """
  Provides SAP system/Database instances health related functions.

  Some of the functions are used to handle old SAP/Database instances "health" field,
  now renamed and updated to "status" field.
  """

  require Trento.Enums.Health, as: Health
  require Trento.SapSystems.Enums.Status, as: Status

  @spec derive_health_from_status(Status.t()) :: Health.t()
  def derive_health_from_status(Status.green()), do: Health.passing()
  def derive_health_from_status(Status.yellow()), do: Health.warning()
  def derive_health_from_status(Status.red()), do: Health.critical()
  def derive_health_from_status(Status.gray()), do: Health.unknown()

  # Legacy "health" field handling functions

  @doc """
  Upcasts legacy instance health adding new status.
  To be used in events upcast function.
  """
  @spec upcast_health_to_status(map()) :: map()
  def upcast_health_to_status(%{"health" => health} = instance),
    do:
      instance
      |> Map.put("status", health_to_status(health))
      |> Map.delete("health")

  def upcast_health_to_status(instance), do: instance

  @spec add_deprecated_health(map()) :: map()
  def add_deprecated_health(%{status: Status.green()} = instance),
    do: Map.put(instance, :health, Health.passing())

  def add_deprecated_health(%{status: Status.yellow()} = instance),
    do: Map.put(instance, :health, Health.warning())

  def add_deprecated_health(%{status: Status.red()} = instance),
    do: Map.put(instance, :health, Health.critical())

  def add_deprecated_health(%{status: Status.gray()} = instance),
    do: Map.put(instance, :health, Health.unknown())

  defp health_to_status("passing"), do: Status.green()
  defp health_to_status("warning"), do: Status.yellow()
  defp health_to_status("critical"), do: Status.red()
  defp health_to_status("unknown"), do: Status.gray()
end
