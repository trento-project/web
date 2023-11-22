defmodule Trento.Infrastructure.Checks.AMQP.ProcessorTest do
  @moduledoc false
  use ExUnit.Case, async: true
  use TrentoWeb.ChannelCase

  import Mox

  alias Trento.Infrastructure.Checks.AMQP.Processor

  alias Trento.Checks.V1.{
    ExecutionCompleted,
    ExecutionStarted,
    Target
  }

  alias Trento.Contracts

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
      target_type = Faker.Lorem.word()

      targets = [
        %Target{agent_id: "agent_1", checks: ["check_1", "check_2"]},
        %Target{agent_id: "agent_2", checks: ["check_3", "check_2"]}
      ]

      execution_started =
        Contracts.to_event(%ExecutionStarted{
          execution_id: execution_id,
          group_id: group_id,
          targets: targets,
          target_type: target_type
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
                         ],
                         target_type: ^target_type
                       },
                       1000
    end

    test "should process ExecutionCompleted and broadcast to the socket" do
      for target_type <- ["cluster", "host"] do
        execution_id = UUID.uuid4()
        group_id = UUID.uuid4()

        execution_completed =
          Contracts.to_event(%ExecutionCompleted{
            execution_id: execution_id,
            group_id: group_id,
            result: :PASSING,
            target_type: target_type
          })

        message = %GenRMQ.Message{payload: execution_completed, attributes: %{}, channel: nil}

        expect(Trento.Commanded.Mock, :dispatch, fn _, opts ->
          assert [correlation_id: ^execution_id] = opts
          :ok
        end)

        assert :ok = Processor.process(message)

        assert_broadcast "execution_completed",
                         %{group_id: ^group_id, target_type: ^target_type},
                         1000
      end
    end

    test "should return error if the event handling fails" do
      group_id = "invalid-id"
      target_type = "cluster"

      execution_completed =
        Contracts.to_event(%ExecutionCompleted{
          execution_id: UUID.uuid4(),
          group_id: group_id,
          result: :PASSING,
          target_type: target_type
        })

      message = %GenRMQ.Message{payload: execution_completed, attributes: %{}, channel: nil}

      assert_raise RuntimeError,
                   "%{cluster_id: [\"is invalid\"]}",
                   fn -> Processor.process(message) end

      refute_broadcast "checks_execution_completed",
                       %{cluster_id: ^group_id, target_type: ^target_type},
                       1000
    end

    test "should return error if the event cannot be decoded" do
      message = %GenRMQ.Message{payload: "bad-payload", attributes: %{}, channel: nil}
      assert {:error, :decoding_error} = Processor.process(message)
    end
  end
end
