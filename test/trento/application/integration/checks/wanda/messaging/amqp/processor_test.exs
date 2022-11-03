defmodule Trento.Integration.Checks.Wanda.Messaging.AMQP.ProcessorTest do
  @moduledoc false
  use ExUnit.Case, async: true
  use Trento.DataCase

  import Mox

  alias Trento.Integration.Checks.Wanda.Messaging.AMQP.Processor

  alias Trento.Checks.V1.ExecutionCompleted
  alias Trento.Contracts

  describe "process" do
    test "should process valid event and dispatch command" do
      execution_completed =
        Contracts.to_event(%ExecutionCompleted{
          execution_id: UUID.uuid4(),
          group_id: UUID.uuid4(),
          result: :PASSING
        })

      message = %GenRMQ.Message{payload: execution_completed, attributes: %{}, channel: nil}
      command = "some-command"
      opts = [correlation_id: UUID.uuid4()]

      expect(Trento.Integration.Checks.Wanda.Policy.Mock, :handle, fn _ ->
        {:ok, command, opts}
      end)

      expect(Trento.Commanded.Mock, :dispatch, fn expected_command, expected_opts ->
        assert ^expected_command = command
        assert ^expected_opts = opts
        :ok
      end)

      assert :ok = Processor.process(message)
    end

    test "should return error if the event handling fails" do
      execution_completed =
        Contracts.to_event(%ExecutionCompleted{
          execution_id: UUID.uuid4(),
          group_id: UUID.uuid4(),
          result: :PASSING
        })

      message = %GenRMQ.Message{payload: execution_completed, attributes: %{}, channel: nil}

      expect(Trento.Integration.Checks.Wanda.Policy.Mock, :handle, fn _ ->
        {:error, :handling_error}
      end)

      assert {:error, :handling_error} = Processor.process(message)
    end

    @tag capture_log: true
    test "should return error if the event cannot be decoded" do
      message = %GenRMQ.Message{payload: "bad-payload", attributes: %{}, channel: nil}
      assert {:error, :decoding_error} = Processor.process(message)
    end
  end
end
