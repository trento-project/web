defmodule Trento.Integration.Checks.Wanda.Messaging.AMQP.ProcessorTest do
  @moduledoc false
  use ExUnit.Case, async: true
  use Trento.DataCase

  import Mock

  alias Trento.Integration.Checks.Wanda.Messaging.AMQP.Processor

  alias Trento.Checks.V1.ExecutionCompleted
  alias Trento.Contracts
  alias Trento.Domain.Commands.CompleteChecksExecutionWanda

  require Trento.Domain.Enums.Health, as: Health

  describe "process" do
    test "should process ExecutionCompleted event" do
      execution_id = UUID.uuid4()
      cluster_id = UUID.uuid4()

      with_mock Trento.Commanded, dispatch: fn _, _ -> :ok end do
        execution_completed = Contracts.to_event(%ExecutionCompleted{
          execution_id: execution_id,
          group_id: cluster_id,
          result: :PASSING
        })
        message = %GenRMQ.Message{payload: execution_completed, attributes: %{}, channel: nil}

        assert :ok = Processor.process(message)

        assert_called Trento.Commanded.dispatch(%CompleteChecksExecutionWanda{
                        cluster_id: cluster_id,
                        health: Health.passing()
                      }, correlation_id: execution_id)
      end
    end
  end
end
