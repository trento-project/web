defmodule Trento.CheckResultProjectorTest do
  use ExUnit.Case
  use Trento.DataCase

  import Trento.Factory

  alias Trento.ProjectorTestHelper

  alias Trento.{
    CheckResultProjector,
    CheckResultReadModel,
    HostChecksExecutionsReadModel
  }

  alias Trento.Domain.Events.{
    ChecksExecutionRequested,
    HostChecksExecutionCompleted
  }

  test "should project checks results with result unknown when a ChecksExecutionRequested event is received" do
    event = build(:checks_execution_requested_event)

    ProjectorTestHelper.project(
      CheckResultProjector,
      event,
      "check_result_projector"
    )

    checks_results_projections = Repo.all(CheckResultReadModel)

    assert Enum.all?(checks_results_projections, fn %CheckResultReadModel{
                                                      check_id: check_id,
                                                      result: result
                                                    } ->
             check_id in event.checks && result == :unknown
           end)
  end

  test "should project hosts executions with empty data when a ChecksExecutionRequested event is received" do
    insert(
      :host_checks_result,
      cluster_id: cluster_id = Faker.UUID.v4(),
      host_id: host_id = Faker.UUID.v4(),
      reachable: true,
      msg: ""
    )

    event =
      ChecksExecutionRequested.new!(%{
        cluster_id: cluster_id,
        hosts: [host_id],
        checks: ["check1"]
      })

    ProjectorTestHelper.project(
      CheckResultProjector,
      event,
      "check_result_projector"
    )

    hosts_executions = Repo.all(HostChecksExecutionsReadModel)

    assert Enum.all?(hosts_executions, fn %HostChecksExecutionsReadModel{
                                            reachable: reachable
                                          } ->
             reachable == nil
           end)
  end

  test "should update a check result when HostChecksExecutionCompleted event is received" do
    insert(
      :check_result,
      cluster_id: cluster_id = Faker.UUID.v4(),
      host_id: host_id = Faker.UUID.v4(),
      check_id: check_id = Faker.UUID.v4()
    )

    event =
      HostChecksExecutionCompleted.new!(%{
        cluster_id: cluster_id,
        host_id: host_id,
        checks_results: [
          %{
            check_id: check_id,
            result: :critical
          }
        ]
      })

    ProjectorTestHelper.project(
      CheckResultProjector,
      event,
      "check_result_projector"
    )

    check_result_projections = Repo.get_by(CheckResultReadModel, check_id: check_id)

    assert :critical == check_result_projections.result
  end

  test "should update a host execution when HostChecksExecutionCompleted event is received" do
    insert(
      :host_checks_result,
      cluster_id: cluster_id = Faker.UUID.v4(),
      host_id: host_id = Faker.UUID.v4(),
      reachable: true,
      msg: ""
    )

    event =
      HostChecksExecutionCompleted.new!(%{
        cluster_id: cluster_id,
        host_id: host_id,
        reachable: true,
        msg: "",
        checks_results: []
      })

    ProjectorTestHelper.project(
      CheckResultProjector,
      event,
      "check_result_projector"
    )

    hosts_executions = Repo.all(HostChecksExecutionsReadModel)

    assert Enum.all?(hosts_executions, fn %HostChecksExecutionsReadModel{
                                            reachable: reachable
                                          } ->
             reachable == true
           end)
  end
end
