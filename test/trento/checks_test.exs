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
  alias Trento.Checks.TargetSettings
  alias Trento.Checks.V1.ExecutionRequested
  alias Trento.Infrastructure.Checks.AMQP.Publisher
  alias Trento.Infrastructure.Messaging.Adapter.Mock, as: Messaging
  alias Trento.Settings.ChecksFrequencySettings
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
        %{id: target_id} = insert_target(@target_type)

        assert_requested(@target_type, [target_id])

        assert %ChecksExecutionRequest{target_type: @target_type, last_requested_at: @now} =
                 Repo.get!(ChecksExecutionRequest, target_id)
      end

      test "should request again the #{target_type}s last requested 5 minutes ago, by default" do
        %{id: due_id} = insert_target(@target_type)

        insert(:checks_execution_request,
          target_type: @target_type,
          target_id: due_id,
          last_requested_at: ~U[2026-03-02 09:55:00.000000Z]
        )

        %{id: recent_id} = insert_target(@target_type)

        insert(:checks_execution_request,
          target_type: @target_type,
          target_id: recent_id,
          last_requested_at: ~U[2026-03-02 09:58:00.000000Z]
        )

        assert_requested(@target_type, [due_id])

        assert %ChecksExecutionRequest{last_requested_at: @now} =
                 Repo.get!(ChecksExecutionRequest, due_id)

        assert %ChecksExecutionRequest{last_requested_at: ~U[2026-03-02 09:58:00.000000Z]} =
                 Repo.get!(ChecksExecutionRequest, recent_id)
      end

      test "should publish the periodic request of a #{target_type}" do
        :ok = Checks.subscribe_to_events()
        %{id: target_id} = insert_target(@target_type)

        assert_requested(@target_type, [target_id])

        assert_receive {:checks_execution_requested, @target_type, ^target_id,
                        ~U[2026-03-02 10:00:00.000000Z]}
      end

      test "should not publish a failed request of a #{target_type}" do
        :ok = Checks.subscribe_to_events()
        %{id: target_id} = insert_target(@target_type)

        expect(Messaging, :publish, fn _, _, _ -> {:error, :boom} end)

        capture_log(fn ->
          assert :ok = Checks.request_due_executions(@target_type, DateService.Mock)
        end)

        refute_receive {:checks_execution_requested, _, ^target_id, _}
      end

      test "should request the #{target_type}s with an own frequency at that frequency" do
        insert(:checks_frequency_settings,
          enabled: true,
          frequency: %Frequency{value: 5, unit: :minute}
        )

        %{id: hourly_id} = insert_target(@target_type)

        insert(:checks_target_settings,
          target_type: @target_type,
          target_id: hourly_id,
          frequency: %Frequency{value: 1, unit: :hour}
        )

        insert(:checks_execution_request,
          target_type: @target_type,
          target_id: hourly_id,
          last_requested_at: ~U[2026-03-02 09:30:00.000000Z]
        )

        %{id: due_id} = insert_target(@target_type)

        insert(:checks_execution_request,
          target_type: @target_type,
          target_id: due_id,
          last_requested_at: ~U[2026-03-02 09:30:00.000000Z]
        )

        assert_requested(@target_type, [due_id])
      end

      test "should request the enabled #{target_type}s while the global settings are disabled" do
        insert(:checks_frequency_settings,
          enabled: false,
          frequency: %Frequency{value: 5, unit: :minute}
        )

        %{id: own_id} = insert_target(@target_type)

        insert(:checks_target_settings,
          target_type: @target_type,
          target_id: own_id,
          enabled: true
        )

        insert_target(@target_type)

        assert_requested(@target_type, [own_id])
      end

      test "should request the enabled #{target_type}s while the global settings are disabled from the environment" do
        previous = Application.get_env(:trento, :checks_frequency)
        Application.put_env(:trento, :checks_frequency, :disabled)
        on_exit(fn -> Application.put_env(:trento, :checks_frequency, previous) end)

        %{id: own_id} = insert_target(@target_type)

        insert(:checks_target_settings,
          target_type: @target_type,
          target_id: own_id,
          enabled: true
        )

        insert_target(@target_type)

        assert_requested(@target_type, [own_id])
      end

      test "should request the #{target_type}s with an own frequency more frequent than the global one" do
        insert(:checks_frequency_settings,
          enabled: true,
          frequency: %Frequency{value: 1, unit: :hour}
        )

        %{id: frequent_id} = insert_target(@target_type)

        insert(:checks_target_settings,
          target_type: @target_type,
          target_id: frequent_id,
          frequency: %Frequency{value: 5, unit: :minute}
        )

        insert(:checks_execution_request,
          target_type: @target_type,
          target_id: frequent_id,
          last_requested_at: ~U[2026-03-02 09:50:00.000000Z]
        )

        %{id: global_id} = insert_target(@target_type)

        insert(:checks_execution_request,
          target_type: @target_type,
          target_id: global_id,
          last_requested_at: ~U[2026-03-02 09:50:00.000000Z]
        )

        assert_requested(@target_type, [frequent_id])
      end

      test "should skip the #{target_type}s with disabled settings while the global ones are enabled" do
        %{id: off_id} = insert_target(@target_type)

        insert(:checks_target_settings,
          target_type: @target_type,
          target_id: off_id,
          enabled: false
        )

        %{id: on_id} = insert_target(@target_type)

        assert_requested(@target_type, [on_id])
      end
    end

    test "should store the time of each request, not the start of the run" do
      %{id: host_id} = insert(:host)

      expect(DateService.Mock, :utc_now, fn -> @now end)
      expect(DateService.Mock, :utc_now, fn -> ~U[2026-03-02 10:00:40.000000Z] end)

      assert_requested(:host, [host_id])

      assert %ChecksExecutionRequest{last_requested_at: ~U[2026-03-02 10:00:40.000000Z]} =
               Repo.get!(ChecksExecutionRequest, host_id)
    end

    test "should request only the targets of the given type" do
      %{id: host_id} = insert(:host)
      %{id: cluster_id} = insert_target(:cluster)

      assert_requested(:host, [host_id])
      assert_requested(:cluster, [cluster_id])
    end

    test "should request an execution for a cluster only once one of its hosts is registered" do
      %{id: cluster_id} = insert(:cluster)
      insert(:host, cluster_id: cluster_id, selected_checks: [], deregistered_at: @now)

      assert_requested(:cluster, [])

      insert(:host, cluster_id: cluster_id, selected_checks: [])

      assert_requested(:cluster, [cluster_id])
    end

    test "should request the clusters of every checkable type" do
      cluster_ids =
        for type <- [
              ClusterType.hana_scale_up(),
              ClusterType.hana_scale_out(),
              ClusterType.ascs_ers()
            ] do
          insert_target(:cluster, type: type).id
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

        insert(:checks_execution_request,
          target_type: :host,
          target_id: due_id,
          last_requested_at: DateTime.add(@now, -@due_after_seconds)
        )

        %{id: early_id} = insert(:host)

        insert(:checks_execution_request,
          target_type: :host,
          target_id: early_id,
          last_requested_at: DateTime.add(@now, -@due_after_seconds + 1)
        )

        assert_requested(:host, [due_id])
      end
    end

    test "should request nothing when the periodic checks are disabled" do
      insert(:checks_frequency_settings,
        enabled: false,
        frequency: %Frequency{value: 5, unit: :minute}
      )

      insert(:host)
      insert_target(:cluster)

      assert_requested(:host, [])
      assert_requested(:cluster, [])
    end

    test "should skip deregistered targets, targets without selected checks and clusters that cannot be checked" do
      skipped_ids =
        Enum.map(
          [
            insert(:host, deregistered_at: @now),
            insert_target(:cluster, deregistered_at: @now),
            insert(:host, selected_checks: []),
            insert_target(:cluster, selected_checks: []),
            insert_target(:cluster, type: ClusterType.unknown())
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

      insert(:checks_execution_request,
        target_type: :host,
        target_id: requested_id,
        last_requested_at: ~U[2026-03-02 09:50:00.000000Z]
      )

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
        insert(:checks_execution_request,
          target_type: target_type,
          target_id: target_id,
          last_requested_at: @now
        )
      end

      assert 4 == Checks.delete_stale_execution_requests()

      assert Enum.sort([registered_host_id, unchecked_host_id, registered_cluster_id]) ==
               ChecksExecutionRequest |> Repo.all() |> Enum.map(& &1.target_id) |> Enum.sort()
    end

    test "should keep the requests made since the clean up started" do
      %{id: host_id} = insert(:host, deregistered_at: @now)
      insert(:checks_execution_request, target_id: host_id, last_requested_at: @now)

      assert 0 == Checks.delete_stale_execution_requests(DateService.Mock)
      assert [%ChecksExecutionRequest{target_id: ^host_id}] = Repo.all(ChecksExecutionRequest)
    end
  end

  describe "the due rule" do
    @five_minutes %{enabled: true, frequency: %Frequency{value: 5, unit: :minute}}

    for {name, effective, last_requested_at, now, due, next} <- [
          {"disabled settings", %{enabled: false, frequency: %Frequency{value: 5, unit: :minute}},
           ~U[2026-03-02 09:00:00.000000Z], ~U[2026-03-02 10:00:00.000000Z], false, nil},
          {"global settings disabled from the environment", %{enabled: false, frequency: nil},
           nil, ~U[2026-03-02 10:00:00.000000Z], false, nil},
          {"never requested", @five_minutes, nil, ~U[2026-03-02 10:00:20.000000Z], true,
           ~U[2026-03-02 10:01:00.000000Z]},
          {"299.993 seconds elapsed, due thanks to the tolerance", @five_minutes,
           ~U[2026-03-02 10:00:00.312000Z], ~U[2026-03-02 10:05:00.305000Z], true,
           ~U[2026-03-02 10:06:00.000000Z]},
          {"not yet due", @five_minutes, ~U[2026-03-02 10:00:00.312000Z],
           ~U[2026-03-02 10:03:00.000000Z], false, ~U[2026-03-02 10:05:00.000000Z]},
          {"a run late in the minute, due earlier in that minute", @five_minutes,
           ~U[2026-03-02 10:00:40.000000Z], ~U[2026-03-02 10:05:40.000000Z], true,
           ~U[2026-03-02 10:06:00.000000Z]},
          {"never requested, now on a full minute", @five_minutes, nil,
           ~U[2026-03-02 10:00:00.000000Z], true, ~U[2026-03-02 10:00:00.000000Z]},
          {"hours", %{enabled: true, frequency: %Frequency{value: 6, unit: :hour}},
           ~U[2026-03-02 05:00:00.000000Z], ~U[2026-03-02 10:00:00.000000Z], false,
           ~U[2026-03-02 11:00:00.000000Z]},
          {"weeks", %{enabled: true, frequency: %Frequency{value: 1, unit: :week}},
           ~U[2026-03-02 10:00:00.000000Z], ~U[2026-03-05 10:00:00.000000Z], false,
           ~U[2026-03-09 10:00:00.000000Z]}
        ] do
      @effective effective
      @last_requested_at last_requested_at
      @now_of_row now
      @due due
      @next next

      test "should decide and plan the execution with #{name}" do
        due_at = Checks.due_at(@effective, @last_requested_at)

        assert @due == Checks.due?(due_at, @now_of_row)
        assert @next == Checks.next_execution_at(due_at, @now_of_row)
      end
    end
  end

  describe "the checks schedule of a target" do
    test "should return the global schedule of a host never requested" do
      %{id: host_id} = insert(:host)

      assert {:ok,
              %{
                enabled: true,
                frequency: %Frequency{value: 5, unit: :minute},
                global: true,
                next_execution_at: @now
              }} == Checks.get_checks_schedule(:host, host_id, DateService.Mock)
    end

    test "should return the own schedule of a cluster" do
      %{id: cluster_id} = insert_target(:cluster)

      insert(:checks_target_settings,
        target_type: :cluster,
        target_id: cluster_id,
        frequency: %Frequency{value: 6, unit: :hour}
      )

      insert(:checks_execution_request,
        target_type: :cluster,
        target_id: cluster_id,
        last_requested_at: ~U[2026-03-02 09:00:00.000000Z]
      )

      assert {:ok,
              %{
                enabled: true,
                frequency: %Frequency{value: 6, unit: :hour},
                global: false,
                next_execution_at: ~U[2026-03-02 15:00:00.000000Z]
              }} == Checks.get_checks_schedule(:cluster, cluster_id, DateService.Mock)
    end

    test "should plan no execution for a target without selected checks" do
      %{id: host_id} = insert(:host, selected_checks: [])

      assert {:ok, %{next_execution_at: nil}} =
               Checks.get_checks_schedule(:host, host_id, DateService.Mock)
    end

    test "should plan no execution for a cluster of a type that is not checkable" do
      %{id: cluster_id} = insert_target(:cluster, type: ClusterType.unknown())

      assert {:ok, %{next_execution_at: nil}} =
               Checks.get_checks_schedule(:cluster, cluster_id, DateService.Mock)
    end

    test "should plan no execution for a cluster without registered hosts" do
      %{id: cluster_id} = insert(:cluster)

      assert {:ok, %{next_execution_at: nil}} =
               Checks.get_checks_schedule(:cluster, cluster_id, DateService.Mock)
    end

    test "should follow the global settings disabled from the environment, unless the target has its own" do
      previous = Application.get_env(:trento, :checks_frequency)
      Application.put_env(:trento, :checks_frequency, :disabled)
      on_exit(fn -> Application.put_env(:trento, :checks_frequency, previous) end)

      %{id: own_id} = insert(:host)
      insert(:checks_target_settings, target_type: :host, target_id: own_id, enabled: true)
      %{id: global_id} = insert(:host)

      assert {:ok, %{enabled: true, global: false, next_execution_at: @now}} =
               Checks.get_checks_schedule(:host, own_id, DateService.Mock)

      assert {:ok, %{enabled: false, frequency: nil, global: true, next_execution_at: nil}} ==
               Checks.get_checks_schedule(:host, global_id, DateService.Mock)
    end

    test "should not find a deregistered or unknown target" do
      %{id: deregistered_id} = insert(:host, deregistered_at: @now)

      for target_id <- [deregistered_id, Faker.UUID.v4()] do
        assert {:error, :not_found} =
                 Checks.get_checks_schedule(:host, target_id, DateService.Mock)

        assert {:error, :not_found} =
                 Checks.put_checks_schedule(
                   :host,
                   target_id,
                   %{enabled: true, frequency: %{value: 1, unit: :hour}},
                   DateService.Mock
                 )

        assert {:error, :not_found} =
                 Checks.delete_checks_schedule(:host, target_id, DateService.Mock)
      end
    end

    test "should store the own schedule, and delete it to follow the global settings" do
      %{id: host_id} = insert(:host)

      assert {:ok, %{enabled: true, frequency: %Frequency{value: 6, unit: :hour}, global: false}} =
               Checks.put_checks_schedule(
                 :host,
                 host_id,
                 %{enabled: true, frequency: %{value: 6, unit: :hour}},
                 DateService.Mock
               )

      for _ <- 1..2 do
        assert {:ok,
                %{enabled: true, frequency: %Frequency{value: 5, unit: :minute}, global: true}} =
                 Checks.delete_checks_schedule(:host, host_id, DateService.Mock)
      end
    end

    test "should refuse an own schedule with a frequency that is not allowed" do
      %{id: host_id} = insert(:host)

      assert {:error, %Ecto.Changeset{}} =
               Checks.put_checks_schedule(
                 :host,
                 host_id,
                 %{enabled: true, frequency: %{value: 2, unit: :hour}},
                 DateService.Mock
               )
    end

    test "should store the own schedule of a cluster of a type that is not checkable" do
      %{id: cluster_id} = insert_target(:cluster, type: ClusterType.unknown())

      assert {:ok, %{global: false, next_execution_at: nil}} =
               Checks.put_checks_schedule(
                 :cluster,
                 cluster_id,
                 %{enabled: true, frequency: %{value: 1, unit: :hour}},
                 DateService.Mock
               )
    end
  end

  describe "target settings" do
    test "should store, replace and delete the settings of a target" do
      target_id = Faker.UUID.v4()

      assert {:ok, %TargetSettings{enabled: true, frequency: %Frequency{value: 1, unit: :hour}}} =
               Checks.put_target_settings(:host, target_id, %{
                 enabled: true,
                 frequency: %{value: 1, unit: :hour}
               })

      assert {:ok, %TargetSettings{enabled: false, frequency: %Frequency{value: 6, unit: :hour}}} =
               Checks.put_target_settings(:host, target_id, %{
                 enabled: false,
                 frequency: %{value: 6, unit: :hour}
               })

      assert %TargetSettings{
               target_type: :host,
               enabled: false,
               frequency: %Frequency{value: 6, unit: :hour}
             } = Checks.get_target_settings(target_id)

      assert :ok = Checks.delete_target_settings(target_id)
      assert nil == Checks.get_target_settings(target_id)
    end

    test "should refuse a frequency that is not allowed" do
      assert {:error, %Ecto.Changeset{}} =
               Checks.put_target_settings(:host, Faker.UUID.v4(), %{
                 enabled: true,
                 frequency: %{value: 2, unit: :hour}
               })
    end

    test "should use the settings of the target, or else the global ones" do
      global = %ChecksFrequencySettings{enabled: false, frequency: nil, enforced_from_env: true}

      own =
        build(:checks_target_settings,
          enabled: true,
          frequency: %Frequency{value: 6, unit: :hour}
        )

      assert %{enabled: true, frequency: %Frequency{value: 6, unit: :hour}} =
               Checks.effective_settings(own, global)

      assert %{enabled: false, frequency: nil} = Checks.effective_settings(nil, global)
    end
  end

  # A cluster gets a registered host, without selected checks so that it is not a due host
  defp insert_target(target_type, attrs \\ [])

  defp insert_target(:host, attrs), do: insert(:host, attrs)

  defp insert_target(:cluster, attrs) do
    cluster = insert(:cluster, attrs)
    insert(:host, cluster_id: cluster.id, selected_checks: [])

    cluster
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
