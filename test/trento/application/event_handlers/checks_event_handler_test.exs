defmodule Trento.ChecksEventHandlerTest do
  use ExUnit.Case
  use Trento.DataCase

  import Mox

  import Trento.Factory

  alias Trento.ChecksEventHandler
  alias Trento.Domain.Events.ChecksExecutionRequested

  test "should request a checks execution when the ChecksExecutionRequested event is received" do
    host_id_1 = Faker.UUID.v4()
    host_projection(id: host_id_1, ssh_address: "192.168.1.1")

    host_id_2 = Faker.UUID.v4()
    host_projection(id: host_id_2, ssh_address: "192.168.1.2")

    expected_hosts = [
      %{
        host_id: host_id_1,
        ssh_address: "192.168.1.1",
        user: nil
      },
      %{
        host_id: host_id_2,
        ssh_address: "192.168.1.2",
        user: nil
      }
    ]

    event =
      ChecksExecutionRequested.new!(%{
        cluster_id: Faker.UUID.v4(),
        hosts: [host_id_1, host_id_2],
        checks: ["check1", "check2"]
      })

    correlation_id = Faker.UUID.v4()

    expect(Trento.Integration.Checks.Mock, :request_execution, fn execution_id,
                                                                  cluster_id,
                                                                  provider,
                                                                  hosts,
                                                                  checks ->
      assert correlation_id == execution_id
      assert event.cluster_id == cluster_id
      assert event.provider == provider
      assert expected_hosts == hosts
      assert event.checks == checks
      :ok
    end)

    assert :ok == ChecksEventHandler.handle(event, %{correlation_id: correlation_id})
  end
end
