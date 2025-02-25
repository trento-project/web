defmodule Trento.Infrastructure.Operations.AMQP.ProcessorTest do
  @moduledoc false
  use ExUnit.Case, async: true
  use TrentoWeb.ChannelCase

  alias Trento.Infrastructure.Operations.AMQP.Processor

  alias Trento.Operations.V1.{
    OperationCompleted,
    OperationStarted
  }

  alias Trento.Contracts

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

      assert_broadcast "operation_completed",
                       %{
                         operation_id: ^operation_id,
                         group_id: ^group_id,
                         operation_type: :unknown,
                         result: :UPDATED
                       },
                       1000
    end

    test "should map operation_type properly do" do
      operations = [
        %{
          incoming_operation: "saptuneapplysolution@v1",
          outgoing_operation: :saptune_solution_apply
        }
      ]

      for %{incoming_operation: incoming, outgoing_operation: outgoing} <- operations do
        operation_completed =
          Contracts.to_event(%OperationCompleted{
            operation_id: UUID.uuid4(),
            group_id: UUID.uuid4(),
            operation_type: incoming,
            result: :UPDATED
          })

        message = %GenRMQ.Message{payload: operation_completed, attributes: %{}, channel: nil}

        assert :ok = Processor.process(message)

        assert_broadcast "operation_completed", %{operation_type: ^outgoing}, 1000
      end
    end

    test "should return error if the event cannot be decoded" do
      message = %GenRMQ.Message{payload: "bad-payload", attributes: %{}, channel: nil}
      assert {:error, :decoding_error} = Processor.process(message)
    end
  end
end
