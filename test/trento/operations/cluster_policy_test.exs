defmodule Trento.Operations.ClusterPolicyTest do
  @moduledoc false
  use ExUnit.Case, async: true

  alias Trento.Operations.ClusterPolicy

  import Trento.Factory

  test "should forbid unknown operation" do
    cluster = build(:cluster)

    assert {:error, ["Unknown operation"]} ==
             ClusterPolicy.authorize_operation(:unknown, cluster, %{})
  end

  describe "maintenance" do
    test "should authorize operation depending on the cluster maintenance mode" do
      cluster_name = Faker.StarWars.character()

      scenarios = [
        %{maintenance_mode: true, result: :ok},
        %{
          maintenance_mode: false,
          result:
            {:error, ["Cluster #{cluster_name} operating this host is not in maintenance mode"]}
        }
      ]

      for %{maintenance_mode: maintenance_mode, result: result} <- scenarios do
        cluster_details =
          build(:hana_cluster_details, maintenance_mode: maintenance_mode, nodes: [])

        cluster = build(:cluster, name: cluster_name, details: cluster_details)

        assert result ==
                 ClusterPolicy.authorize_operation(:maintenance, cluster, %{
                   cluster_resource_id: nil
                 })
      end
    end

    test "should authorize operation depending on the given cluster resource managed state" do
      cluster_name = Faker.StarWars.character()
      cluster_resource_id = UUID.uuid4()

      scenarios = [
        %{
          managed: true,
          result:
            {:error,
             [
               "Cluster #{cluster_name} or resource #{cluster_resource_id} operating this host are not in maintenance mode"
             ]}
        },
        %{managed: false, result: :ok}
      ]

      for %{managed: managed, result: result} <- scenarios do
        cluster_resource = build(:cluster_resource, id: cluster_resource_id, managed: managed)
        nodes = build_list(1, :hana_cluster_node, resources: [cluster_resource])
        cluster_details = build(:hana_cluster_details, maintenance_mode: false, nodes: nodes)
        cluster = build(:cluster, name: cluster_name, details: cluster_details)

        assert result ==
                 ClusterPolicy.authorize_operation(:maintenance, cluster, %{
                   cluster_resource_id: cluster_resource_id
                 })
      end
    end
  end
end
