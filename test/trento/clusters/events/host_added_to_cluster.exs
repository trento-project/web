defmodule Trento.Cluster.Events.HostAddedToClusterTeest do
  use Trento.AggregateCase, aggregate: Trento.Hosts.Host, async: true
  require Trento.Clusters.Enums.ClusterHostStatus, as: ClusterHostStatus

  alias Trento.Cluster.Events.HostAddedToCluster

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
               |> HostDetailsUpdated.upcast(%{})
               |> HostDetailsUpdated.new!()
    end
  end
end
