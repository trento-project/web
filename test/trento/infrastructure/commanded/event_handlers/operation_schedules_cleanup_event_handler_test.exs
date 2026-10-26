defmodule Trento.Infrastructure.Commanded.EventHandlers.OperationSchedulesCleanupEventHandlerTest do
  use ExUnit.Case, async: true
  use Trento.DataCase
  use Trento.CommandedCase

  import Mox

  alias Trento.Clusters.Events.ClusterDeregistered
  alias Trento.Databases.Events.DatabaseDeregistered
  alias Trento.Hosts.Events.HostDeregistered
  alias Trento.Infrastructure.Commanded.EventHandlers.OperationSchedulesCleanupEventHandler
  alias Trento.Operations.Commands.CancelOperationSchedule
  alias Trento.Operations.OperationSchedule
  alias Trento.SapSystems.Events.SapSystemDeregistered

  setup :verify_on_exit!

  test "should cancel the schedules of a deregistered host, correlated to the clean up" do
    host_id = UUID.uuid4()
    correlation_id = UUID.uuid4()

    %{id: schedule_id} =
      Repo.insert!(%OperationSchedule{
        target_type: "host",
        target_id: host_id,
        operation: "reboot",
        starts_at: ~U[2026-11-07 02:00:00.000000Z],
        timezone: "Etc/UTC",
        next_run_at: ~U[2026-11-07 02:00:00.000000Z]
      })

    expect(Trento.Commanded.Mock, :dispatch, fn %CancelOperationSchedule{
                                                  schedule_id: ^schedule_id,
                                                  actor: "system"
                                                },
                                                opts ->
      assert correlation_id == Keyword.fetch!(opts, :correlation_id)
      :ok
    end)

    assert :ok ==
             OperationSchedulesCleanupEventHandler.handle(
               %HostDeregistered{host_id: host_id, deregistered_at: DateTime.utc_now()},
               %{correlation_id: correlation_id}
             )
  end

  test "should handle the deregistration of every target type" do
    expect(Trento.Commanded.Mock, :dispatch, 0, fn _, _ -> :ok end)

    for event <- [
          %ClusterDeregistered{cluster_id: UUID.uuid4(), deregistered_at: DateTime.utc_now()},
          %SapSystemDeregistered{
            sap_system_id: UUID.uuid4(),
            deregistered_at: DateTime.utc_now()
          },
          %DatabaseDeregistered{database_id: UUID.uuid4(), deregistered_at: DateTime.utc_now()}
        ] do
      assert :ok == OperationSchedulesCleanupEventHandler.handle(event, %{})
    end
  end
end
