# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.ChecksSchedulingTest do
  # Not async: some tests change the :checks_execution application env
  use ExUnit.Case, async: false
  use Trento.DataCase

  import Mox
  import Trento.Factory

  alias Trento.ChecksScheduling
  alias Trento.ChecksScheduling.{ExceptionWindow, TargetSchedule}
  alias Trento.Settings

  alias Trento.Checks.V1.ExecutionRequested
  alias Trento.Infrastructure.Checks.AMQP.Publisher
  alias Trento.Support.DateService

  require Trento.Clusters.Enums.ClusterType, as: ClusterType

  setup :verify_on_exit!

  setup do
    previous_env = Application.get_env(:trento, :checks_execution)
    on_exit(fn -> Application.put_env(:trento, :checks_execution, previous_env) end)
    Application.put_env(:trento, :checks_execution, interval: nil)

    now = ~U[2026-10-14 10:05:00.400000Z]
    stub(DateService.Mock, :utc_now, fn -> now end)

    %{now: now, tick: ~U[2026-10-14 10:05:00.000000Z]}
  end

  describe "request_due_executions/1" do
    test "should request an execution for a target never scheduled before", %{tick: tick} do
      %{id: host_id} = insert(:host)

      expect_execution_requested(host_id)

      assert :ok = ChecksScheduling.request_due_executions(DateService.Mock)
      assert %TargetSchedule{last_scheduled_at: ^tick} = Repo.get(TargetSchedule, host_id)
    end

    test "should not request an execution before the interval elapsed" do
      %{id: host_id} = insert(:host)
      insert_schedule(host_id, :host, last_scheduled_at: ~U[2026-10-14 10:01:00.000000Z])

      expect_no_execution_requested()

      assert :ok = ChecksScheduling.request_due_executions(DateService.Mock)
    end

    test "should request an execution once the interval elapsed", %{tick: tick} do
      %{id: host_id} = insert(:host)
      insert_schedule(host_id, :host, last_scheduled_at: ~U[2026-10-14 10:00:00.000000Z])

      expect_execution_requested(host_id)

      assert :ok = ChecksScheduling.request_due_executions(DateService.Mock)
      assert %TargetSchedule{last_scheduled_at: ^tick} = Repo.get(TargetSchedule, host_id)
    end

    test "should use the interval set for the target over the global one" do
      %{id: host_id} = insert(:host)

      insert_schedule(host_id, :host,
        interval: 15,
        last_scheduled_at: ~U[2026-10-14 09:55:00.000000Z]
      )

      expect_no_execution_requested()

      assert :ok = ChecksScheduling.request_due_executions(DateService.Mock)
    end

    test "should use the global interval saved in the settings" do
      %{id: host_id} = insert(:host)
      {:ok, _} = Settings.update_checks_execution_settings(%{interval: 60})
      insert_schedule(host_id, :host, last_scheduled_at: ~U[2026-10-14 09:35:00.000000Z])

      expect_no_execution_requested()

      assert :ok = ChecksScheduling.request_due_executions(DateService.Mock)
    end

    test "should prefer the global interval set from the environment over the saved one" do
      %{id: host_id} = insert(:host)
      {:ok, _} = Settings.update_checks_execution_settings(%{interval: 60})
      Application.put_env(:trento, :checks_execution, interval: 15)
      insert_schedule(host_id, :host, last_scheduled_at: ~U[2026-10-14 09:50:00.000000Z])

      expect_execution_requested(host_id)

      assert :ok = ChecksScheduling.request_due_executions(DateService.Mock)
    end

    test "should skip a target inside an exception window" do
      %{id: host_id} = insert(:host)
      last_scheduled_at = ~U[2026-10-14 09:00:00.000000Z]
      insert_schedule(host_id, :host, last_scheduled_at: last_scheduled_at)
      insert_window(host_id, :host, ~U[2026-10-14 10:00:00.000000Z], 30)

      expect_no_execution_requested()

      assert :ok = ChecksScheduling.request_due_executions(DateService.Mock)

      assert %TargetSchedule{last_scheduled_at: ^last_scheduled_at} =
               Repo.get(TargetSchedule, host_id)
    end

    test "should request executions only for registered checkable clusters with selected checks" do
      %{id: cluster_id} = insert(:cluster, type: ClusterType.hana_scale_up())
      insert(:cluster, type: ClusterType.unknown())
      insert(:cluster, type: ClusterType.hana_scale_up(), selected_checks: [])
      insert(:cluster, type: ClusterType.hana_scale_up(), deregistered_at: DateTime.utc_now())

      expect_execution_requested(cluster_id)

      assert :ok = ChecksScheduling.request_due_executions(DateService.Mock)
    end

    test "should skip hosts without selected checks and deregistered hosts" do
      insert(:host, selected_checks: [])
      insert(:host, deregistered_at: DateTime.utc_now())

      expect_no_execution_requested()

      assert :ok = ChecksScheduling.request_due_executions(DateService.Mock)
    end

    test "should not move the last scheduled time when the request fails" do
      %{id: host_id} = insert(:host)

      expect(Trento.Infrastructure.Messaging.Adapter.Mock, :publish, fn Publisher, _, _ ->
        {:error, :amqp_error}
      end)

      assert :ok = ChecksScheduling.request_due_executions(DateService.Mock)
      assert nil == Repo.get(TargetSchedule, host_id)
    end
  end

  describe "in_exception_window?/2" do
    test "should tell whether a time falls inside an exception window of the target" do
      target_id = Faker.UUID.v4()
      insert_window(target_id, :host, ~U[2026-10-14 10:00:00.000000Z], 30)

      refute ChecksScheduling.in_exception_window?(target_id, ~U[2026-10-14 09:59:59Z])
      assert ChecksScheduling.in_exception_window?(target_id, ~U[2026-10-14 10:00:00Z])
      assert ChecksScheduling.in_exception_window?(target_id, ~U[2026-10-14 10:29:59Z])
      refute ChecksScheduling.in_exception_window?(target_id, ~U[2026-10-14 10:30:00Z])
      refute ChecksScheduling.in_exception_window?(Faker.UUID.v4(), ~U[2026-10-14 10:10:00Z])
    end
  end

  describe "recurring exception windows" do
    test "should tell whether a time falls inside a recurring exception window" do
      target_id = Faker.UUID.v4()

      # Every Saturday (6), 22:00 to 02:00 Berlin time
      {:ok, _} =
        ChecksScheduling.update_target_schedule(target_id, :host, %{
          interval: nil,
          exception_window: %{
            starts_at: ~U[2026-10-17 20:00:00Z],
            duration: 240,
            timezone: "Europe/Berlin",
            frequency: :weekly,
            weekdays: [6]
          }
        })

      assert ChecksScheduling.in_exception_window?(target_id, ~U[2026-10-24 23:00:00Z])
      refute ChecksScheduling.in_exception_window?(target_id, ~U[2026-10-25 01:00:00Z])
      # After the end of the daylight saving time the window follows the local time
      assert ChecksScheduling.in_exception_window?(target_id, ~U[2026-10-31 21:30:00Z])
      refute ChecksScheduling.in_exception_window?(target_id, ~U[2026-10-31 20:30:00Z])
    end
  end

  describe "update_target_schedule/3" do
    @window %{starts_at: ~U[2026-10-14 10:00:00Z], duration: 90, timezone: "Etc/UTC"}

    test "should set the interval and the exception window of a target in one update" do
      target_id = Faker.UUID.v4()

      assert {:ok, %{interval: 60, exception_window: %ExceptionWindow{duration: 90}}} =
               ChecksScheduling.update_target_schedule(target_id, :cluster, %{
                 interval: 60,
                 exception_window: @window
               })

      assert %{interval: 60, exception_window: %ExceptionWindow{duration: 90}} =
               ChecksScheduling.get_target_schedule(target_id)
    end

    test "should replace the exception window of a target" do
      target_id = Faker.UUID.v4()

      {:ok, _} =
        ChecksScheduling.update_target_schedule(target_id, :host, %{
          interval: nil,
          exception_window: @window
        })

      {:ok, _} =
        ChecksScheduling.update_target_schedule(target_id, :host, %{
          interval: nil,
          exception_window: %{@window | duration: 30}
        })

      assert %{exception_window: %ExceptionWindow{duration: 30}} =
               ChecksScheduling.get_target_schedule(target_id)

      assert 1 == Repo.aggregate(ExceptionWindow, :count)
    end

    test "should reset the interval and remove the exception window of a target" do
      target_id = Faker.UUID.v4()

      {:ok, _} =
        ChecksScheduling.update_target_schedule(target_id, :host, %{
          interval: 60,
          exception_window: @window
        })

      assert {:ok, %{interval: nil, exception_window: nil}} =
               ChecksScheduling.update_target_schedule(target_id, :host, %{
                 interval: nil,
                 exception_window: nil
               })
    end

    test "should change nothing when the interval is not allowed" do
      target_id = Faker.UUID.v4()

      assert {:error, %Ecto.Changeset{}} =
               ChecksScheduling.update_target_schedule(target_id, :host, %{
                 interval: 7,
                 exception_window: @window
               })

      assert %{interval: nil, exception_window: nil} =
               ChecksScheduling.get_target_schedule(target_id)
    end

    test "should keep the previous exception window when the new one is not valid" do
      target_id = Faker.UUID.v4()

      {:ok, _} =
        ChecksScheduling.update_target_schedule(target_id, :host, %{
          interval: nil,
          exception_window: @window
        })

      assert {:error, %Ecto.Changeset{}} =
               ChecksScheduling.update_target_schedule(target_id, :host, %{
                 interval: nil,
                 exception_window: %{@window | duration: 0}
               })

      assert %{exception_window: %ExceptionWindow{duration: 90}} =
               ChecksScheduling.get_target_schedule(target_id)
    end
  end

  defp expect_execution_requested(group_id) do
    expect(Trento.Infrastructure.Messaging.Adapter.Mock, :publish, fn Publisher,
                                                                      "executions",
                                                                      %ExecutionRequested{
                                                                        group_id: ^group_id
                                                                      } ->
      :ok
    end)
  end

  defp expect_no_execution_requested do
    expect(Trento.Infrastructure.Messaging.Adapter.Mock, :publish, 0, fn _, _, _ -> :ok end)
  end

  defp insert_schedule(target_id, target_type, attrs) do
    Repo.insert!(
      struct!(TargetSchedule, [target_id: target_id, target_type: target_type] ++ attrs)
    )
  end

  defp insert_window(target_id, target_type, starts_at, duration) do
    Repo.insert!(%ExceptionWindow{
      target_id: target_id,
      target_type: target_type,
      starts_at: starts_at,
      duration: duration
    })
  end
end
