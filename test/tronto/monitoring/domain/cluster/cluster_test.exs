defmodule Tronto.Monitoring.ClusterTest do
  use Tronto.AggregateCase, aggregate: Tronto.Monitoring.Domain.Cluster, async: true

  import Tronto.Factory

  alias Tronto.Monitoring.Domain.Cluster

  alias Tronto.Monitoring.Domain.Commands.RegisterCluster

  alias Tronto.Monitoring.Domain.Events.{
    ClusterDetailsUpdated,
    ClusterRegistered,
    HostAddedToCluster
  }

  alias Tronto.Monitoring.Domain.Cluster

  describe "cluster registration" do
    test "should register a cluster and add the registering host to the cluster itself" do
      cluster_id = Faker.UUID.v4()
      host_id = Faker.UUID.v4()
      name = Faker.StarWars.character()
      type = :hana_scale_up
      sid = Faker.StarWars.planet()

      assert_events_and_state(
        [],
        RegisterCluster.new!(
          cluster_id: cluster_id,
          host_id: host_id,
          name: name,
          sid: sid,
          type: type
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

    test "should update cluster details if it is already registered" do
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

      assert_events_and_state(
        initial_events,
        RegisterCluster.new!(
          cluster_id: cluster_id,
          host_id: host_id,
          name: new_name,
          sid: new_sid,
          type: :hana_scale_up
        ),
        %ClusterDetailsUpdated{
          cluster_id: cluster_id,
          name: new_name,
          sid: new_sid,
          type: :hana_scale_up
        },
        %Cluster{
          cluster_id: cluster_id,
          name: new_name,
          sid: new_sid,
          type: :hana_scale_up,
          hosts: [host_id]
        }
      )
    end

    test "should update cluster details if it is already registered and add a host to the cluster" do
      cluster_id = Faker.UUID.v4()
      host_id = Faker.UUID.v4()
      new_name = Faker.StarWars.character()
      new_sid = Faker.StarWars.planet()

      assert_events_and_state(
        cluster_registered_event(cluster_id: cluster_id),
        RegisterCluster.new!(
          cluster_id: cluster_id,
          host_id: host_id,
          name: new_name,
          sid: new_sid,
          type: :hana_scale_up
        ),
        [
          %ClusterDetailsUpdated{
            cluster_id: cluster_id,
            name: new_name,
            sid: new_sid,
            type: :hana_scale_up
          },
          %HostAddedToCluster{
            cluster_id: cluster_id,
            host_id: host_id
          }
        ],
        %Cluster{
          cluster_id: cluster_id,
          name: new_name,
          sid: new_sid,
          type: :hana_scale_up,
          hosts: [host_id]
        }
      )
    end
  end
end
