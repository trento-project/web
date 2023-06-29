defmodule Trento.Integration.ChecksTest do
  @moduledoc false

  use ExUnit.Case

  import Mox

  alias Trento.Integration.Checks

  alias Trento.Checks.V1.{
    ExecutionRequested,
    Target
  }

  test "should publish an ExecutionRequested event with cluster env" do
    execution_id = UUID.uuid4()
    group_id = UUID.uuid4()

    env = %Checks.ClusterExecutionEnv{
      cluster_type: :hana_scale_up,
      provider: :azure
    }

    selected_checks = ["check_1", "check_2"]

    hosts = [
      %{host_id: "agent_1"},
      %{host_id: "agent_2"}
    ]

    expect(Trento.Infrastructure.Messaging.Adapter.Mock, :publish, fn "executions", event ->
      assert %ExecutionRequested{
               execution_id: ^execution_id,
               group_id: ^group_id,
               targets: [
                 %Target{agent_id: "agent_1", checks: ^selected_checks},
                 %Target{agent_id: "agent_2", checks: ^selected_checks}
               ],
               env: %{
                 "cluster_type" => %{kind: {:string_value, "hana_scale_up"}},
                 "provider" => %{kind: {:string_value, "azure"}}
               }
             } = event

      :ok
    end)

    assert :ok =
             Checks.request_execution(
               execution_id,
               group_id,
               env,
               hosts,
               selected_checks
             )
  end
end
