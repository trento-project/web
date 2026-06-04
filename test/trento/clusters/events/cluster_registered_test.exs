# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Cluster.Events.ClusterRegisteredTest do
  use Trento.AggregateCase, aggregate: Trento.Hosts.Host, async: true

  require Trento.Clusters.Enums.ClusterState, as: ClusterState
  require Trento.Enums.Health, as: Health

  alias Trento.Clusters.ValueObjects.{
    AscsErsClusterHealthDetails,
    HanaClusterHealthDetails
  }

  alias Trento.Clusters.Events.ClusterRegistered

  describe "ClusterRegistered event upcasting" do
    test "should upcast ClusterRegistered event properly from version 1" do
      assert %ClusterRegistered{
               version: 3,
               state: ClusterState.unknown()
             } =
               %{}
               |> ClusterRegistered.upcast(%{})
               |> ClusterRegistered.new!()
    end

    test "should upcast ClusterRegistered event with HANA type properly from version 1" do
      for cluster_type <- ["hana_scale_up", "hana_scale_out"] do
        assert %ClusterRegistered{
                 version: 3,
                 health_details: %HanaClusterHealthDetails{
                   checks_health: Health.unknown(),
                   replication_health: Health.passing()
                 }
               } =
                 %{"type" => cluster_type, "health" => Health.passing()}
                 |> ClusterRegistered.upcast(%{})
                 |> ClusterRegistered.new!()
      end
    end

    test "should upcast ClusterRegistered event with ASCS/ERS type properly from version 1" do
      assert %ClusterRegistered{
               version: 3,
               health_details: %AscsErsClusterHealthDetails{
                 checks_health: Health.unknown(),
                 distributed_health: Health.passing()
               }
             } =
               %{"type" => "ascs_ers", "health" => Health.passing()}
               |> ClusterRegistered.upcast(%{})
               |> ClusterRegistered.new!()
    end

    test "should upcast ClusterRegistered event with unknown type properly from version 1" do
      assert %ClusterRegistered{
               version: 3,
               health_details: nil
             } =
               %{"type" => "unknown", "health" => Health.unknown()}
               |> ClusterRegistered.upcast(%{})
               |> ClusterRegistered.new!()
    end
  end
end
