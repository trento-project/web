# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Databases.Events.Upcaster.UpcastHelper do
  @moduledoc """
  Upcasting function helpers.
  """

  require Trento.SapSystems.Enums.Status, as: Status

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

  defp health_to_status("passing"), do: Status.green()
  defp health_to_status("warning"), do: Status.yellow()
  defp health_to_status("critical"), do: Status.red()
  defp health_to_status("unknown"), do: Status.gray()
end
