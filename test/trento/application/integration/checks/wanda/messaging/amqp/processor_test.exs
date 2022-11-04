defmodule Trento.Integration.Checks.Wanda.Messaging.AMQP.ProcessorTest do
  @moduledoc false
  use ExUnit.Case, async: true
  use Trento.DataCase

  import Mox

  alias Trento.Integration.Checks.Wanda.Messaging.AMQP.Processor

  alias Trento.Checks.V1.ExecutionCompleted
  alias Trento.Contracts
  alias Trento.Domain.Commands.CompleteChecksExecutionWanda

  require Trento.Domain.Enums.Health, as: Health

  describe "process" do
    test "should process ExecutionCompleted and dispatch command" do
      execution_id = UUID.uuid4()
      group_id = UUID.uuid4()

      execution_completed =
        Contracts.to_event(%ExecutionCompleted{
          execution_id: execution_id,
          group_id: group_id,
          result: :PASSING
        })

      message = %GenRMQ.Message{payload: execution_completed, attributes: %{}, channel: nil}

      expect(Trento.Commanded.Mock, :dispatch, fn command, opts ->
        assert %CompleteChecksExecutionWanda{
                 cluster_id: ^group_id,
                 health: Health.passing()
               } = command

        assert [correlation_id: ^execution_id] = opts
        :ok
      end)

      assert :ok = Processor.process(message)
    end

    test "should return error if the event handling fails" do
      execution_completed =
        Contracts.to_event(%ExecutionCompleted{
          execution_id: UUID.uuid4(),
          group_id: "invalid-id",
          result: :PASSING
        })

      message = %GenRMQ.Message{payload: execution_completed, attributes: %{}, channel: nil}

      assert_raise RuntimeError,
                   "%{cluster_id: [\"is invalid\"]}",
                   fn -> Processor.process(message) end
    end

    @tag capture_log: true
    test "should return error if the event cannot be decoded" do
      message = %GenRMQ.Message{payload: "bad-payload", attributes: %{}, channel: nil}
      assert {:error, :decoding_error} = Processor.process(message)
    end
  end
end
