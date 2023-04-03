defmodule Trento.Integration.Checks.AMQP.ProcessorTest do
  @moduledoc false
  use ExUnit.Case, async: true
  use TrentoWeb.ChannelCase

  import Mox

  alias Trento.Integration.Checks.AMQP.Processor

  alias Trento.Checks.V1.{
    ExecutionCompleted,
    ExecutionStarted,
    Target
  }

  alias Trento.Contracts
  alias Trento.Domain.Commands.CompleteChecksExecution

  require Trento.Domain.Enums.Health, as: Health

  describe "process" do
    setup do
      {:ok, _, _} =
        TrentoWeb.UserSocket
        |> socket("user_id", %{some: :assign})
        |> subscribe_and_join(TrentoWeb.MonitoringChannel, "monitoring:executions")

      :ok
    end

    test "should process ExecutionStarted and broadcast to the socket" do
      execution_id = UUID.uuid4()
      group_id = UUID.uuid4()

      targets = [
        %Target{agent_id: "agent_1", checks: ["check_1", "check_2"]},
        %Target{agent_id: "agent_2", checks: ["check_3", "check_2"]}
      ]

      execution_started =
        Contracts.to_event(%ExecutionStarted{
          execution_id: execution_id,
          group_id: group_id,
          targets: targets
        })

      message = %GenRMQ.Message{payload: execution_started, attributes: %{}, channel: nil}

      assert :ok = Processor.process(message)

      assert_broadcast "execution_started",
                       %{
                         group_id: ^group_id,
                         execution_id: ^execution_id,
                         targets: [
                           %{agent_id: "agent_1", checks: ["check_1", "check_2"]},
                           %{agent_id: "agent_2", checks: ["check_3", "check_2"]}
                         ]
                       },
                       1000
    end

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
        assert %CompleteChecksExecution{
                 cluster_id: ^group_id,
                 health: Health.passing()
               } = command

        assert [correlation_id: ^execution_id] = opts
        :ok
      end)

      assert :ok = Processor.process(message)
      assert_broadcast "execution_completed", %{group_id: ^group_id}, 1000
    end

    test "should return error if the event handling fails" do
      group_id = "invalid-id"

      execution_completed =
        Contracts.to_event(%ExecutionCompleted{
          execution_id: UUID.uuid4(),
          group_id: group_id,
          result: :PASSING
        })

      message = %GenRMQ.Message{payload: execution_completed, attributes: %{}, channel: nil}

      assert_raise RuntimeError,
                   "%{cluster_id: [\"is invalid\"]}",
                   fn -> Processor.process(message) end

      refute_broadcast "checks_execution_completed", %{cluster_id: ^group_id}, 1000
    end

    test "should return error if the event cannot be decoded" do
      message = %GenRMQ.Message{payload: "bad-payload", attributes: %{}, channel: nil}
      assert {:error, :decoding_error} = Processor.process(message)
    end
  end
end
