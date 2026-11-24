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
    for target_type <- [:host, :cluster] do
      @target_type target_type

      test "should request the #{target_type}s never requested, and store the request time" do
        %{id: target_id} = insert(@target_type)

        assert_requested(@target_type, [target_id])

        assert %ChecksExecutionRequest{target_type: @target_type, last_requested_at: @now} =
                 Repo.get!(ChecksExecutionRequest, target_id)
      end

      test "should request again the #{target_type}s last requested 5 minutes ago, by default" do
        %{id: due_id} = insert(@target_type)
        requested_at!(@target_type, due_id, ~U[2026-03-02 09:55:00.000000Z])

        %{id: recent_id} = insert(@target_type)
        requested_at!(@target_type, recent_id, ~U[2026-03-02 09:58:00.000000Z])

        assert_requested(@target_type, [due_id])

        assert %ChecksExecutionRequest{last_requested_at: @now} =
                 Repo.get!(ChecksExecutionRequest, due_id)

        assert %ChecksExecutionRequest{last_requested_at: ~U[2026-03-02 09:58:00.000000Z]} =
                 Repo.get!(ChecksExecutionRequest, recent_id)
      end
    end

    test "should request only the targets of the given type" do
      %{id: host_id} = insert(:host)
      %{id: cluster_id} = insert(:cluster)

      assert_requested(:host, [host_id])
      assert_requested(:cluster, [cluster_id])
    end

    test "should request the clusters of every checkable type" do
      cluster_ids =
        for type <- [
              ClusterType.hana_scale_up(),
              ClusterType.hana_scale_out(),
              ClusterType.ascs_ers()
            ] do
          insert(:cluster, type: type).id
        end

      assert_requested(:cluster, cluster_ids)
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

        %{id: due_id} = insert(:host)
        requested_at!(:host, due_id, DateTime.add(@now, -@due_after_seconds))

        %{id: early_id} = insert(:host)
        requested_at!(:host, early_id, DateTime.add(@now, -@due_after_seconds + 1))

        assert_requested(:host, [due_id])
      end
    end

    test "should request nothing when the periodic checks are disabled" do
      insert(:checks_frequency_settings,
        enabled: false,
        frequency: %Frequency{value: 5, unit: :minute}
      )

      insert(:host)
      insert(:cluster)

      assert_requested(:host, [])
      assert_requested(:cluster, [])
    end

    test "should skip deregistered targets, targets without selected checks and clusters that cannot be checked" do
      skipped_ids =
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

      log =
        capture_log(fn ->
          assert_requested(:host, [])
          assert_requested(:cluster, [])
        end)

      for target_id <- skipped_ids, do: refute(log =~ target_id)
    end

    test "should log a failed request and retry it at the next run" do
      %{id: never_requested_id} = insert(:host)

      %{id: requested_id} = insert(:host)
      requested_at!(:host, requested_id, ~U[2026-03-02 09:50:00.000000Z])

      expect(Messaging, :publish, 2, fn Publisher, "executions", %ExecutionRequested{} ->
        {:error, :amqp_error}
      end)

      log =
        capture_log([level: :error], fn ->
          assert :ok = Checks.request_due_executions(:host, DateService.Mock)
        end)

      for host_id <- [never_requested_id, requested_id] do
        assert log =~
                 "Failed to request checks execution, host: #{host_id}, reason: :amqp_error"
      end

      assert nil == Repo.get(ChecksExecutionRequest, never_requested_id)

      assert %ChecksExecutionRequest{last_requested_at: ~U[2026-03-02 09:50:00.000000Z]} =
               Repo.get!(ChecksExecutionRequest, requested_id)

      assert_requested(:host, [never_requested_id, requested_id])
    end
  end

  defp requested_at!(target_type, target_id, last_requested_at) do
    Repo.insert!(%ChecksExecutionRequest{
      target_id: target_id,
      target_type: target_type,
      last_requested_at: last_requested_at
    })
  end

  # Requests the due executions of the given type, expecting one request for each of the
  # given targets only
  defp assert_requested(target_type, expected_target_ids) do
    test_pid = self()

    expect(Messaging, :publish, length(expected_target_ids), fn Publisher,
                                                                "executions",
                                                                %ExecutionRequested{
                                                                  group_id: group_id
                                                                } ->
      send(test_pid, {:execution_requested, group_id})

      :ok
    end)

    assert :ok = Checks.request_due_executions(target_type, DateService.Mock)

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
