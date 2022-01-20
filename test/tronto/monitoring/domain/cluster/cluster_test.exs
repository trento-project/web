defmodule Tronto.Monitoring.ClusterTest do
  use Commanded.AggregateCase, aggregate: Tronto.Monitoring.Domain.Cluster, async: true

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
      id_cluster = Faker.UUID.v4()
      id_host = Faker.UUID.v4()
      name = Faker.StarWars.character()
      type = :hana_scale_up
      sid = Faker.StarWars.planet()

      commands = [
        RegisterCluster.new!(
          id_cluster: id_cluster,
          id_host: id_host,
          name: name,
          sid: sid,
          type: type
        )
      ]

      assert_events(
        commands,
        [
          %ClusterRegistered{
            id_cluster: id_cluster,
            name: name,
            sid: sid,
            type: type
          },
          %HostAddedToCluster{
            id_cluster: id_cluster,
            id_host: id_host
          }
        ]
      )

      assert_state(
        commands,
        %Cluster{
          id_cluster: id_cluster,
          name: name,
          sid: sid,
          type: type,
          hosts: [id_host]
        }
      )
    end

    test "should update cluster details if it is already registered" do
      id_cluster = Faker.UUID.v4()
      id_host = Faker.UUID.v4()
      new_name = Faker.StarWars.character()
      new_sid = Faker.StarWars.planet()

      initial_events = [
        %ClusterRegistered{
          id_cluster: id_cluster,
          name: Faker.StarWars.character(),
          sid: Faker.StarWars.planet(),
          type: :hana_scale_up
        },
        %HostAddedToCluster{
          id_cluster: id_cluster,
          id_host: id_host
        }
      ]

      commands = [
        RegisterCluster.new!(
          id_cluster: id_cluster,
          id_host: id_host,
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
            id_cluster: id_cluster,
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
          id_cluster: id_cluster,
          name: new_name,
          sid: new_sid,
          type: :hana_scale_up,
          hosts: [id_host]
        }
      )
    end

    test "should update cluster details if it is already registered and add a host to the cluster" do
      id_cluster = Faker.UUID.v4()
      id_host = Faker.UUID.v4()
      new_name = Faker.StarWars.character()
      new_sid = Faker.StarWars.planet()

      initial_events = [
        %ClusterRegistered{
          id_cluster: id_cluster,
          name: Faker.StarWars.character(),
          sid: Faker.StarWars.planet(),
          type: :hana_scale_up
        }
      ]

      commands = [
        RegisterCluster.new!(
          id_cluster: id_cluster,
          id_host: id_host,
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
            id_cluster: id_cluster,
            name: new_name,
            sid: new_sid,
            type: :hana_scale_up
          },
          %HostAddedToCluster{
            id_cluster: id_cluster,
            id_host: id_host
          }
        ]
      )

      assert_state(
        initial_events,
        commands,
        %Cluster{
          id_cluster: id_cluster,
          name: new_name,
          sid: new_sid,
          type: :hana_scale_up,
          hosts: [id_host]
        }
      )
    end
  end
end
