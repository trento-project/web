defmodule Trento.Cluster.Events.ClusterDetailsUpdatedTest do
  use Trento.AggregateCase, aggregate: Trento.Hosts.Host, async: true

  require Trento.Clusters.Enums.ClusterState, as: ClusterState

  alias Trento.Clusters.Events.ClusterDetailsUpdated

  describe "ClusterDetailsUpdated event upcasting" do
    test "should upcast ClusterDetailsUpdated event properly from version 1" do
      assert %ClusterDetailsUpdated{
               version: 2,
               state: ClusterState.unknown()
             } =
               %{}
               |> ClusterDetailsUpdated.upcast(%{})
               |> ClusterDetailsUpdated.new!()
    end
  end
end
