defmodule TrentoWeb.V2.ClusterViewTest do
  use TrentoWeb.ConnCase, async: true

  import Phoenix.View
  import Trento.Factory

  alias TrentoWeb.V2.ClusterView

  alias Trento.ClusterReadModel

  test "should render health changed relevant information" do
    %ClusterReadModel{id: id, name: name, health: health} = cluster = build(:cluster)

    assert %{cluster_id: id, name: name, health: health} ==
             render(ClusterView, "cluster_health_changed.json", %{cluster: cluster})
  end
end
