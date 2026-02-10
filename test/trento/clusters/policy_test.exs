defmodule Trento.Clusters.PolicyTest do
  use ExUnit.Case

  require Trento.Operations.Enums.ClusterHostOperations, as: ClusterHostOperations

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
    operations = [
      %{
        operation: :cluster_maintenance_change,
        ability: "maintenance_change"
      },
      %{
        operation: :cluster_resource_refresh,
        ability: "resource_refresh"
      }
    ]

    for %{operation: operation, ability: ability} <- operations do
      @operation operation
      @ability ability

      test "should allow #{@operation} operation if the user has #{@ability}:cluster ability" do
        user = %User{abilities: [%Ability{name: @ability, resource: "cluster"}]}

        assert Policy.authorize(@operation, user, ClusterReadModel)
      end

      test "should allow #{@operation} operation if the user has all:all ability" do
        user = %User{abilities: [%Ability{name: "all", resource: "all"}]}

        assert Policy.authorize(@operation, user, ClusterReadModel)
      end

      test "should disallow #{@operation} operation if the user does not have #{@ability}:cluster ability" do
        user = %User{abilities: [%Ability{name: "all", resource: "other_resource"}]}

        refute Policy.authorize(@operation, user, ClusterReadModel)
      end
    end
  end

  describe "request_host_operation" do
    for operation <- ClusterHostOperations.values() do
      @operation operation

      test "should allow #{operation} operation if the user has #{operation}:cluster ability" do
        user = %User{abilities: [%Ability{name: Atom.to_string(@operation), resource: "cluster"}]}

        assert Policy.authorize(@operation, user, ClusterReadModel)
      end

      test "should allow #{operation} operation if the user has all:all ability" do
        user = %User{abilities: [%Ability{name: "all", resource: "all"}]}

        assert Policy.authorize(@operation, user, ClusterReadModel)
      end

      test "should disallow #{operation} operation if the user does not have #{operation}:cluster ability" do
        user1 = %User{abilities: [%Ability{name: "all", resource: "other_resource"}]}
        user2 = %User{abilities: [%Ability{name: "foo", resource: "cluster"}]}
        user3 = %User{abilities: []}

        for user <- [user1, user2, user3] do
          refute Policy.authorize(@operation, user, ClusterReadModel)
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
