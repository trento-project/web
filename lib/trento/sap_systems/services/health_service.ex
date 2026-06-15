# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.SapSystems.Services.HealthService do
  @moduledoc """
  Provides SAP system/Database instances health related functions.
  """

  require Trento.Enums.Health, as: Health
  require Trento.SapSystems.Enums.Status, as: Status

  @spec derive_health_from_status(Status.t()) :: Health.t()
  def derive_health_from_status(Status.green()), do: Health.passing()
  def derive_health_from_status(Status.yellow()), do: Health.warning()
  def derive_health_from_status(Status.red()), do: Health.critical()
  def derive_health_from_status(Status.gray()), do: Health.unknown()

  @spec add_deprecated_health(map()) :: map()
  def add_deprecated_health(%{status: Status.green()} = instance),
    do: Map.put(instance, :health, Health.passing())

  def add_deprecated_health(%{status: Status.yellow()} = instance),
    do: Map.put(instance, :health, Health.warning())

  def add_deprecated_health(%{status: Status.red()} = instance),
    do: Map.put(instance, :health, Health.critical())

  def add_deprecated_health(%{status: Status.gray()} = instance),
    do: Map.put(instance, :health, Health.unknown())
end
