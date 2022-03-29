defmodule Trento.CheckResultProjectorTest do
  use ExUnit.Case
  use Trento.DataCase

  import Trento.Factory

  alias Trento.ProjectorTestHelper

  alias Trento.{
    CheckResultProjector,
    CheckResultReadModel
  }

  alias Trento.Domain.Events.HostChecksExecutionCompleted

  test "should project checks results with result unknown when a ChecksExecutionRequested event is received" do
    event = checks_execution_requested_event()

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

  test "should update a check result when HostChecksExecutionCompleted event is received" do
    check_result_projection(
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
end
