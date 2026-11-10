# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Infrastructure.JobsTest do
  use ExUnit.Case, async: false

  import ExUnit.CaptureLog

  alias Trento.Infrastructure.Jobs

  alias Trento.Infrastructure.Jobs.{
    ActivityLogCleaningJob,
    DiscoveryEventsPruningJob,
    HostsChecksExecutionJob
  }

  describe "oban configuration" do
    test "should be a valid Oban configuration" do
      assert :ok = Oban.Config.validate(Jobs.oban_config())
    end

    test "should build the crontab from the named entries, keeping their options" do
      put_crontab(
        hosts_checks_execution: {"@hourly", HostsChecksExecutionJob},
        discovery_events_pruning:
          {"0 3 * * *", DiscoveryEventsPruningJob, args: %{older_than: 30}, priority: 1}
      )

      assert [
               {"@hourly", HostsChecksExecutionJob},
               {"0 3 * * *", DiscoveryEventsPruningJob, args: %{older_than: 30}, priority: 1}
             ] == Jobs.oban_config()[:cron][:crontab]
    end

    test "should accept the crontab syntax of Linux cron" do
      for {schedule, expected} <- [
            {"0 0 * * 7", "0 0 * * 0"},
            {"0 0 * * 1,7", "0 0 * * 0,1"},
            {"0 0 * * 5-7", "0 0 * * 0,5,6"},
            {"0 0 * * 1-7/2", "0 0 * * 0,1,3,5"},
            {"0 0 * * sun", "0 0 * * 0"},
            {"0 0 * * mon-fri", "0 0 * * 1,2,3,4,5"},
            {"0 0 * * Fri-Sun", "0 0 * * 0,5,6"},
            {"0 0 * * 0-0", "0 0 * * 0"},
            {"0 0 1 jan *", "0 0 1 JAN *"},
            {"0 0 * * */2", "0 0 * * */2"},
            {"0 0 * * */2,7", "0 0 * * 0,2,4,6"},
            {"0 0 * * 7,*/2", "0 0 * * 0,2,4,6"},
            {"*/15 * * * *", "*/15 * * * *"},
            {"@daily", "@daily"}
          ] do
        put_crontab(activity_log_cleaning: {schedule, ActivityLogCleaningJob})

        assert [{^expected, ActivityLogCleaningJob}] = Jobs.oban_config()[:cron][:crontab]
      end
    end

    test "should fail naming the job and its environment variable on a schedule that Oban cron does not support" do
      for schedule <- ["0 0 L * *", "0 0 15W * *", "0 0 * * 1#2"] do
        put_crontab(
          discovery_events_pruning: {schedule, DiscoveryEventsPruningJob, args: %{older_than: 10}}
        )

        assert_raise ArgumentError,
                     ~r/invalid schedule "#{Regex.escape(schedule)}" for discovery_events_pruning \(PRUNE_EVENTS_INTERVAL\): /,
                     fn -> Jobs.oban_config() end
      end

      put_crontab(hosts_checks_execution: {"*/0 * * * *", HostsChecksExecutionJob})

      assert_raise ArgumentError,
                   ~r/invalid schedule "\*\/0 \* \* \* \*" for hosts_checks_execution \(CHECKS_INTERVAL\): /,
                   fn -> Jobs.oban_config() end

      put_crontab(activity_log_cleaning: {"0 0 L * *", ActivityLogCleaningJob})

      assert_raise ArgumentError,
                   ~r/invalid schedule "0 0 L \* \*" for activity_log_cleaning: /,
                   fn -> Jobs.oban_config() end
    end
  end

  describe "logging" do
    test "should log the exceptions raised by the jobs" do
      log =
        capture_log(fn ->
          :telemetry.execute([:oban, :job, :exception], %{duration: 1}, %{
            job: %Oban.Job{worker: "Trento.Infrastructure.Jobs.SomeJob"},
            kind: :error,
            reason: %RuntimeError{message: "job failed on purpose"},
            stacktrace: []
          })
        end)

      assert log =~ "Trento.Infrastructure.Jobs.SomeJob"
      assert log =~ "job failed on purpose"
    end
  end

  defp put_crontab(crontab) do
    previous = Application.get_env(:trento, Oban)
    on_exit(fn -> Application.put_env(:trento, Oban, previous) end)

    Application.put_env(:trento, Oban, put_in(previous, [:cron, :crontab], crontab))
  end
end
