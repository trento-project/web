defmodule Trento.Infrastructure.Operations.AMQP.ProcessorTest do
  @moduledoc false
  use ExUnit.Case, async: true
  use TrentoWeb.ChannelCase

  import Mox

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

    test "should request saptune discovery request when saptune_solution_apply operation is completed" do
      operation_id = UUID.uuid4()
      group_id = UUID.uuid4()

      operation_completed =
        Contracts.to_event(%OperationCompleted{
          operation_id: operation_id,
          group_id: group_id,
          operation_type: "saptuneapplysolution@v1",
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
end
