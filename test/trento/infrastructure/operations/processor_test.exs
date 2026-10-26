# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Infrastructure.Operations.AMQP.ProcessorTest do
  @moduledoc false
  use ExUnit.Case, async: true
  use TrentoWeb.ChannelCase

  import Mox

  import Trento.Factory

  alias Trento.Infrastructure.Discovery.AMQP.Publisher
  alias Trento.Infrastructure.Operations.AMQP.Processor

  alias Trento.Operations.V1.{
    OperationCompleted,
    OperationStarted
  }

  alias Trento.ActivityLog.ActivityLog

  alias Trento.Contracts

  alias Trento.Repo

  alias Trento.Discoveries.V1.DiscoveryRequested

  describe "process" do
    setup do
      {:ok, _, _} =
        TrentoWeb.UserSocket
        |> socket("user_id", %{some: :assign})
        |> subscribe_and_join(TrentoWeb.MonitoringChannel, "monitoring:operations")

      :ok
    end

    test "should log the refusal of a scheduled request when another operation runs" do
      %{operation_id: operation_id} =
        operation_completed =
        build(:operation_completed_with_failed_request_v1, error: :ALREADY_RUNNING)

      schedule_id = UUID.uuid4()

      insert(:activity_log_entry,
        type: "scheduled_operation_requested",
        metadata: %{
          "operation_id" => operation_id,
          "schedule_id" => schedule_id,
          "correlation_id" => schedule_id
        }
      )

      message = %GenRMQ.Message{
        payload: Contracts.to_event(operation_completed),
        attributes: %{},
        channel: nil
      }

      assert :ok = Processor.process(message)

      assert %ActivityLog{metadata: %{"reason" => "already_running"}} =
               Repo.get_by!(ActivityLog, type: "scheduled_operation_request_failed")
    end

    test "should process OperationStarted and broadcast to the socket" do
      operation_id = UUID.uuid4()
      group_id = UUID.uuid4()

      operation_started =
        Contracts.to_event(%OperationStarted{
          operation_id: operation_id,
          group_id: group_id,
          operation_type: Faker.Lorem.word(),
          targets: []
        })

      message = %GenRMQ.Message{payload: operation_started, attributes: %{}, channel: nil}

      assert :ok = Processor.process(message)

      assert_broadcast "operation_started",
                       %{
                         operation_id: ^operation_id,
                         group_id: ^group_id,
                         operation_type: :unknown
                       },
                       1000
    end

    test "should process OperationCompleted and broadcast to the socket" do
      operation_id = UUID.uuid4()
      group_id = UUID.uuid4()

      operation_completed =
        Contracts.to_event(%OperationCompleted{
          operation_id: operation_id,
          group_id: group_id,
          operation_type: Faker.Lorem.word(),
          result: :UPDATED
        })

      message = %GenRMQ.Message{payload: operation_completed, attributes: %{}, channel: nil}

      assert :ok = Processor.process(message)

      assert 1 == ActivityLog |> Repo.all() |> length()

      assert_broadcast "operation_completed",
                       %{
                         operation_id: ^operation_id,
                         group_id: ^group_id,
                         operation_type: :unknown,
                         result: :UPDATED
                       },
                       1000
    end

    test "should return error if the event cannot be decoded" do
      message = %GenRMQ.Message{payload: "bad-payload", attributes: %{}, channel: nil}
      assert {:error, :decoding_error} = Processor.process(message)
    end
  end

  describe "requesting discovery upon operation completion" do
    for {operation, _} = saptune_operation_scenario <- [
          {"saptune_solution_apply", "saptuneapplysolution@v1"},
          {"saptune_solution_change", "saptunechangesolution@v1"}
        ] do
      @saptune_operation_scenario saptune_operation_scenario

      test "should request saptune discovery request when '#{operation}' operation is completed" do
        operation_id = UUID.uuid4()
        group_id = UUID.uuid4()
        {_, operator} = @saptune_operation_scenario

        operation_completed =
          Contracts.to_event(%OperationCompleted{
            operation_id: operation_id,
            group_id: group_id,
            operation_type: operator,
            result: :UPDATED
          })

        discovery_requested = %DiscoveryRequested{
          discovery_type: "saptune_discovery",
          targets: [group_id]
        }

        expect(
          Trento.Infrastructure.Messaging.Adapter.Mock,
          :publish,
          fn Publisher, "agents", ^discovery_requested ->
            :ok
          end
        )

        message = %GenRMQ.Message{payload: operation_completed, attributes: %{}, channel: nil}

        assert :ok = Processor.process(message)

        assert 1 == ActivityLog |> Repo.all() |> length()
      end
    end

    test "should request ha cluster discovery request when cluster_maintenance_change operation is completed" do
      operation_id = UUID.uuid4()
      %{id: cluster_id} = insert(:cluster)
      [%{id: host_id_1}, %{id: host_id_2}] = insert_list(2, :host, cluster_id: cluster_id)

      operation_completed =
        Contracts.to_event(%OperationCompleted{
          operation_id: operation_id,
          group_id: cluster_id,
          operation_type: "clustermaintenancechange@v1",
          result: :UPDATED
        })

      discovery_requested = %DiscoveryRequested{
        discovery_type: "ha_cluster_discovery",
        targets: [host_id_1, host_id_2]
      }

      expect(
        Trento.Infrastructure.Messaging.Adapter.Mock,
        :publish,
        fn Publisher, "agents", ^discovery_requested ->
          :ok
        end
      )

      message = %GenRMQ.Message{payload: operation_completed, attributes: %{}, channel: nil}

      assert :ok = Processor.process(message)

      assert 1 == ActivityLog |> Repo.all() |> length()
    end

    for {operation, _} = pacemaker_operation_scenario <- [
          {"pacemaker_enable", "pacemakerenable@v1"},
          {"pacemaker_disable", "pacemakerdisable@v1"}
        ] do
      @pacemaker_operation_scenario pacemaker_operation_scenario

      test "should request saptune discovery request when '#{operation}' operation is completed" do
        operation_id = UUID.uuid4()
        %{id: cluster_id} = insert(:cluster)
        [%{id: host_id_1}, %{id: host_id_2}] = insert_list(2, :host, cluster_id: cluster_id)

        {_, operator} = @pacemaker_operation_scenario

        operation_completed =
          Contracts.to_event(%OperationCompleted{
            operation_id: operation_id,
            group_id: cluster_id,
            operation_type: operator,
            result: :UPDATED
          })

        discovery_requested = %DiscoveryRequested{
          discovery_type: "host_discovery",
          targets: [host_id_1, host_id_2]
        }

        expect(
          Trento.Infrastructure.Messaging.Adapter.Mock,
          :publish,
          fn Publisher, "agents", ^discovery_requested ->
            :ok
          end
        )

        message = %GenRMQ.Message{payload: operation_completed, attributes: %{}, channel: nil}

        assert :ok = Processor.process(message)

        assert 1 == ActivityLog |> Repo.all() |> length()
      end
    end
  end
end
