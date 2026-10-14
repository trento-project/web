# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule TrentoWeb.V1.ChecksScheduleJSON do
  def checks_schedule(%{checks_schedule: schedule}) do
    %{
      interval: schedule.interval,
      effective_interval: schedule.effective_interval,
      last_scheduled_at: schedule.last_scheduled_at,
      exception_windows: Enum.map(schedule.exception_windows, &window/1)
    }
  end

  def exception_window(%{exception_window: window}), do: window(window)

  defp window(%{id: id, starts_at: starts_at, duration: duration}),
    do: %{id: id, starts_at: starts_at, duration: duration}
end
