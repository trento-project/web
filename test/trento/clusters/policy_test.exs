defmodule Trento.Clusters.PolicyTest do
  use ExUnit.Case

  alias Trento.Abilities.Ability
  alias Trento.Clusters.Policy
  alias Trento.Clusters.Projections.ClusterReadModel
  alias Trento.Users.User

  test "should allow select_checks operations if the user has all:cluster_checks_selection ability" do
    user = %User{abilities: [%Ability{name: "all", resource: "cluster_checks_selection"}]}

    assert Policy.authorize(:select_checks, user, ClusterReadModel)
  end

  test "should disallow select_checks operations if the user does not have all:cluster_checks_selection ability" do
    user = %User{abilities: []}

    refute Policy.authorize(:select_checks, user, ClusterReadModel)
  end

  test "should allow request_check_execution operations if the user has all:cluster_checks_execution ability" do
    user = %User{abilities: [%Ability{name: "all", resource: "cluster_checks_execution"}]}

    assert Policy.authorize(:request_checks_execution, user, ClusterReadModel)
  end

  test "should disallow request_check_execution operations if the user does not have all:cluster_checks_execution ability" do
    user = %User{abilities: []}

    refute Policy.authorize(:request_checks_execution, user, ClusterReadModel)
  end

  describe "request_operation" do
    test "should allow cluster_maintenance_change operation if the user has maintenance_change:cluster ability" do
      user = %User{abilities: [%Ability{name: "maintenance_change", resource: "cluster"}]}

      assert Policy.authorize(:request_operation, user, %{operation: "cluster_maintenance_change"})
    end

    test "should allow cluster_maintenance_change operation if the user has all:all ability" do
      user = %User{abilities: [%Ability{name: "all", resource: "all"}]}

      assert Policy.authorize(:request_operation, user, %{operation: "cluster_maintenance_change"})
    end

    test "should disallow cluster_maintenance_change operation if the user does not have maintenance_change:cluster ability" do
      user = %User{abilities: [%Ability{name: "all", resource: "other_resource"}]}

      refute Policy.authorize(:request_operation, user, %{operation: "cluster_maintenance_change"})
    end
  end

  test "should allow unguarded actions" do
    user = %User{abilities: []}

    Enum.each([:list], fn action ->
      assert Policy.authorize(action, user, ClusterReadModel)
    end)
  end
end
