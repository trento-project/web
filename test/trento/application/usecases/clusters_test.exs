defmodule Trento.ClustersTest do
  @moduledoc false
  use ExUnit.Case, async: true
  use Trento.DataCase

  import Trento.Factory
  import Mock

  alias Trento.Clusters

  alias Trento.ClusterReadModel

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

  describe "update cib_last_written" do
    test "should return cluster_not_found" do
      cib_last_written = Date.to_string(Faker.Date.forward(0))

      {:error, :cluster_not_found} =
        Clusters.update_cib_last_written(Faker.UUID.v4(), cib_last_written)
    end

    test "should update cib_last_written field properly" do
      cluster = insert(:cluster)
      cib_last_written = Date.to_string(Faker.Date.forward(0))

      {:ok, %ClusterReadModel{cib_last_written: ^cib_last_written}} =
        Clusters.update_cib_last_written(cluster.id, cib_last_written)
    end
  end
end
