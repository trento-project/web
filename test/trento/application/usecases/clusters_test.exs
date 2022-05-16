defmodule Trento.ClustersTest do
  @moduledoc false
  use ExUnit.Case, async: true
  use Trento.DataCase

  import Trento.Factory
  import Mock

  alias Trento.Clusters

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
end
