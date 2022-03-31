defmodule Trento.ChecksEventHandlerTest do
  use ExUnit.Case

  import Mox

  alias Trento.ChecksEventHandler
  alias Trento.Domain.Events.ChecksExecutionRequested

  test "should request a checks execution when the ChecksExecutionRequested event is received" do
    event =
      ChecksExecutionRequested.new!(%{
        cluster_id: Faker.UUID.v4(),
        hosts: ["hostname1", "hostname2"],
        checks: ["check1", "check2"]
      })

    correlation_id = Faker.UUID.v4()

    expect(Trento.Integration.Checks.Mock, :request_execution, fn execution_id,
                                                                  cluster_id,
                                                                  hosts,
                                                                  checks ->
      assert correlation_id == execution_id
      assert event.cluster_id == cluster_id
      assert event.hosts == hosts
      assert event.checks == checks
      :ok
    end)

    assert :ok == ChecksEventHandler.handle(event, %{correlation_id: correlation_id})
  end
end
