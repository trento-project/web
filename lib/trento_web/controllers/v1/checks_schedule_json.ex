# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule TrentoWeb.V1.ChecksScheduleJSON do
  @window_fields [
    :id,
    :starts_at,
    :duration,
    :timezone,
    :frequency,
    :interval,
    :weekdays,
    :ends_on
  ]

  def checks_schedule(%{checks_schedule: schedule}) do
    %{
      interval: schedule.interval,
      effective_interval: schedule.effective_interval,
      global_interval: schedule.global_interval,
      last_scheduled_at: schedule.last_scheduled_at,
      in_exception_window: schedule.in_exception_window,
      exception_window: window(schedule.exception_window)
    }
  end

  defp window(nil), do: nil
  defp window(window), do: Map.take(window, @window_fields)
end
