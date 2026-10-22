# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Operations.SchedulesTest do
  use ExUnit.Case, async: true
  use Trento.DataCase
  use Oban.Testing, repo: Trento.Repo

  import Mox
  import Trento.Factory

  alias Trento.ActivityLog.ActivityLog
  alias Trento.Infrastructure.Jobs.ScheduledOperationJob
  alias Trento.Infrastructure.Operations.AMQP.Publisher
  alias Trento.Operations.{OperationSchedule, Schedules}
  alias Trento.Operations.V1.OperationRequested
  alias Trento.Support.DateService

  setup :verify_on_exit!

  @now ~U[2026-10-14 10:00:00.000000Z]

  setup do
    stub(DateService.Mock, :utc_now, fn -> @now end)

    user = insert(:user)
    # all:all is seeded by the migrations
    %{id: ability_id} = Repo.get_by!(Trento.Abilities.Ability, name: "all", resource: "all")
    insert(:users_abilities, user_id: user.id, ability_id: ability_id)
    host = insert(:host, heartbeat: :passing, cluster_id: nil)

    %{user: Trento.Repo.preload(user, :abilities), host: host}
  end

  defp schedule_attrs(host_id, attrs \\ %{}) do
    Map.merge(
      %{
        target_type: :host,
        target_id: host_id,
        operation: "reboot",
        params: %{},
        starts_at: ~U[2026-10-15 03:00:00Z],
        timezone: "Europe/Berlin"
      },
      attrs
    )
  end

  describe "create_schedule/3" do
    test "should schedule a one-time operation", %{user: user, host: %{id: host_id}} do
      assert {:ok, %OperationSchedule{id: schedule_id, next_run_at: next_run_at}} =
               Schedules.create_schedule(schedule_attrs(host_id), user, DateService.Mock)

      assert DateTime.compare(next_run_at, ~U[2026-10-15 03:00:00Z]) == :eq

      assert_enqueued(
        worker: ScheduledOperationJob,
        args: %{schedule_id: schedule_id},
        scheduled_at: ~U[2026-10-15 03:00:00Z]
      )

      assert [%ActivityLog{type: "operation_scheduled", metadata: metadata}] =
               Repo.all(ActivityLog)

      assert %{"schedule_id" => ^schedule_id, "operation" => "reboot"} = metadata
    end

    test "should start a weekly schedule on the first selected weekday", %{
      user: user,
      host: %{id: host_id}
    } do
      # 15 October 2026 is a Thursday, the first Saturday (6) after it is 17 October
      attrs = schedule_attrs(host_id, %{frequency: :weekly, weekdays: [6]})

      assert {:ok, %OperationSchedule{next_run_at: next_run_at}} =
               Schedules.create_schedule(attrs, user, DateService.Mock)

      assert DateTime.compare(next_run_at, ~U[2026-10-17 03:00:00Z]) == :eq
    end

    test "should reject a start in the past", %{user: user, host: %{id: host_id}} do
      attrs = schedule_attrs(host_id, %{starts_at: ~U[2026-10-14 09:00:00Z]})

      assert {:error, %Ecto.Changeset{}} =
               Schedules.create_schedule(attrs, user, DateService.Mock)

      refute_enqueued(worker: ScheduledOperationJob)
    end

    test "should reject a second schedule of the same operation for the same target", %{
      user: user,
      host: %{id: host_id}
    } do
      {:ok, _} = Schedules.create_schedule(schedule_attrs(host_id), user, DateService.Mock)

      assert {:error, %Ecto.Changeset{}} =
               Schedules.create_schedule(schedule_attrs(host_id), user, DateService.Mock)
    end
  end

  describe "update_schedule/4 and delete_schedule/2" do
    test "should replace the pending occurrence when the schedule changes", %{
      user: user,
      host: %{id: host_id}
    } do
      {:ok, %{id: schedule_id}} =
        Schedules.create_schedule(schedule_attrs(host_id), user, DateService.Mock)

      assert {:ok, %OperationSchedule{next_run_at: next_run_at}} =
               Schedules.update_schedule(
                 schedule_id,
                 %{starts_at: ~U[2026-10-16 03:00:00Z]},
                 user,
                 DateService.Mock
               )

      assert DateTime.compare(next_run_at, ~U[2026-10-16 03:00:00Z]) == :eq

      assert [%{state: "cancelled"}, %{state: "scheduled", scheduled_at: scheduled_at}] =
               Repo.all(from j in Oban.Job, order_by: j.id)

      assert DateTime.compare(scheduled_at, ~U[2026-10-16 03:00:00Z]) == :eq

      assert ["operation_scheduled", "operation_schedule_changed"] ==
               Repo.all(from l in ActivityLog, order_by: l.inserted_at, select: l.type)
    end

    test "should cancel the pending occurrence when the schedule is deleted", %{
      user: user,
      host: %{id: host_id}
    } do
      {:ok, %{id: schedule_id}} =
        Schedules.create_schedule(schedule_attrs(host_id), user, DateService.Mock)

      assert :ok = Schedules.delete_schedule(schedule_id, user)

      assert nil == Repo.get(OperationSchedule, schedule_id)
      assert [%{state: "cancelled"}] = Repo.all(Oban.Job)
      assert {:error, :not_found} = Schedules.delete_schedule(schedule_id, user)
    end
  end

  describe "run_occurrence/3" do
    setup %{user: user, host: %{id: host_id}} do
      {:ok, schedule} =
        Schedules.create_schedule(schedule_attrs(host_id), user, DateService.Mock)

      on_time = ~U[2026-10-15 03:00:00.200000Z]
      %{schedule: schedule, on_time: on_time}
    end

    test "should request the operation and end a one-time schedule", %{
      schedule: %{id: schedule_id, next_run_at: occurrence_at},
      host: %{id: host_id},
      on_time: on_time
    } do
      expect(Trento.Infrastructure.Messaging.Adapter.Mock, :publish, fn Publisher,
                                                                        "requests",
                                                                        %OperationRequested{
                                                                          group_id: ^host_id,
                                                                          operation_type:
                                                                            "hostreboot@v1"
                                                                        } ->
        :ok
      end)

      assert :ok = Schedules.run_occurrence(schedule_id, occurrence_at, date_at(on_time))

      assert %OperationSchedule{occurrences: 1, next_run_at: nil} =
               Repo.get(OperationSchedule, schedule_id)

      assert %ActivityLog{severity: 9, metadata: %{"operation_id" => operation_id}} =
               Repo.get_by(ActivityLog, type: "scheduled_operation_requested")

      assert {:ok, _} = Ecto.UUID.cast(operation_id)
    end

    test "should request the operation and schedule the next periodic occurrence", %{
      user: user,
      schedule: %{id: schedule_id},
      on_time: on_time
    } do
      {:ok, %{next_run_at: occurrence_at}} =
        Schedules.update_schedule(schedule_id, %{frequency: :daily}, user, DateService.Mock)

      expect(Trento.Infrastructure.Messaging.Adapter.Mock, :publish, fn _, _, _ -> :ok end)

      assert :ok = Schedules.run_occurrence(schedule_id, occurrence_at, date_at(on_time))

      assert %OperationSchedule{occurrences: 1, next_run_at: next_run_at} =
               Repo.get(OperationSchedule, schedule_id)

      assert DateTime.compare(next_run_at, ~U[2026-10-16 03:00:00Z]) == :eq

      assert_enqueued(
        worker: ScheduledOperationJob,
        args: %{schedule_id: schedule_id},
        scheduled_at: ~U[2026-10-16 03:00:00Z]
      )
    end

    test "should record a failed request when a policy is not met", %{
      schedule: %{id: schedule_id, next_run_at: occurrence_at},
      host: host,
      on_time: on_time
    } do
      host |> Ecto.Changeset.change(heartbeat: :critical) |> Repo.update!()

      expect(Trento.Infrastructure.Messaging.Adapter.Mock, :publish, 0, fn _, _, _ -> :ok end)

      assert :ok = Schedules.run_occurrence(schedule_id, occurrence_at, date_at(on_time))

      assert %ActivityLog{severity: 13, metadata: %{"reason" => "forbidden", "errors" => [_]}} =
               Repo.get_by(ActivityLog, type: "scheduled_operation_request_failed")

      assert %OperationSchedule{occurrences: 1, next_run_at: nil} =
               Repo.get(OperationSchedule, schedule_id)
    end

    test "should record a failed request when Trento was not available at the scheduled time",
         %{schedule: %{id: schedule_id, next_run_at: occurrence_at}} do
      expect(Trento.Infrastructure.Messaging.Adapter.Mock, :publish, 0, fn _, _, _ -> :ok end)

      assert :ok =
               Schedules.run_occurrence(
                 schedule_id,
                 occurrence_at,
                 date_at(~U[2026-10-15 05:00:00Z])
               )

      assert %ActivityLog{metadata: %{"reason" => "trento_unavailable"}} =
               Repo.get_by(ActivityLog, type: "scheduled_operation_request_failed")
    end

    test "should record a failed request when the creator lost the operation ability", %{
      schedule: %{id: schedule_id, next_run_at: occurrence_at},
      user: user,
      on_time: on_time
    } do
      Repo.delete_all(from ua in Trento.Abilities.UsersAbilities, where: ua.user_id == ^user.id)

      expect(Trento.Infrastructure.Messaging.Adapter.Mock, :publish, 0, fn _, _, _ -> :ok end)

      assert :ok = Schedules.run_occurrence(schedule_id, occurrence_at, date_at(on_time))

      assert %ActivityLog{metadata: %{"reason" => "unauthorized"}} =
               Repo.get_by(ActivityLog, type: "scheduled_operation_request_failed")
    end

    test "should correlate wanda's already running reply to the schedule", %{
      schedule: %{id: schedule_id, next_run_at: occurrence_at},
      host: %{id: host_id},
      on_time: on_time
    } do
      expect(Trento.Infrastructure.Messaging.Adapter.Mock, :publish, fn _, _, _ -> :ok end)
      :ok = Schedules.run_occurrence(schedule_id, occurrence_at, date_at(on_time))

      %{metadata: %{"operation_id" => operation_id}} =
        Repo.get_by(ActivityLog, type: "scheduled_operation_requested")

      # What wanda publishes when another operation runs on the same group
      already_running =
        build(:operation_completed_with_failed_request_v1,
          operation_id: operation_id,
          group_id: host_id,
          operation_type: "hostreboot@v1",
          error: :ALREADY_RUNNING
        )

      Trento.ActivityLog.ActivityLogger.log_activity(%{queue_event: already_running})

      assert %ActivityLog{
               metadata: %{"schedule_id" => ^schedule_id, "result" => "REQUEST_FAILED"}
             } =
               Repo.get_by(ActivityLog, type: "operation_completed")
    end

    test "the Oban job runs the occurrence of its arguments", %{
      schedule: %{id: schedule_id, next_run_at: occurrence_at}
    } do
      expect(Trento.Infrastructure.Messaging.Adapter.Mock, :publish, 0, fn _, _, _ -> :ok end)

      # An occurrence that is not the pending one is cancelled, whatever the clock says
      stale_occurrence = occurrence_at |> DateTime.add(1, :hour) |> DateTime.to_iso8601()

      assert {:cancel, :stale_occurrence} =
               perform_job(ScheduledOperationJob, %{
                 schedule_id: schedule_id,
                 occurrence_at: stale_occurrence
               })
    end

    test "should skip an occurrence replaced by a schedule change", %{
      schedule: %{id: schedule_id},
      on_time: on_time
    } do
      expect(Trento.Infrastructure.Messaging.Adapter.Mock, :publish, 0, fn _, _, _ -> :ok end)

      assert {:cancel, :stale_occurrence} =
               Schedules.run_occurrence(
                 schedule_id,
                 ~U[2026-10-15 04:00:00Z],
                 date_at(on_time)
               )
    end
  end

  defp date_at(datetime) do
    stub(DateService.Mock, :utc_now, fn -> datetime end)
    DateService.Mock
  end
end
