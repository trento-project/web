defmodule Trento.Cluster.Events.ClusterRegisteredTest do
  use Trento.AggregateCase, aggregate: Trento.Hosts.Host, async: true

  alias Trento.Clusters.Events.ClusterRegistered

  describe "ClusterRegistered event upcasting" do
    test "should upcast ClusterRegistered event properly from version 1" do
      assert %ClusterRegistered{
               version: 2,
               state: "unknown"
             } =
               %{}
               |> ClusterRegistered.upcast(%{})
               |> ClusterRegistered.new!()
    end
  end
end
