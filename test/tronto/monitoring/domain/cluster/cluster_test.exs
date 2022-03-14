defmodule Tronto.Monitoring.ClusterTest do
  use Tronto.AggregateCase, aggregate: Tronto.Monitoring.Domain.Cluster, async: true

  import Tronto.Factory

  alias Tronto.Monitoring.Domain.Cluster

  alias Tronto.Monitoring.Domain.Commands.RegisterClusterHost

  alias Tronto.Monitoring.Domain.Events.{
    ClusterDetailsUpdated,
    ClusterRegistered,
    HostAddedToCluster
  }

  alias Tronto.Monitoring.Domain.Cluster

  describe "cluster registration" do
    test "should register a cluster and add the node host to the cluster if the node is a DC" do
      cluster_id = Faker.UUID.v4()
      host_id = Faker.UUID.v4()
      name = Faker.StarWars.character()
      type = :hana_scale_up
      sid = Faker.StarWars.planet()

      assert_events_and_state(
        [],
        RegisterClusterHost.new!(
          cluster_id: cluster_id,
          host_id: host_id,
          name: name,
          sid: sid,
          type: type,
          designated_controller: true
        ),
        [
          %ClusterRegistered{
            cluster_id: cluster_id,
            name: name,
            sid: sid,
            type: type
          },
          %HostAddedToCluster{
            cluster_id: cluster_id,
            host_id: host_id
          }
        ],
        %Cluster{
          cluster_id: cluster_id,
          name: name,
          sid: sid,
          type: type,
          hosts: [host_id]
        }
      )
    end

    test "should add a host to the cluster" do
      cluster_id = Faker.UUID.v4()
      host_id = Faker.UUID.v4()
      name = Faker.StarWars.character()
      sid = Faker.StarWars.planet()

      assert_events_and_state(
        [
          cluster_registered_event(cluster_id: cluster_id),
          host_added_to_cluster_event(cluster_id: cluster_id)
        ],
        RegisterClusterHost.new!(
          cluster_id: cluster_id,
          host_id: host_id,
          name: name,
          sid: sid,
          type: :hana_scale_up,
          designated_controller: false
        ),
        [
          %HostAddedToCluster{
            cluster_id: cluster_id,
            host_id: host_id
          }
        ],
        fn cluster ->
          assert %Cluster{
                   hosts: [^host_id | _]
                 } = cluster
        end
      )
    end

    test "should return an error if the cluster was not registered yet and a command from a non-DC is received" do
      assert_error(
        [],
        RegisterClusterHost.new!(
          cluster_id: Faker.UUID.v4(),
          host_id: Faker.UUID.v4(),
          name: Faker.StarWars.character(),
          sid: Faker.StarWars.planet(),
          type: :hana_scale_up,
          designated_controller: false
        ),
        {:error, :cluster_not_found}
      )
    end
  end

  describe "cluster details" do
    test "should update cluster details" do
      cluster_id = Faker.UUID.v4()
      host_id = Faker.UUID.v4()
      new_name = Faker.StarWars.character()
      new_sid = Faker.StarWars.planet()

      initial_events = [
        cluster_registered_event(cluster_id: cluster_id),
        %HostAddedToCluster{
          cluster_id: cluster_id,
          host_id: host_id
        }
      ]

      details = hana_cluster_details_value_object()

      assert_events_and_state(
        initial_events,
        RegisterClusterHost.new!(
          cluster_id: cluster_id,
          host_id: host_id,
          name: new_name,
          sid: new_sid,
          type: :hana_scale_up,
          details: details,
          designated_controller: true
        ),
        %ClusterDetailsUpdated{
          cluster_id: cluster_id,
          name: new_name,
          sid: new_sid,
          type: :hana_scale_up,
          details: details
        },
        %Cluster{
          cluster_id: cluster_id,
          name: new_name,
          sid: new_sid,
          type: :hana_scale_up,
          details: details,
          hosts: [host_id]
        }
      )
    end

    test "should not update cluster details if the details did not change" do
      cluster_id = Faker.UUID.v4()
      name = Faker.StarWars.character()
      sid = Faker.StarWars.planet()
      host_id = Faker.UUID.v4()

      initial_events = [
        cluster_registered_event(cluster_id: cluster_id, name: name, sid: sid),
        host_added_to_cluster_event(cluster_id: cluster_id, host_id: host_id)
      ]

      assert_events_and_state(
        initial_events,
        RegisterClusterHost.new!(
          cluster_id: cluster_id,
          host_id: host_id,
          name: name,
          sid: sid,
          type: :hana_scale_up,
          designated_controller: true
        ),
        [],
        fn cluster ->
          assert %Cluster{
                   name: ^name,
                   sid: ^sid,
                   type: :hana_scale_up
                 } = cluster
        end
      )
    end
  end
end
