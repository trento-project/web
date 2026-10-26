defmodule Trento.ChecksSchedulingTest do
  use ExUnit.Case, async: false
  use Trento.DataCase

  import Mox
  import Trento.Factory

  alias Trento.ChecksScheduling
  alias Trento.ChecksScheduling.TargetSchedule
  alias Trento.Settings
  alias Trento.Support.DateService

  # Monday 2 November 2026, 10:00 UTC
  @now ~U[2026-11-02 10:00:00.000000Z]

  setup do
    previous = Application.get_env(:trento, :checks_execution)
    on_exit(fn -> Application.put_env(:trento, :checks_execution, previous) end)
    Application.put_env(:trento, :checks_execution, interval: nil)

    stub(DateService.Mock, :utc_now, fn -> @now end)
    %{id: host_id} = insert(:host)
    %{host_id: host_id}
  end

  defp get_schedule(host_id),
    do: ChecksScheduling.get_target_schedule(:host, host_id, DateService.Mock)

  defp put_schedule(host_id, attrs),
    do: ChecksScheduling.update_target_schedule(:host, host_id, attrs, DateService.Mock)

  defp requested_at(host_id, at) do
    Repo.insert!(
      %TargetSchedule{target_id: host_id, target_type: "host", last_requested_at: at},
      on_conflict: [set: [last_requested_at: at]],
      conflict_target: :target_id
    )
  end

  test "should use the global interval when the target has none", %{host_id: host_id} do
    assert {:ok,
            %{
              interval: nil,
              effective_interval: "5m",
              global_interval: "5m",
              last_requested_at: nil,
              next_execution_at: @now,
              exception_window: nil,
              in_exception_window: false
            }} == get_schedule(host_id)
  end

  test "should override the global interval for the target", %{host_id: host_id} do
    {:ok, _} = Settings.update_checks_execution_settings(%{interval: "15m"})
    requested_at(host_id, ~U[2026-11-02 09:00:00.000000Z])

    assert {:ok, %{interval: "6h", effective_interval: "6h", global_interval: "15m"}} =
             put_schedule(host_id, %{interval: "6h", exception_window: nil})

    assert {:ok, %{next_execution_at: ~U[2026-11-02 15:00:00.000000Z]}} = get_schedule(host_id)

    assert {:ok, %{interval: nil, effective_interval: "15m"}} =
             put_schedule(host_id, %{interval: nil, exception_window: nil})
  end

  test "should plan no execution when periodic executions are disabled", %{host_id: host_id} do
    assert {:ok, %{effective_interval: "disabled", next_execution_at: nil}} =
             put_schedule(host_id, %{interval: "disabled", exception_window: nil})

    {:ok, _} = Settings.update_checks_execution_settings(%{interval: "disabled"})
    {:ok, _} = put_schedule(host_id, %{interval: nil, exception_window: nil})

    assert {:ok, %{effective_interval: "disabled", next_execution_at: nil}} =
             get_schedule(host_id)
  end

  test "should plan the next execution after a one-time exception window", %{host_id: host_id} do
    window = %{
      starts_at: ~U[2026-11-02 09:30:00.000000Z],
      timezone: "Etc/UTC",
      duration_minutes: 120,
      recurrence: nil
    }

    assert {:ok,
            %{
              exception_window: ^window,
              in_exception_window: true,
              next_execution_at: ~U[2026-11-02 11:30:00.000000Z]
            }} = put_schedule(host_id, %{interval: nil, exception_window: window})
  end

  test "should know when a periodic exception window is active", %{host_id: host_id} do
    window = %{
      starts_at: ~U[2026-10-01 09:00:00.000000Z],
      timezone: "Europe/Berlin",
      duration_minutes: 180,
      recurrence: %{frequency: "weekly", interval: 1, weekdays: [1]}
    }

    # Mondays from 11:00 to 14:00 in Berlin: 10:00 to 13:00 UTC once summer time is over
    assert {:ok, %{in_exception_window: true, next_execution_at: ~U[2026-11-02 13:00:00.000000Z]}} =
             put_schedule(host_id, %{interval: nil, exception_window: window})

    stub(DateService.Mock, :utc_now, fn -> ~U[2026-11-03 10:00:00.000000Z] end)
    assert {:ok, %{in_exception_window: false}} = get_schedule(host_id)
  end

  test "should refuse invalid settings", %{host_id: host_id} do
    for attrs <- [
          %{interval: "7m", exception_window: nil},
          %{
            interval: nil,
            exception_window: %{
              starts_at: ~U[2026-11-01 08:00:00.000000Z],
              timezone: "Etc/UTC",
              duration_minutes: 60,
              recurrence: nil
            }
          },
          %{
            interval: nil,
            exception_window: %{
              starts_at: ~U[2026-11-03 08:00:00.000000Z],
              timezone: "Etc/UTC",
              duration_minutes: 0,
              recurrence: nil
            }
          }
        ] do
      assert {:error, %Ecto.Changeset{}} = put_schedule(host_id, attrs)
    end
  end

  test "should not find an unknown or deregistered target" do
    %{id: deregistered_id} = insert(:host, deregistered_at: @now)

    for host_id <- [UUID.uuid4(), deregistered_id] do
      assert {:error, :not_found} == get_schedule(host_id)

      assert {:error, :not_found} ==
               put_schedule(host_id, %{interval: "1h", exception_window: nil})
    end
  end

  test "should handle clusters" do
    %{id: cluster_id} = insert(:cluster)

    assert {:ok, %{interval: "1w"}} =
             ChecksScheduling.update_target_schedule(
               :cluster,
               cluster_id,
               %{interval: "1w", exception_window: nil},
               DateService.Mock
             )
  end
end
