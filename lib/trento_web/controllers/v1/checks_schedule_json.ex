# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule TrentoWeb.V1.ChecksScheduleJSON do
  def checks_schedule(%{
        schedule: %{
          enabled: enabled,
          frequency: frequency,
          global: global,
          next_execution_at: next_execution_at
        }
      }),
      do: %{
        enabled: enabled,
        frequency: frequency(frequency),
        global: global,
        next_execution_at: next_execution_at
      }

  def checks_frequency_updated(%{
        id: target_id,
        schedule: %{enabled: enabled, frequency: frequency, global: global}
      }),
      do: %{id: target_id, enabled: enabled, frequency: frequency(frequency), global: global}

  defp frequency(nil), do: nil
  defp frequency(frequency), do: Map.take(frequency, [:value, :unit])
end
