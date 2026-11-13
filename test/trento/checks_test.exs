# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.ChecksTest do
  use ExUnit.Case, async: false
  use Trento.DataCase

  import ExUnit.CaptureLog
  import Mox
  import Trento.Factory

  require Trento.Clusters.Enums.ClusterType, as: ClusterType

  alias Trento.Checks
  alias Trento.Checks.ChecksExecutionRequest
  alias Trento.Checks.Frequency
  alias Trento.Checks.V1.ExecutionRequested
  alias Trento.Infrastructure.Checks.AMQP.Publisher
  alias Trento.Infrastructure.Messaging.Adapter.Mock, as: Messaging
  alias Trento.Support.DateService

  @now ~U[2026-03-02 10:00:00.000000Z]

  setup :verify_on_exit!

  setup do
    stub(DateService.Mock, :utc_now, fn -> @now end)

    :ok
  end

  describe "requesting the due checks executions" do
    test "should request the hosts and clusters never requested, and store the request time" do
      %{id: host_id} = insert(:host)

      cluster_ids =
        for type <- [
              ClusterType.hana_scale_up(),
              ClusterType.hana_scale_out(),
              ClusterType.ascs_ers()
            ] do
          %{id: cluster_id} = insert(:cluster, type: type)
          cluster_id
        end

      assert_requested([host_id | cluster_ids])

      assert %ChecksExecutionRequest{target_type: :host, last_requested_at: @now} =
               Repo.get!(ChecksExecutionRequest, host_id)

      for cluster_id <- cluster_ids do
        assert %ChecksExecutionRequest{target_type: :cluster, last_requested_at: @now} =
                 Repo.get!(ChecksExecutionRequest, cluster_id)
      end
    end

    test "should request again the targets last requested 5 minutes ago or more, by default" do
      %{id: host_id} = insert(:host)
      requested_at!(:host, host_id, ~U[2026-03-02 09:55:00.000000Z])

      %{id: cluster_id} = insert(:cluster)
      requested_at!(:cluster, cluster_id, ~U[2026-03-02 09:54:00.000000Z])

      %{id: recent_host_id} = insert(:host)
      requested_at!(:host, recent_host_id, ~U[2026-03-02 09:58:00.000000Z])

      assert_requested([host_id, cluster_id])

      assert %ChecksExecutionRequest{last_requested_at: @now} =
               Repo.get!(ChecksExecutionRequest, host_id)

      assert %ChecksExecutionRequest{last_requested_at: @now} =
               Repo.get!(ChecksExecutionRequest, cluster_id)

      assert %ChecksExecutionRequest{last_requested_at: ~U[2026-03-02 09:58:00.000000Z]} =
               Repo.get!(ChecksExecutionRequest, recent_host_id)
    end

    for {frequency, due_after_seconds} <- [
          # 5 minutes less 30 seconds
          {%Frequency{value: 5, unit: :minute}, 270},
          # 6 hours less 30 seconds
          {%Frequency{value: 6, unit: :hour}, 21_570}
        ] do
      @frequency frequency
      @due_after_seconds due_after_seconds

      test "should request the targets due at #{frequency.value} #{frequency.unit}s, up to 30 seconds early" do
        insert(:checks_frequency_settings, frequency: @frequency)

        %{id: due_host_id} = insert(:host)
        requested_at!(:host, due_host_id, DateTime.add(@now, -@due_after_seconds))

        %{id: early_host_id} = insert(:host)
        requested_at!(:host, early_host_id, DateTime.add(@now, -@due_after_seconds + 1))

        assert_requested([due_host_id])
      end
    end

    test "should request nothing when the periodic checks are disabled" do
      insert(:checks_frequency_settings,
        enabled: false,
        frequency: %Frequency{value: 5, unit: :minute}
      )

      insert(:host)
      insert(:cluster)

      assert_requested([])
    end

    test "should skip, without logging, the deregistered targets, the ones without selected checks and the clusters whose checks can not be executed" do
      skipped_target_ids =
        Enum.map(
          [
            insert(:host, deregistered_at: @now),
            insert(:cluster, deregistered_at: @now),
            insert(:host, selected_checks: []),
            insert(:cluster, selected_checks: []),
            insert(:cluster, type: ClusterType.unknown())
          ],
          & &1.id
        )

      log = capture_log(fn -> assert_requested([]) end)

      for target_id <- skipped_target_ids, do: refute(log =~ target_id)
    end

    test "should log a failed request and retry it at the next run" do
      %{id: never_requested_host_id} = insert(:host)

      %{id: requested_host_id} = insert(:host)
      requested_at!(:host, requested_host_id, ~U[2026-03-02 09:50:00.000000Z])

      expect(Messaging, :publish, 2, fn Publisher, "executions", %ExecutionRequested{} ->
        {:error, :amqp_error}
      end)

      log =
        capture_log([level: :error], fn ->
          assert :ok = Checks.request_due_executions(DateService.Mock)
        end)

      for host_id <- [never_requested_host_id, requested_host_id] do
        assert log =~
                 "Failed to request checks execution, host: #{host_id}, reason: :amqp_error"
      end

      assert nil == Repo.get(ChecksExecutionRequest, never_requested_host_id)

      assert %ChecksExecutionRequest{last_requested_at: ~U[2026-03-02 09:50:00.000000Z]} =
               Repo.get!(ChecksExecutionRequest, requested_host_id)

      assert_requested([never_requested_host_id, requested_host_id])
    end
  end

  describe "deleting the stale execution requests" do
    test "should delete the requests of the deregistered and removed targets, keeping the others" do
      %{id: registered_host_id} = insert(:host)
      %{id: unchecked_host_id} = insert(:host, selected_checks: [])
      %{id: deregistered_host_id} = insert(:host, deregistered_at: @now)
      %{id: registered_cluster_id} = insert(:cluster)
      %{id: deregistered_cluster_id} = insert(:cluster, deregistered_at: @now)

      for {target_type, target_id} <- [
            host: registered_host_id,
            host: unchecked_host_id,
            host: deregistered_host_id,
            host: Faker.UUID.v4(),
            cluster: registered_cluster_id,
            cluster: deregistered_cluster_id,
            cluster: Faker.UUID.v4()
          ] do
        requested_at!(target_type, target_id, @now)
      end

      assert 4 == Checks.delete_stale_execution_requests()

      assert Enum.sort([registered_host_id, unchecked_host_id, registered_cluster_id]) ==
               ChecksExecutionRequest |> Repo.all() |> Enum.map(& &1.target_id) |> Enum.sort()
    end
  end

  defp requested_at!(target_type, target_id, last_requested_at) do
    Repo.insert!(%ChecksExecutionRequest{
      target_id: target_id,
      target_type: target_type,
      last_requested_at: last_requested_at
    })
  end

  # Runs the scheduler, expecting a checks execution request for each of the given targets only
  defp assert_requested(expected_target_ids) do
    test_pid = self()

    expect(Messaging, :publish, length(expected_target_ids), fn Publisher,
                                                                "executions",
                                                                %ExecutionRequested{
                                                                  group_id: group_id
                                                                } ->
      send(test_pid, {:execution_requested, group_id})

      :ok
    end)

    assert :ok = Checks.request_due_executions(DateService.Mock)

    assert Enum.sort(expected_target_ids) == Enum.sort(requested_target_ids([]))
  end

  defp requested_target_ids(target_ids) do
    receive do
      {:execution_requested, target_id} -> requested_target_ids([target_id | target_ids])
    after
      0 -> target_ids
    end
  end
end
