defmodule Trento.Integration.MapperTest do
  @moduledoc false

  use ExUnit.Case

  alias Trento.Messaging.Mapper

  alias Trento.Checks.V1.{
    ExecutionRequested,
    Target
  }

  describe "event mapper" do
    test "should map to a ExecutionRequested event" do
      execution_id = UUID.uuid4()
      group_id = UUID.uuid4()
      provider = :some_provider
      selected_checks = ["check_1", "check_2"]

      hosts = [
        %{host_id: "agent_1"},
        %{host_id: "agent_2"}
      ]

      assert message =
               %ExecutionRequested{
                 execution_id: ^execution_id,
                 group_id: ^group_id,
                 targets: [
                   %Target{agent_id: "agent_1", checks: ^selected_checks},
                   %Target{agent_id: "agent_2", checks: ^selected_checks}
                 ],
                 env: %{"provider" => %{kind: {:string_value, "some_provider"}}}
               } =
               Mapper.to_execution_requested(
                 execution_id,
                 group_id,
                 provider,
                 hosts,
                 selected_checks
               )

      # Ensure that the created message can be encoded correctly
      assert Trento.Contracts.to_event(message, source: "")
    end
  end
end
