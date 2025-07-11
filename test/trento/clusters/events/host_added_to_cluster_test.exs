defmodule Trento.Cluster.Events.HostAddedToClusterTest do
  use Trento.AggregateCase, aggregate: Trento.Hosts.Host, async: true
  require Trento.Clusters.Enums.ClusterHostStatus, as: ClusterHostStatus

  alias Trento.Clusters.Events.HostAddedToCluster

  describe "HostAddedToCluster event upcasting" do
    test "should upcast HostAddedToCluster event properly from version 1" do
      host_id = Faker.UUID.v4()
      cluster_id = Faker.UUID.v4()

      assert %HostAddedToCluster{
               version: 2,
               host_id: host_id,
               cluster_id: cluster_id,
               cluster_host_status: ClusterHostStatus.online()
             } ==
               %{
                 "host_id" => host_id,
                 "cluster_id" => cluster_id
               }
               |> HostAddedToCluster.upcast(%{})
               |> HostAddedToCluster.new!()
    end
  end
end
