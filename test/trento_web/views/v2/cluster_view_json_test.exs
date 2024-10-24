defmodule TrentoWeb.V2.ClusterJSONTest do
  use TrentoWeb.ConnCase, async: true
  import Trento.Factory

  require Trento.Clusters.Enums.ClusterType, as: ClusterType
  alias TrentoWeb.V2.ClusterJSON

  alias Trento.Clusters.Projections.ClusterReadModel

  test "should render health changed relevant information" do
    %ClusterReadModel{id: id, name: name, health: health} = cluster = build(:cluster)

    assert %{cluster_id: id, name: name, health: health} ==
             ClusterJSON.cluster_health_changed(%{cluster: cluster})
  end

  test "should render maintenance_mode field" do
    details =
      :hana_cluster_details
      |> build()
      |> Map.from_struct()

    cluster = build(:cluster, details: details)

    assert %{details: %{maintenance_mode: false}} =
             ClusterJSON.cluster(%{cluster: cluster})
  end

  test "should remove cluster detail enrichment virtual field" do
    for type <- ClusterType.values() do
      cluster = build(:cluster, type: type)
      assert Map.has_key?(cluster, :enriching_details)

      cluster_view = ClusterJSON.cluster(%{cluster: cluster})
      refute Map.has_key?(cluster_view, :enriching_details)
    end
  end
end
