defmodule Trento.Infrastructure.Checks.ChecksTest do
  @moduledoc false

  use ExUnit.Case

  import Mox

  alias Trento.Clusters.Commands.CompleteChecksExecution
  alias Trento.Hosts.Commands.CompleteHostChecksExecution

  alias Trento.Infrastructure.Checks

  alias Trento.Checks.V1.{
    ExecutionRequested,
    Target
  }

  alias Trento.Infrastructure.Checks.AMQP.Publisher

  require Trento.Enums.Health, as: Health

  describe "Cluster Checks Execution" do
    test "should publish an ExecutionRequested event for a cluster" do
      execution_id = UUID.uuid4()
      group_id = UUID.uuid4()

      env = %Checks.ClusterExecutionEnv{
        cluster_type: :hana_scale_up,
        provider: :azure,
        architecture_type: :classic
      }

      selected_checks = ["check_1", "check_2"]

      hosts = [
        %{host_id: "agent_1"},
        %{host_id: "agent_2"}
      ]

      expect(Trento.Infrastructure.Messaging.Adapter.Mock, :publish, fn Publisher,
                                                                        "executions",
                                                                        event ->
        assert %ExecutionRequested{
                 execution_id: ^execution_id,
                 group_id: ^group_id,
                 targets: [
                   %Target{agent_id: "agent_1", checks: ^selected_checks},
                   %Target{agent_id: "agent_2", checks: ^selected_checks}
                 ],
                 env: %{
                   "cluster_type" => %{kind: {:string_value, "hana_scale_up"}},
                   "provider" => %{kind: {:string_value, "azure"}},
                   "architecture_type" => %{kind: {:string_value, "classic"}}
                 },
                 target_type: "cluster"
               } = event

        :ok
      end)

      assert :ok =
               Checks.request_execution(
                 execution_id,
                 group_id,
                 env,
                 hosts,
                 selected_checks,
                 :cluster
               )
    end

    test "should complete a cluster checks execution" do
      execution_id = UUID.uuid4()
      group_id = UUID.uuid4()

      expect(Trento.Commanded.Mock, :dispatch, fn command, _ ->
        assert %CompleteChecksExecution{
                 cluster_id: ^group_id,
                 health: Health.passing()
               } = command

        :ok
      end)

      assert :ok =
               Checks.complete_execution(
                 execution_id,
                 group_id,
                 :passing,
                 :cluster
               )
    end
  end

  describe "Host Checks Execution" do
    test "should publish an ExecutionRequested event for a host" do
      execution_id = UUID.uuid4()
      group_id = UUID.uuid4()

      env = %Checks.HostExecutionEnv{
        provider: :azure,
        arch: :x86_64
      }

      selected_checks = ["check_1", "check_2"]

      expect(Trento.Infrastructure.Messaging.Adapter.Mock, :publish, fn Publisher,
                                                                        "executions",
                                                                        event ->
        assert %ExecutionRequested{
                 execution_id: ^execution_id,
                 group_id: ^group_id,
                 targets: [
                   %Target{agent_id: ^group_id, checks: ^selected_checks}
                 ],
                 env: %{
                   "provider" => %{kind: {:string_value, "azure"}},
                   "arch" => %{kind: {:string_value, "x86_64"}}
                 },
                 target_type: "host"
               } = event

        :ok
      end)

      assert :ok =
               Checks.request_execution(
                 execution_id,
                 group_id,
                 env,
                 [%{host_id: group_id}],
                 selected_checks,
                 :host
               )
    end

    test "should complete a host checks execution" do
      execution_id = UUID.uuid4()
      group_id = UUID.uuid4()

      expect(Trento.Commanded.Mock, :dispatch, fn command, _ ->
        assert %CompleteHostChecksExecution{
                 host_id: ^group_id,
                 health: Health.passing()
               } = command

        :ok
      end)

      assert :ok =
               Checks.complete_execution(
                 execution_id,
                 group_id,
                 :passing,
                 :host
               )
    end
  end

  describe "Unsupported targets" do
    test "should return an error when trying to start execution for an unsupported target type" do
      assert {:error, :target_not_supported} =
               Checks.request_execution(
                 Faker.UUID.v4(),
                 Faker.UUID.v4(),
                 %{some: "env"},
                 [%{host_id: Faker.UUID.v4()}],
                 [Faker.Lorem.word()],
                 :other_target_type
               )
    end

    test "should return an error when trying to complete execution for an unsupported target type" do
      assert {:error, :target_not_supported} =
               Checks.complete_execution(
                 Faker.UUID.v4(),
                 Faker.UUID.v4(),
                 :passing,
                 :other_target_type
               )
    end
  end
end
