defmodule Trento.Integration.Checks.WandaTest do
  @moduledoc false

  use ExUnit.Case

  import Mox

  alias Trento.Integration.Checks.Wanda

  alias Trento.Checks.V1.ExecutionRequested

  describe "wanda adapter" do
    test "should request an execution properly" do
      execution_id = UUID.uuid4()
      group_id = UUID.uuid4()
      provider = :some_provider
      selected_checks = ["check_1", "check_2"]

      hosts = [
        %{host_id: "agent_1"},
        %{host_id: "agent_2"}
      ]

      expect(Trento.Messaging.Adapters.Mock, :publish, fn topic, message ->
        assert "executions" = topic
        assert %ExecutionRequested{execution_id: ^execution_id} = message

        :ok
      end)

      assert :ok =
               Wanda.request_execution(execution_id, group_id, provider, hosts, selected_checks)
    end
  end
end
