defmodule TrentoWeb.V2.ClusterViewTest do
  use TrentoWeb.ConnCase, async: true

  import Phoenix.View
  import Trento.Factory

  alias TrentoWeb.V2.ClusterView

  alias Trento.Clusters.Projections.ClusterReadModel

  test "should render health changed relevant information" do
    %ClusterReadModel{id: id, name: name, health: health} = cluster = build(:cluster)

    assert %{cluster_id: id, name: name, health: health} ==
             render(ClusterView, "cluster_health_changed.json", %{cluster: cluster})
  end

  test "should render maintenance_mode field" do
    details =
      :hana_cluster_details
      |> build()
      |> Map.from_struct()

    cluster = build(:cluster, details: details)

    assert %{details: %{maintenance_mode: false}} =
             render(ClusterView, "cluster.json", %{cluster: cluster})
  end
end
