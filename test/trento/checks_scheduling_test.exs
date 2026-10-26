defmodule Trento.ChecksSchedulingTest do
  use ExUnit.Case, async: false
  use Trento.DataCase
  use Trento.CommandedCase

  import Mox
  import Trento.Factory

  alias Trento.ChecksScheduling
  alias Trento.Clusters.Commands.UpdateClusterChecksSchedule
  alias Trento.Hosts.Commands.UpdateHostChecksSchedule
  alias Trento.ChecksScheduling.Projections.TargetSettingsReadModel
  alias Trento.Settings
  alias Trento.Support.DateService

  setup :verify_on_exit!

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

  test "should read the checks schedule projected on the host", %{host_id: host_id} do
    {:ok, _} = Settings.update_checks_execution_settings(%{interval: "15m"})

    Repo.insert!(%TargetSettingsReadModel{
      target_id: host_id,
      target_type: "host",
      interval: "6h",
      exception_window: %{
        "starts_at" => "2026-11-02T09:30:00.000000Z",
        "timezone" => "Etc/UTC",
        "duration_minutes" => 120,
        "recurrence" => nil
      }
    })

    assert {:ok,
            %{
              interval: "6h",
              effective_interval: "6h",
              global_interval: "15m",
              in_exception_window: true,
              next_execution_at: ~U[2026-11-02 11:30:00.000000Z],
              exception_window: %{
                starts_at: ~U[2026-11-02 09:30:00.000000Z],
                timezone: "Etc/UTC",
                duration_minutes: 120,
                recurrence: nil
              }
            }} = get_schedule(host_id)
  end

  test "should dispatch the new checks schedule and answer with it", %{host_id: host_id} do
    window = %{
      starts_at: ~U[2026-11-09 09:00:00.000000Z],
      timezone: "Europe/Berlin",
      duration_minutes: 180,
      recurrence: %{frequency: "weekly", interval: 1, weekdays: [1]}
    }

    expect(Trento.Commanded.Mock, :dispatch, fn %UpdateHostChecksSchedule{
                                                  host_id: ^host_id,
                                                  interval: "disabled",
                                                  exception_window: %{"duration_minutes" => 180}
                                                },
                                                [consistency: :strong] ->
      :ok
    end)

    assert {:ok, %{interval: "disabled", next_execution_at: nil, exception_window: ^window}} =
             put_schedule(host_id, %{interval: "disabled", exception_window: window})
  end

  test "should refuse invalid settings without dispatching anything", %{host_id: host_id} do
    expect(Trento.Commanded.Mock, :dispatch, 0, fn _, _ -> :ok end)

    assert {:error, %Ecto.Changeset{}} =
             put_schedule(host_id, %{interval: "7m", exception_window: nil})
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

    expect(Trento.Commanded.Mock, :dispatch, fn %UpdateClusterChecksSchedule{
                                                  cluster_id: ^cluster_id
                                                },
                                                _ ->
      :ok
    end)

    assert {:ok, %{interval: "1w"}} =
             ChecksScheduling.update_target_schedule(
               :cluster,
               cluster_id,
               %{interval: "1w", exception_window: nil},
               DateService.Mock
             )
  end
end
