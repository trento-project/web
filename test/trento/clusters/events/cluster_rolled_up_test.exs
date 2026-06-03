# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Clusters.Events.ClusterRolledUpTest do
  use Trento.AggregateCase, aggregate: Trento.Clusters.Cluster, async: true

  require Trento.Enums.Health, as: Health

  alias Trento.Clusters.Cluster
  alias Trento.Clusters.Events.ClusterRolledUp

  alias Trento.Clusters.ValueObjects.{
    AscsErsClusterHealthDetails,
    HanaClusterHealthDetails
  }

  describe "ClusterRolledUp event upcasting, version 2" do
    test "should upcast the legacy snapshot with HANA type" do
      cluster_id = Faker.UUID.v4()

      for cluster_type <- ["hana_scale_up", "hana_scale_out"] do
        assert %ClusterRolledUp{
                 version: 2,
                 cluster_id: ^cluster_id,
                 snapshot: %Cluster{
                   health_details: %HanaClusterHealthDetails{
                     checks_health: Health.warning(),
                     replication_health: Health.passing()
                   }
                 }
               } =
                 %{
                   "version" => 1,
                   "cluster_id" => cluster_id,
                   "snapshot" => %{
                     "type" => cluster_type,
                     "checks_health" => Health.warning(),
                     "discovered_health" => Health.passing()
                   }
                 }
                 |> ClusterRolledUp.upcast(%{})
                 |> ClusterRolledUp.new!()
      end
    end

    test "should upcast the legacy snapshot with ASCS/ERS type" do
      cluster_id = Faker.UUID.v4()

      assert %ClusterRolledUp{
               version: 2,
               cluster_id: ^cluster_id,
               snapshot: %Cluster{
                 health_details: %AscsErsClusterHealthDetails{
                   checks_health: Health.warning(),
                   distributed_health: Health.passing()
                 }
               }
             } =
               %{
                 "version" => 1,
                 "cluster_id" => cluster_id,
                 "snapshot" => %{
                   "type" => "ascs_ers",
                   "checks_health" => Health.warning(),
                   "discovered_health" => Health.passing()
                 }
               }
               |> ClusterRolledUp.upcast(%{})
               |> ClusterRolledUp.new!()
    end

    test "should upcast the legacy snapshot with unknown type" do
      cluster_id = Faker.UUID.v4()

      assert %ClusterRolledUp{
               version: 2,
               cluster_id: ^cluster_id,
               snapshot: %Cluster{
                 health_details: nil
               }
             } =
               %{
                 "version" => 1,
                 "cluster_id" => cluster_id,
                 "snapshot" => %{
                   "type" => "unknown"
                 }
               }
               |> ClusterRolledUp.upcast(%{})
               |> ClusterRolledUp.new!()
    end
  end
end
