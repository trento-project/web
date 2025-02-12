defmodule Trento.Operations.ClusterPolicyTest do
  @moduledoc false
  use ExUnit.Case, async: true

  alias Trento.Operations.ClusterPolicy

  import Trento.Factory

  test "should forbid unknown operation" do
    cluster = build(:cluster)

    refute ClusterPolicy.authorize_operation(:unknown, cluster, %{})
  end

  describe "maintenance" do
    test "should authorize operation depending on the cluster maintenance mode" do
      scenarios = [
        %{maintenance_mode: true, authorized: true},
        %{maintenance_mode: false, authorized: false}
      ]

      for %{maintenance_mode: maintenance_mode, authorized: authorized} <- scenarios do
        cluster_details =
          build(:hana_cluster_details, maintenance_mode: maintenance_mode, nodes: [])

        cluster = build(:cluster, details: cluster_details)

        assert authorized ==
                 ClusterPolicy.authorize_operation(:maintenance, cluster, %{
                   cluster_resource_id: nil
                 })
      end
    end

    test "should authorize operation depending on the given cluster resource managed state" do
      scenarios = [
        %{managed: true, authorized: false},
        %{managed: false, authorized: true}
      ]

      for %{managed: managed, authorized: authorized} <- scenarios do
        %{id: cluster_resource_id} = cluster_resource = build(:cluster_resource, managed: managed)
        nodes = build_list(1, :hana_cluster_node, resources: [cluster_resource])
        cluster_details = build(:hana_cluster_details, maintenance_mode: false, nodes: nodes)
        cluster = build(:cluster, details: cluster_details)

        assert authorized ==
                 ClusterPolicy.authorize_operation(:maintenance, cluster, %{
                   cluster_resource_id: cluster_resource_id
                 })
      end
    end
  end
end
