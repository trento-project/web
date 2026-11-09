# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Infrastructure.Jobs.Plugins.PeriodicTest do
  use ExUnit.Case, async: true

  import ExUnit.CaptureLog

  alias Trento.Infrastructure.Jobs.Plugins.Periodic

  @interval 200
  @tolerance 50

  defmodule Probe do
    @moduledoc false

    def report(pid, name), do: send(pid, {:ran, name, System.os_time(:millisecond)})

    def report_slow(pid, name, duration) do
      started_at = System.os_time(:millisecond)
      Process.sleep(duration)
      send(pid, {:ran, name, started_at, System.os_time(:millisecond)})
    end

    def report_and_raise(pid, name) do
      report(pid, name)
      raise "#{name} failed on purpose"
    end
  end

  describe "validating the options" do
    test "should accept tasks with a positive interval and a function to call" do
      assert :ok =
               Periodic.validate(
                 tasks: [probe: [every: 10, mfa: {Probe, :report, [nil, :probe]}]]
               )
    end

    test "should reject tasks whose function is undefined" do
      for {mfa, function} <- [
            {{Probe, :missing, []}, "#{inspect(Probe)}.missing/0"},
            {{Probe, :report, []}, "#{inspect(Probe)}.report/0"},
            {{NoSuchModule, :run, []}, "NoSuchModule.run/0"}
          ] do
        assert {:error, "task :probe calls #{function}, which is undefined"} ==
                 Periodic.validate(tasks: [probe: [every: 10, mfa: mfa]])
      end
    end

    test "should report every task whose function is undefined" do
      assert {:error,
              "task :missing calls #{inspect(Probe)}.missing/0, which is undefined, " <>
                "task :unknown calls NoSuchModule.run/0, which is undefined"} ==
               Periodic.validate(
                 tasks: [
                   missing: [every: 10, mfa: {Probe, :missing, []}],
                   probe: [every: 10, mfa: {Probe, :report, [nil, :probe]}],
                   unknown: [every: 10, mfa: {NoSuchModule, :run, []}]
                 ]
               )
    end

    test "should require the tasks" do
      assert {:error, "expected :tasks to be set"} = Periodic.validate([])
    end

    test "should reject unknown options" do
      assert {:error, "unknown options [:task], expected :tasks"} =
               Periodic.validate(task: [probe: [every: 10, mfa: {Probe, :report, [nil, :probe]}]])
    end

    test "should reject invalid tasks" do
      for tasks <- [
            [probe: [every: 0, mfa: {Probe, :report, [nil, :probe]}]],
            [probe: [every: 10]],
            [probe: [every: 10, mfa: :report]],
            [probe: [:every]],
            :probe
          ] do
        assert {:error, _} = Periodic.validate(tasks: tasks)
      end
    end
  end

  describe "scheduling the next run" do
    test "should wait until the next boundary of the interval" do
      for {ended_at, delay} <- [
            # the run took 2.3 seconds
            {2_300, 7_700},
            # the run took 9.9 seconds
            {9_900, 100},
            # the run took 12 seconds, the boundary at 10 seconds is skipped
            {12_000, 8_000},
            # the timer fired 3 milliseconds late, the delay does not carry over
            {2_303, 7_697},
            # the run ended exactly on a boundary
            {10_000, 10_000}
          ] do
        assert delay == Periodic.next_run_in(ended_at, 10_000)
      end
    end
  end

  describe "running the tasks" do
    test "should run the tasks on the boundaries of their interval" do
      sleep_until_halfway_between_boundaries()

      start_oban(
        leader?: true,
        tasks: [probe: [every: @interval, mfa: {Probe, :report, [self(), :probe]}]]
      )

      assert_receive {:ran, :probe, ran_at}, 3 * @interval
      assert_on_boundary(ran_at)
    end

    test "should keep the cadence when a run takes part of the interval" do
      start_oban(
        leader?: true,
        tasks: [slow: [every: @interval, mfa: {Probe, :report_slow, [self(), :slow, 120]}]]
      )

      [{first, _}, {second, _}, {third, _}] = receive_runs(:slow, 3, 3 * @interval)

      Enum.each([first, second, third], &assert_on_boundary/1)
      assert_in_delta second - first, @interval, @tolerance
      assert_in_delta third - second, @interval, @tolerance
    end

    test "should skip a boundary without overlapping when a run takes longer than the interval" do
      start_oban(
        leader?: true,
        tasks: [slow: [every: @interval, mfa: {Probe, :report_slow, [self(), :slow, 300]}]]
      )

      [{first, first_ended}, {second, second_ended}, {third, _}] =
        receive_runs(:slow, 3, 5 * @interval)

      Enum.each([first, second, third], &assert_on_boundary/1)
      assert_in_delta second - first, 2 * @interval, @tolerance
      assert_in_delta third - second, 2 * @interval, @tolerance
      assert second >= first_ended
      assert third >= second_ended
    end

    test "should not run the tasks when the node is not the leader" do
      start_oban(
        leader?: false,
        tasks: [probe: [every: 50, mfa: {Probe, :report, [self(), :probe]}]]
      )

      refute_receive {:ran, :probe, _}, 200
    end

    test "should keep running a task after it raises" do
      log =
        capture_log(fn ->
          name =
            start_oban(
              leader?: true,
              tasks: [failing: [every: 50, mfa: {Probe, :report_and_raise, [self(), :failing]}]]
            )

          plugin = Oban.Registry.whereis(name, {:plugin, Periodic})

          assert_receive {:ran, :failing, _}, 200
          assert_receive {:ran, :failing, _}, 200
          assert plugin == Oban.Registry.whereis(name, {:plugin, Periodic})
        end)

      assert log =~ "failing failed on purpose"
    end
  end

  defp start_oban(opts) do
    name = make_ref()

    start_supervised!(
      {Oban,
       name: name,
       repo: Trento.Repo,
       queues: [],
       stager: false,
       notifier: Oban.Notifiers.Isolated,
       peer: {Oban.Peers.Isolated, leader?: Keyword.fetch!(opts, :leader?)},
       plugins: [{Periodic, tasks: Keyword.fetch!(opts, :tasks)}]}
    )

    name
  end

  defp receive_runs(name, count, timeout) do
    for _ <- 1..count do
      assert_receive {:ran, ^name, started_at, ended_at}, timeout
      {started_at, ended_at}
    end
  end

  # Sleeps until the clock is halfway between two boundaries of the interval: with 200 ms,
  # 100 ms past a multiple of 200. From there the plugin runs 100 ms later, on a boundary,
  # while a plugin waiting a fixed interval would run 200 ms later, halfway again.
  defp sleep_until_halfway_between_boundaries do
    now = System.os_time(:millisecond)

    Process.sleep(Integer.mod(div(@interval, 2) - rem(now, @interval), @interval))
  end

  defp assert_on_boundary(started_at), do: assert(rem(started_at, @interval) < @tolerance)
end
