defmodule Trento.SapSystems.PolicyTest do
  use ExUnit.Case

  alias Trento.Abilities.Ability
  alias Trento.SapSystems.Policy
  alias Trento.SapSystems.Projections.SapSystemReadModel
  alias Trento.Users.User

  test "should allow delete_application_instance action if the user has cleanup:application_instance ability" do
    user = %User{abilities: [%Ability{name: "cleanup", resource: "application_instance"}]}

    assert Policy.authorize(:delete_application_instance, user, SapSystemReadModel)
  end

  test "should allow delete_application_instance action if the user has all:all ability" do
    user = %User{abilities: [%Ability{name: "all", resource: "all"}]}

    assert Policy.authorize(:delete_application_instance, user, SapSystemReadModel)
  end

  test "should disallow delete_application_instance action if the user does not have cleanup:application_instance ability" do
    user = %User{abilities: []}

    refute Policy.authorize(:delete_application_instance, user, SapSystemReadModel)
  end

  describe "request_instance_operation" do
    operations = [
      %{
        operation: "sap_instance_start",
        ability: "start"
      },
      %{
        operation: "sap_instance_stop",
        ability: "stop"
      }
    ]

    for %{operation: operation, ability: ability} <- operations do
      @operation operation
      @ability ability

      test "should allow #{operation} operation if the user has #{ability}:application_instance ability" do
        user = %User{abilities: [%Ability{name: @ability, resource: "application_instance"}]}

        assert Policy.authorize(:request_instance_operation, user, %{
                 operation: @operation
               })
      end

      test "should allow #{operation} operation if the user has all:all ability" do
        user = %User{abilities: [%Ability{name: "all", resource: "all"}]}

        assert Policy.authorize(:request_instance_operation, user, %{
                 operation: @operation
               })
      end

      test "should disallow #{operation} operation if the user does not have #{ability}:application_instance ability" do
        user = %User{abilities: [%Ability{name: "all", resource: "other_resource"}]}

        refute Policy.authorize(:request_instance_operation, user, %{
                 operation: @operation
               })
      end
    end
  end

  describe "request_operation" do
    operations = [
      %{
        operation: "sap_system_start",
        ability: "start"
      },
      %{
        operation: "sap_system_stop",
        ability: "stop"
      }
    ]

    for %{operation: operation, ability: ability} <- operations do
      @operation operation
      @ability ability

      test "should allow #{operation} operation if the user has #{ability}:sap_system ability" do
        user = %User{abilities: [%Ability{name: @ability, resource: "sap_system"}]}

        assert Policy.authorize(:request_operation, user, %{
                 operation: @operation
               })
      end

      test "should allow #{operation} operation if the user has all:all ability" do
        user = %User{abilities: [%Ability{name: "all", resource: "all"}]}

        assert Policy.authorize(:request_operation, user, %{
                 operation: @operation
               })
      end

      test "should disallow #{operation} operation if the user does not have #{ability}:sap_system ability" do
        user = %User{abilities: [%Ability{name: "all", resource: "other_resource"}]}

        refute Policy.authorize(:request_operation, user, %{
                 operation: @operation
               })
      end
    end
  end

  test "should allow unguarded actions" do
    user = %User{abilities: []}

    Enum.each([:list], fn action ->
      assert Policy.authorize(action, user, SapSystemReadModel)
    end)
  end
end
