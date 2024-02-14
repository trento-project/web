defmodule TrentoWeb.V1.ClusterViewTest do
  use TrentoWeb.ConnCase, async: true

  import Phoenix.View
  import Trento.Factory

  alias TrentoWeb.V1.ClusterView

  describe "adapt to V1 version" do
    test "should remove the ascs/ers cluster type" do
      cluster = build(:cluster, type: :ascs_ers, details: build(:ascs_ers_cluster_details))

      assert %{type: :unknown, details: nil} =
               render(ClusterView, "cluster.json", %{cluster: cluster})
    end

    test "should remove HANA cluster V2 fields" do
      details =
        :hana_cluster_details
        |> build()
        |> Map.from_struct()

      cluster = build(:cluster, type: :hana_scale_up, details: details)

      %{details: details} = render(ClusterView, "cluster.json", %{cluster: cluster})

      refute Access.get(details, "sites")
      refute Access.get(details, "maintenance_mode")
    end
  end
end
