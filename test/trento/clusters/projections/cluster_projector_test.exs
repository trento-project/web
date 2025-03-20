defmodule Trento.Clusters.Projections.ClusterProjectorTest do
  use ExUnit.Case
  use Trento.DataCase

  import Phoenix.ChannelTest
  import TrentoWeb.ChannelCase

  import Trento.Factory

  alias Trento.Clusters.Events.{
    ClusterDeregistered,
    ClusterDetailsUpdated,
    ClusterHealthChanged,
    ClusterRestored
  }

  alias Trento.Clusters.Projections.{
    ClusterProjector,
    ClusterReadModel
  }

  alias Trento.ProjectorTestHelper
  alias Trento.Repo

  alias Trento.Support.StructHelper

  @moduletag :integration

  @endpoint TrentoWeb.Endpoint

  setup do
    {:ok, _, socket} =
      TrentoWeb.UserSocket
      |> socket("user_id", %{some: :assign})
      |> subscribe_and_join(TrentoWeb.MonitoringChannel, "monitoring:clusters")

    %{socket: socket}
  end

  test "should project a new cluster when ClusterRegistered event is received" do
    event = build(:cluster_registered_event)

    ProjectorTestHelper.project(ClusterProjector, event, "cluster_projector")
    cluster_projection = Repo.get!(ClusterReadModel, event.cluster_id)

    assert event.cluster_id == cluster_projection.id
    assert event.name == cluster_projection.name
    assert event.sap_instances == cluster_projection.sap_instances
    assert event.provider == cluster_projection.provider
    assert event.type == cluster_projection.type
    assert event.resources_number == cluster_projection.resources_number
    assert event.hosts_number == cluster_projection.hosts_number
    assert StructHelper.to_map(event.details) == StructHelper.to_map(cluster_projection.details)
    assert event.health == cluster_projection.health

    cluster_id = event.cluster_id

    assert_broadcast(
      "cluster_registered",
      %{
        cib_last_written: nil,
        details: %{
          architecture_type: :classic,
          fencing_type: "external/sbd",
          nodes: [
            %{
              attributes: _,
              hana_status: "Secondary",
              name: _,
              resources: [
                %{
                  fail_count: _,
                  id: _,
                  role: "Started",
                  status: "Active",
                  type: "ocf::heartbeat:Dummy"
                }
              ],
              site: _,
              virtual_ip: _
            }
          ],
          sbd_devices: [
            %{device: "/dev/vdc", status: "healthy"}
          ],
          secondary_sync_state: "SOK",
          sr_health_state: "4",
          stopped_resources: [
            %{
              fail_count: _,
              id: _,
              role: "Stopped",
              status: _,
              type: "ocf::heartbeat:Dummy"
            }
          ],
          system_replication_mode: "sync",
          system_replication_operation_mode: "logreplay"
        },
        health: :passing,
        hosts_number: 2,
        id: ^cluster_id,
        name: _,
        provider: _,
        resources_number: 8,
        sid: _,
        additional_sids: _,
        selected_checks: [],
        type: :hana_scale_up
      },
      1000
    )
  end

  test "should update the cluster details when ClusterDetailsUpdated is received" do
    insert(:cluster, id: cluster_id = Faker.UUID.v4())

    event = %ClusterDetailsUpdated{
      cluster_id: cluster_id,
      name: Faker.StarWars.character(),
      sap_instances: build_list(2, :clustered_sap_instance),
      provider: :gcp,
      type: :hana_scale_up,
      resources_number: 8,
      hosts_number: 2,
      details: build(:hana_cluster_details)
    }

    ProjectorTestHelper.project(
      ClusterProjector,
      event,
      "cluster_projector"
    )

    cluster_projection = Repo.get!(ClusterReadModel, cluster_id)

    assert event.cluster_id == cluster_projection.id
    assert event.name == cluster_projection.name
    assert event.sap_instances == cluster_projection.sap_instances
    assert event.provider == cluster_projection.provider
    assert event.type == cluster_projection.type
    assert event.resources_number == cluster_projection.resources_number
    assert event.hosts_number == cluster_projection.hosts_number
    assert StructHelper.to_map(event.details) == StructHelper.to_map(cluster_projection.details)

    assert_broadcast(
      "cluster_details_updated",
      %{
        details: %{
          architecture_type: :classic,
          fencing_type: "external/sbd",
          nodes: [
            %{
              attributes: _,
              hana_status: "Secondary",
              name: _,
              resources: [
                %{
                  fail_count: _,
                  id: _,
                  role: "Started",
                  status: "Active",
                  type: "ocf::heartbeat:Dummy"
                }
              ],
              site: _,
              virtual_ip: _
            }
          ],
          sbd_devices: [
            %{device: "/dev/vdc", status: "healthy"}
          ],
          secondary_sync_state: "SOK",
          sr_health_state: "4",
          stopped_resources: [
            %{
              fail_count: _,
              id: _,
              role: "Stopped",
              status: _,
              type: "ocf::heartbeat:Dummy"
            }
          ],
          system_replication_mode: "sync",
          system_replication_operation_mode: "logreplay"
        },
        hosts_number: 2,
        id: ^cluster_id,
        name: _,
        provider: _,
        resources_number: 8,
        sid: _,
        additional_sids: _,
        type: :hana_scale_up
      },
      1000
    )
  end

  test "should update the deregistered_at field when ClusterDeregistered is received" do
    insert(:cluster, id: cluster_id = Faker.UUID.v4(), name: name = "deregistered_cluster")
    deregistered_at = DateTime.utc_now()

    event = ClusterDeregistered.new!(%{cluster_id: cluster_id, deregistered_at: deregistered_at})

    ProjectorTestHelper.project(ClusterProjector, event, "cluster_projector")
    cluster_projection = Repo.get!(ClusterReadModel, event.cluster_id)

    assert event.deregistered_at == cluster_projection.deregistered_at

    assert_broadcast(
      "cluster_deregistered",
      %{id: ^cluster_id, name: ^name},
      1000
    )
  end

  test "should set deregistered_at field to nil when ClusterRestored is received" do
    %{id: cluster_id, name: name, type: type} =
      insert(:cluster,
        name: "deregistered_cluster",
        selected_checks: [],
        deregistered_at: DateTime.utc_now()
      )

    insert_list(5, :tag, resource_id: cluster_id)

    event = ClusterRestored.new!(%{cluster_id: cluster_id})

    ProjectorTestHelper.project(ClusterProjector, event, "cluster_projector")

    %{tags: tags} =
      cluster_projection =
      ClusterReadModel
      |> Repo.get!(event.cluster_id)
      |> Repo.preload([:tags])

    assert nil == cluster_projection.deregistered_at

    assert_broadcast(
      "cluster_restored",
      %{
        cib_last_written: nil,
        id: ^cluster_id,
        name: ^name,
        type: ^type,
        tags: ^tags
      },
      1000
    )
  end

  test "should broadcast cluster_health_changed after the ClusterHealthChanged event" do
    %{id: cluster_id, name: name, health: health} = insert(:cluster)

    event = %ClusterHealthChanged{cluster_id: cluster_id, health: health}

    ProjectorTestHelper.project(
      ClusterProjector,
      event,
      "cluster_projector"
    )

    assert_broadcast(
      "cluster_health_changed",
      %{cluster_id: ^cluster_id, name: ^name, health: ^health},
      1000
    )
  end
end
