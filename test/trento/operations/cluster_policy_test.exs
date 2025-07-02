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

        cluster_details =
          build(:hana_cluster_details, maintenance_mode: false, resources: [cluster_resource])

        cluster = build(:cluster, name: cluster_name, details: cluster_details)

        assert result ==
                 ClusterPolicy.authorize_operation(:maintenance, cluster, %{
                   cluster_resource_id: cluster_resource_id
                 })
      end
    end
  end

  describe "cluster_maintenance_change" do
    test "should always authorize cluster_maintenance_change operation" do
      cluster = build(:cluster)
      assert ClusterPolicy.authorize_operation(:cluster_maintenance_change, cluster, %{})
    end
  end

  describe "enable/disable pacemaker" do
    for operation <- [:pacemaker_enable, :pacemaker_disable] do
      @operation operation

      test "should always authorize a #{operation} operation" do
        cluster = build(:cluster)

        assert :ok == ClusterPolicy.authorize_operation(@operation, cluster, %{})
      end
    end
  end
end
