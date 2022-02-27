defmodule Tronto.Monitoring.ClusterTest do
  use Tronto.AggregateCase, aggregate: Tronto.Monitoring.Domain.Cluster, async: true

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

      commands = [
        RegisterCluster.new!(
          cluster_id: cluster_id,
          host_id: host_id,
          name: name,
          sid: sid,
          type: type
        )
      ]

      assert_events(
        commands,
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
        ]
      )

      assert_state(
        commands,
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
        %ClusterRegistered{
          cluster_id: cluster_id,
          name: Faker.StarWars.character(),
          sid: Faker.StarWars.planet(),
          type: :hana_scale_up
        },
        %HostAddedToCluster{
          cluster_id: cluster_id,
          host_id: host_id
        }
      ]

      commands = [
        RegisterCluster.new!(
          cluster_id: cluster_id,
          host_id: host_id,
          name: new_name,
          sid: new_sid,
          type: :hana_scale_up
        )
      ]

      assert_events(
        initial_events,
        commands,
        [
          %ClusterDetailsUpdated{
            cluster_id: cluster_id,
            name: new_name,
            sid: new_sid,
            type: :hana_scale_up
          }
        ]
      )

      assert_state(
        initial_events,
        commands,
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

      initial_events = [
        %ClusterRegistered{
          cluster_id: cluster_id,
          name: Faker.StarWars.character(),
          sid: Faker.StarWars.planet(),
          type: :hana_scale_up
        }
      ]

      commands = [
        RegisterCluster.new!(
          cluster_id: cluster_id,
          host_id: host_id,
          name: new_name,
          sid: new_sid,
          type: :hana_scale_up
        )
      ]

      assert_events(
        initial_events,
        commands,
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
        ]
      )

      assert_state(
        initial_events,
        commands,
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
