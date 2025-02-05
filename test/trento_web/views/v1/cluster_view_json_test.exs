defmodule TrentoWeb.V1.ClusterJSONTest do
  use TrentoWeb.ConnCase, async: true

  import Trento.Factory

  alias TrentoWeb.V1.ClusterJSON

  describe "adapt to V1 version" do
    test "should remove the ascs/ers cluster type" do
      cluster = build(:cluster, type: :ascs_ers, details: build(:ascs_ers_cluster_details))

      assert %{type: :unknown, details: nil} =
               ClusterJSON.cluster(%{cluster: cluster})
    end

    test "should remove HANA cluster V2 fields" do
      nodes =
        build_list(1, :hana_cluster_node, %{
          nameserver_actual_role: "master",
          indexserver_actual_role: "master",
          status: "Online",
          resources: build_list(1, :cluster_resource)
        })

      details = build(:hana_cluster_details, nodes: nodes)

      cluster = build(:cluster, type: :hana_scale_up, details: details)

      %{
        details:
          %{
            nodes: [%{resources: resources} = node],
            stopped_resources: stopped_resources
          } = details
      } = ClusterJSON.cluster(%{cluster: cluster})

      refute Access.get(details, :sites)
      refute Access.get(details, :maintenance_mode)
      refute Access.get(details, :architecture_type)
      refute Access.get(details, :hana_scenario)
      refute Access.get(node, :nameserver_actual_role)
      refute Access.get(node, :indexserver_actual_role)
      refute Access.get(node, :status)

      Enum.each(stopped_resources, fn stopped_resource ->
        refute Map.has_key?(stopped_resource, :managed)
      end)

      Enum.each(resources, fn resource ->
        refute Map.has_key?(resource, :managed)
      end)
    end
  end
end
