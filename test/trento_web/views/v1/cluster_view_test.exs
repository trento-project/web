defmodule TrentoWeb.V1.ClusterViewTest do
  use TrentoWeb.ConnCase, async: true

  import Phoenix.View
  import Trento.Factory

  alias TrentoWeb.V1.ClusterView

  test "should adapt the cluster view to V1 version" do
    cluster = build(:cluster, type: :ascs_ers, details: build(:ascs_ers_cluster_details))

    assert %{type: :unknown, details: nil} =
             render(ClusterView, "cluster.json", %{cluster: cluster})
  end
end
