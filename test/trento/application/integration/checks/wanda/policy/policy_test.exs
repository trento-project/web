defmodule Trento.Integration.Checks.Wanda.PolicyTest do
  @moduledoc false
  use ExUnit.Case

  alias Trento.Checks.V1.ExecutionCompleted
  alias Trento.Domain.Commands.CompleteChecksExecutionWanda
  alias Trento.Integration.Checks.Wanda.Policy

  require Trento.Domain.Enums.Health, as: Health

  describe "handle" do
    test "should handle ExecutionCompleted event" do
      execution_id = UUID.uuid4()
      cluster_id = UUID.uuid4()

      assert {:ok,
              %CompleteChecksExecutionWanda{
                cluster_id: ^cluster_id,
                health: Health.passing()
              },
              [correlation_id: ^execution_id]} =
               Policy.handle(%ExecutionCompleted{
                 execution_id: execution_id,
                 group_id: cluster_id,
                 result: :PASSING
               })
    end
  end
end
