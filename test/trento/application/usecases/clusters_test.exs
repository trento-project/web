defmodule Trento.ClustersTest do
  @moduledoc false
  use ExUnit.Case, async: true
  use Trento.DataCase

  import Trento.Factory
  import Mock

  alias Trento.Clusters

  alias Trento.ClusterReadModel
  alias Trento.EnrichedCluster

  alias Trento.Domain.Commands.RequestChecksExecution

  describe "checks execution" do
    test "should dispatch checks execution requests for each cluster" do
      # TODO: use Mox and beavhiours to test this
      with_mock Trento.Commanded, dispatch: fn _ -> :ok end do
        clusters = Enum.map(0..4, fn _ -> insert(:cluster) end)

        :ok = Clusters.request_clusters_checks_execution()

        Enum.each(clusters, fn cluster ->
          assert_called Trento.Commanded.dispatch(%RequestChecksExecution{
                          cluster_id: cluster.id
                        })
        end)
      end
    end
  end

  describe "get clusters" do
    test "should return enriched clusters" do
      cib_last_written = Date.to_string(Faker.Date.forward(0))
      cluster_id = Faker.UUID.v4()

      insert(:cluster, id: cluster_id)
      insert(:enriched_cluster, cluster_id: cluster_id)

      [%ClusterReadModel{id: ^cluster_id, cib_last_written: ^cib_last_written}] =
        Clusters.get_all_clusters()
    end
  end

  describe "update cib_last_written" do
    test "should create a new enriched cluster entry" do
      cib_last_written = Date.to_string(Faker.Date.forward(0))
      cluster_id = Faker.UUID.v4()

      {:ok, %EnrichedCluster{cluster_id: ^cluster_id, cib_last_written: ^cib_last_written}} =
        Clusters.update_cib_last_written(cluster_id, cib_last_written)
    end

    test "should update cib_last_written field properly" do
      cluster = insert(:cluster)
      cib_last_written = Date.to_string(Faker.Date.forward(0))

      {:ok, %EnrichedCluster{cib_last_written: ^cib_last_written}} =
        Clusters.update_cib_last_written(cluster.id, cib_last_written)
    end
  end
end
