defmodule Trento.Clusters.ClusterChecksScheduleTest do
  use Trento.AggregateCase, aggregate: Trento.Clusters.Cluster, async: true

  import Trento.Factory

  alias Trento.Clusters.Cluster
  alias Trento.Clusters.Commands.UpdateClusterChecksSchedule
  alias Trento.Clusters.Events.ClusterChecksScheduleUpdated

  test "should update the checks schedule of a cluster" do
    cluster_id = UUID.uuid4()

    assert_events_and_state(
      build(:cluster_registered_event, cluster_id: cluster_id),
      UpdateClusterChecksSchedule.new!(%{
        cluster_id: cluster_id,
        interval: "disabled",
        exception_window: nil
      }),
      [
        %ClusterChecksScheduleUpdated{
          cluster_id: cluster_id,
          interval: "disabled",
          exception_window: nil
        }
      ],
      fn cluster -> assert %Cluster{checks_interval: "disabled"} = cluster end
    )
  end

  test "should not update the checks schedule of an unknown cluster" do
    assert_error(
      UpdateClusterChecksSchedule.new!(%{
        cluster_id: UUID.uuid4(),
        interval: nil,
        exception_window: nil
      }),
      {:error, :cluster_not_registered}
    )
  end
end
