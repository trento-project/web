defmodule Trento.Operations.SchedulerTest do
  use ExUnit.Case, async: true
  use Trento.DataCase
  use Trento.CommandedCase

  import Mox

  alias Trento.Operations.Commands.StartScheduledRun
  alias Trento.Operations.{OperationSchedule, Scheduler}
  alias Trento.Support.DateService

  setup :verify_on_exit!

  @now ~U[2026-11-07 02:00:30.000000Z]

  defp schedule!(next_run_at) do
    Repo.insert!(%OperationSchedule{
      target_type: "host",
      target_id: UUID.uuid4(),
      operation: "reboot",
      starts_at: next_run_at,
      timezone: "Etc/UTC",
      next_run_at: next_run_at
    })
  end

  test "should start the runs of the due schedules" do
    %{id: due} = schedule!(~U[2026-11-07 02:00:00.000000Z])
    schedule!(~U[2026-11-07 02:05:00.000000Z])
    stub(DateService.Mock, :utc_now, fn -> @now end)

    expect(Trento.Commanded.Mock, :dispatch, fn %StartScheduledRun{
                                                  schedule_id: ^due,
                                                  run_at: ~U[2026-11-07 02:00:00.000000Z],
                                                  started_at: @now
                                                },
                                                opts ->
      assert due == Keyword.fetch!(opts, :correlation_id)
      :ok
    end)

    assert :ok == Scheduler.run_due(DateService.Mock)
  end

  test "should go on when a run is already started" do
    schedule!(~U[2026-11-07 02:00:00.000000Z])
    schedule!(~U[2026-11-07 01:59:00.000000Z])
    stub(DateService.Mock, :utc_now, fn -> @now end)

    expect(Trento.Commanded.Mock, :dispatch, 2, fn %StartScheduledRun{}, _ ->
      {:error, :run_in_progress}
    end)

    assert :ok == Scheduler.run_due(DateService.Mock)
  end
end
