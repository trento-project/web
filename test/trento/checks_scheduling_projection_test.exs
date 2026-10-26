defmodule Trento.ChecksSchedulingProjectionTest do
  use ExUnit.Case
  use Trento.DataCase

  alias Trento.ChecksScheduling.Projections.{TargetSettingsProjector, TargetSettingsReadModel}
  alias Trento.Clusters.Events.ClusterChecksScheduleUpdated
  alias Trento.Hosts.Events.HostChecksScheduleUpdated

  @window %{
    "starts_at" => "2026-11-02T22:00:00Z",
    "timezone" => "Etc/UTC",
    "duration_minutes" => 60,
    "recurrence" => nil
  }

  test "should project the checks schedule of a host and a cluster, and replace it" do
    host_id = UUID.uuid4()
    cluster_id = UUID.uuid4()

    for event <- [
          %HostChecksScheduleUpdated{host_id: host_id, interval: "6h", exception_window: @window},
          %ClusterChecksScheduleUpdated{
            cluster_id: cluster_id,
            interval: "1w",
            exception_window: nil
          },
          %HostChecksScheduleUpdated{host_id: host_id, interval: "12h", exception_window: @window}
        ] do
      Trento.ProjectorTestHelper.project(
        TargetSettingsProjector,
        event,
        "checks_target_settings_projector"
      )
    end

    assert %TargetSettingsReadModel{
             target_type: "host",
             interval: "12h",
             exception_window: @window
           } =
             Repo.get!(TargetSettingsReadModel, host_id)

    assert %TargetSettingsReadModel{target_type: "cluster", interval: "1w", exception_window: nil} =
             Repo.get!(TargetSettingsReadModel, cluster_id)
  end
end
