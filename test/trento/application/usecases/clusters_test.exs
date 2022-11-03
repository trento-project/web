defmodule Trento.ClustersTest do
  @moduledoc false
  use ExUnit.Case, async: true
  use Trento.DataCase

  import Mox

  import Trento.Factory

  alias Trento.Clusters

  alias Trento.ClusterEnrichmentData
  alias Trento.ClusterReadModel

  alias Trento.Domain.Commands.RequestChecksExecution

  setup [:set_mox_from_context, :verify_on_exit!]

  describe "checks execution" do
    test "should dispatch checks execution requests for each cluster" do
      clusters = Enum.map(0..4, fn _ -> insert(:cluster) end)

      Enum.each(clusters, fn %{id: cluster_id} ->
        expect(
          Trento.Commanded.Mock,
          :dispatch,
          fn command ->
            assert %RequestChecksExecution{
                     cluster_id: ^cluster_id
                   } = command

            :ok
          end
        )
      end)

      :ok = Clusters.request_clusters_checks_execution()
    end
  end

  describe "get clusters" do
    test "should return enriched clusters" do
      cib_last_written = Date.to_string(Faker.Date.forward(0))
      cluster_id = Faker.UUID.v4()

      insert(:cluster, id: cluster_id)
      insert(:cluster_enrichment_data, cluster_id: cluster_id)

      [%ClusterReadModel{id: ^cluster_id, cib_last_written: ^cib_last_written}] =
        Clusters.get_all_clusters()
    end
  end

  describe "update cib_last_written" do
    test "should create a new enriched cluster entry" do
      cib_last_written = Date.to_string(Faker.Date.forward(0))
      cluster_id = Faker.UUID.v4()

      {:ok, %ClusterEnrichmentData{cluster_id: ^cluster_id, cib_last_written: ^cib_last_written}} =
        Clusters.update_cib_last_written(cluster_id, cib_last_written)
    end

    test "should update cib_last_written field properly" do
      cluster = insert(:cluster)
      cib_last_written = Date.to_string(Faker.Date.forward(0))

      {:ok, %ClusterEnrichmentData{cib_last_written: ^cib_last_written}} =
        Clusters.update_cib_last_written(cluster.id, cib_last_written)
    end
  end
end
