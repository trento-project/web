# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Infrastructure.Jobs do
  @moduledoc """
  Periodic jobs run by Oban cron.

  Each job runs once per schedule and ignores the result of the function it calls, so a
  failure waits for the next run. Only raised exceptions are logged, see `attach_logger/0`.

  The jobs are configured by name in the `:crontab` of this module, so an environment can
  change one schedule without repeating the others:

      config :trento, Trento.Infrastructure.Jobs,
        crontab: [
          discovery_events_pruning: [schedule: "0 3 * * *"]
        ]

  Schedules use the crontab syntax of Linux cron, see crontab(5), converted to what Oban
  cron accepts. The only difference: when both day of month and day of week are set, a
  run needs both to match, while Linux cron needs either. A schedule outside that syntax
  stops the boot with an error naming the job and, when the schedule comes from an
  environment variable (`CHECKS_INTERVAL`, `PRUNE_EVENTS_INTERVAL`), the variable.
  """

  require Logger

  @variables %{
    clusters_checks_execution: "CHECKS_INTERVAL",
    hosts_checks_execution: "CHECKS_INTERVAL",
    discovery_events_pruning: "PRUNE_EVENTS_INTERVAL"
  }

  @spec oban_config() :: keyword()
  def oban_config do
    crontab =
      :trento
      |> Application.fetch_env!(__MODULE__)
      |> Keyword.fetch!(:crontab)
      |> Enum.map(&crontab_entry/1)

    :trento
    |> Application.fetch_env!(Oban)
    |> Keyword.update(:cron, [crontab: crontab], &Keyword.put(&1, :crontab, crontab))
  end

  defp crontab_entry({name, job}) do
    worker = Keyword.fetch!(job, :worker)
    schedule = schedule!(name, Keyword.fetch!(job, :schedule), worker)

    case Keyword.fetch(job, :args) do
      {:ok, args} -> {schedule, worker, args: args}
      :error -> {schedule, worker}
    end
  end

  defp schedule!(name, schedule, worker) do
    schedule = linux_cron(schedule)

    case Oban.Cron.validate(crontab: [{schedule, worker}]) do
      :ok ->
        schedule

      {:error, reason} ->
        raise ArgumentError,
              "invalid schedule #{inspect(schedule)} for #{name}#{variable(name)}: #{reason}. " <>
                "Use the crontab syntax of Linux cron, see crontab(5)"
    end
  end

  defp variable(name) do
    case Map.fetch(@variables, name) do
      {:ok, variable} -> " (#{variable})"
      :error -> ""
    end
  end

  defp linux_cron(schedule) do
    case String.split(schedule) do
      [minute, hour, day, month, weekday] ->
        Enum.join([minute, hour, day, String.upcase(month), weekdays(weekday)], " ")

      _ ->
        schedule
    end
  end

  defp weekdays("*" <> _ = weekday), do: weekday

  defp weekdays(weekday) do
    days = weekday |> String.split(",") |> Enum.map(&weekday_element/1)

    if Enum.all?(days, &is_list/1),
      do: days |> List.flatten() |> Enum.uniq() |> Enum.sort() |> Enum.join(","),
      else: weekday
  end

  defp weekday_element(element) do
    [range | step] = String.split(element, "/")

    with {:ok, first, last} <- weekday_range(String.split(range, "-")),
         {:ok, step} <- weekday_step(step) do
      first |> Range.new(last, step) |> Enum.map(&rem(&1, 7))
    end
  end

  defp weekday_range([day]) do
    with {:ok, day} <- weekday(day), do: {:ok, day, day}
  end

  defp weekday_range([first, last]) do
    with {:ok, first} <- weekday(first),
         {:ok, last} <- weekday(last) do
      # A range ending on Sunday, like FRI-SUN, ends on 7
      last = if last == 0 and first > 0, do: 7, else: last

      if first <= last, do: {:ok, first, last}, else: :error
    end
  end

  defp weekday_range(_), do: :error

  defp weekday_step([]), do: {:ok, 1}

  defp weekday_step([step]) do
    case Integer.parse(step) do
      {step, ""} when step > 0 -> {:ok, step}
      _ -> :error
    end
  end

  defp weekday_step(_), do: :error

  defp weekday(day) do
    case Integer.parse(day) do
      {day, ""} when day in 0..7 -> {:ok, day}
      _ -> weekday_name(String.upcase(day))
    end
  end

  defp weekday_name(name) do
    case Enum.find_index(~w(SUN MON TUE WED THU FRI SAT), &(&1 == name)) do
      nil -> :error
      day -> {:ok, day}
    end
  end

  @doc """
  Logs the exceptions raised by the jobs, which Oban otherwise only stores in the job.
  """
  @spec attach_logger() :: :ok | {:error, :already_exists}
  def attach_logger do
    :telemetry.attach(
      "trento-jobs-logger",
      [:oban, :job, :exception],
      &__MODULE__.handle_event/4,
      nil
    )
  end

  @doc false
  def handle_event([:oban, :job, :exception], _measurements, meta, _config) do
    %{job: %{worker: worker}, kind: kind, reason: reason, stacktrace: stacktrace} = meta

    Logger.error("Job #{worker} failed: " <> Exception.format(kind, reason, stacktrace))
  end
end
