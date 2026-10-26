defmodule Trento.ChecksSchedulingDueTest do
  use ExUnit.Case, async: false
  use Trento.DataCase

  import Mox
  import Trento.Factory

  alias Trento.ChecksScheduling
  alias Trento.ChecksScheduling.TargetSchedule
  alias Trento.Infrastructure.Messaging.Adapter.Mock, as: Messaging
  alias Trento.Support.DateService

  setup :verify_on_exit!

  @now ~U[2026-11-02 10:00:00.000000Z]

  setup do
    previous = Application.get_env(:trento, :checks_execution)
    on_exit(fn -> Application.put_env(:trento, :checks_execution, previous) end)
    Application.put_env(:trento, :checks_execution, interval: nil)
    stub(DateService.Mock, :utc_now, fn -> @now end)
    :ok
  end

  defp host!(attrs \\ []),
    do: insert(:host, Keyword.merge([selected_checks: ["check_1"], heartbeat: :passing], attrs))

  defp settings!(target_id, attrs) do
    Repo.insert!(
      struct(TargetSchedule, Keyword.merge([target_id: target_id, target_type: "host"], attrs))
    )
  end

  defp requested_target_ids(fun) do
    test_pid = self()

    stub(Messaging, :publish, fn _, "executions", %{group_id: group_id} ->
      send(test_pid, {:requested, group_id})
      :ok
    end)

    fun.()
    collect([])
  end

  defp collect(acc) do
    receive do
      {:requested, id} -> collect([id | acc])
    after
      0 -> Enum.sort(acc)
    end
  end

  test "should request the targets whose interval elapsed and remember when" do
    %{id: never} = host!()
    %{id: elapsed} = host!()
    %{id: recent} = host!()
    settings!(elapsed, last_requested_at: ~U[2026-11-02 09:55:00.000000Z])
    settings!(recent, last_requested_at: ~U[2026-11-02 09:58:00.000000Z])

    assert Enum.sort([never, elapsed]) ==
             requested_target_ids(fn ->
               ChecksScheduling.request_due_executions(DateService.Mock)
             end)

    assert %TargetSchedule{last_requested_at: @now} = Repo.get!(TargetSchedule, never)
    assert %TargetSchedule{last_requested_at: @now} = Repo.get!(TargetSchedule, elapsed)
  end

  test "should follow the interval of each target" do
    %{id: overridden} = host!()
    settings!(overridden, interval: "6h", last_requested_at: ~U[2026-11-02 04:00:00.000000Z])
    %{id: not_yet} = host!()
    settings!(not_yet, interval: "6h", last_requested_at: ~U[2026-11-02 06:00:00.000000Z])

    assert [overridden] ==
             requested_target_ids(fn ->
               ChecksScheduling.request_due_executions(DateService.Mock)
             end)
  end

  test "should skip disabled targets, targets in their exception window and the rest" do
    %{id: disabled} = host!()
    settings!(disabled, interval: "disabled")

    %{id: in_window} = host!()

    settings!(in_window,
      window_starts_at: ~U[2026-11-02 09:00:00.000000Z],
      window_timezone: "Etc/UTC",
      window_duration_minutes: 120
    )

    host!(selected_checks: [])
    host!(deregistered_at: @now)

    assert [] ==
             requested_target_ids(fn ->
               ChecksScheduling.request_due_executions(DateService.Mock)
             end)
  end

  test "should request nothing when periodic executions are disabled globally" do
    {:ok, _} = Trento.Settings.update_checks_execution_settings(%{interval: "disabled"})
    host!()

    assert [] ==
             requested_target_ids(fn ->
               ChecksScheduling.request_due_executions(DateService.Mock)
             end)
  end

  test "should tell whether a target is in its exception window" do
    %{id: host_id} = host!()

    settings!(host_id,
      window_starts_at: ~U[2026-11-02 09:00:00.000000Z],
      window_timezone: "Etc/UTC",
      window_duration_minutes: 120
    )

    assert ChecksScheduling.in_exception_window?(host_id, DateService.Mock)
    refute ChecksScheduling.in_exception_window?(UUID.uuid4(), DateService.Mock)
  end
end
