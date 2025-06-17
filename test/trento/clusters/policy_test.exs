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

  describe "request_host_operation" do
    for operation <- ["pacemaker_enable", "pacemaker_disable"] do
      @pacemaker_operation operation

      test "should allow #{operation} operation if the user has #{operation}:cluster ability" do
        user = %User{abilities: [%Ability{name: @pacemaker_operation, resource: "cluster"}]}

        assert Policy.authorize(:request_host_operation, user, %{
                 operation: @pacemaker_operation
               })
      end

      test "should allow #{operation} operation if the user has all:all ability" do
        user = %User{abilities: [%Ability{name: "all", resource: "all"}]}

        assert Policy.authorize(:request_host_operation, user, %{operation: @pacemaker_operation})
      end

      test "should disallow #{operation} operation if the user does not have #{operation}:cluster ability" do
        user1 = %User{abilities: [%Ability{name: "all", resource: "other_resource"}]}
        user2 = %User{abilities: [%Ability{name: "foo", resource: "cluster"}]}
        user3 = %User{abilities: []}

        for user <- [user1, user2, user3] do
          refute Policy.authorize(:request_host_operation, user, %{
                   operation: "#{@pacemaker_operation}"
                 })
        end
      end
    end
  end

  test "should allow unguarded actions" do
    user = %User{abilities: []}

    Enum.each([:list], fn action ->
      assert Policy.authorize(action, user, ClusterReadModel)
    end)
  end
end
