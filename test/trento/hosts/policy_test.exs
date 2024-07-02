defmodule Trento.Hosts.PolicyTest do
  use ExUnit.Case

  alias Trento.Abilities.Ability
  alias Trento.Hosts.Policy
  alias Trento.Hosts.Projections.HostReadModel
  alias Trento.Users.User

  test "should allow select_checks action if the user has all:host_checks_selection ability" do
    user = %User{abilities: [%Ability{name: "all", resource: "host_checks_selection"}]}

    assert Policy.authorize(:select_checks, user, HostReadModel)
  end

  test "should disallow select_checks action if the user does not have all:host_checks_selection ability" do
    user = %User{abilities: []}

    refute Policy.authorize(:select_checks, user, HostReadModel)
  end

  test "should allow request_checks_execution action if the user has all:host_checks_execution ability" do
    user = %User{abilities: [%Ability{name: "all", resource: "host_checks_execution"}]}

    assert Policy.authorize(:request_checks_execution, user, HostReadModel)
  end

  test "should allow request_checks_execution action if the user has all:all ability" do
    user = %User{abilities: [%Ability{name: "all", resource: "all"}]}

    assert Policy.authorize(:request_checks_execution, user, HostReadModel)
  end

  test "should not allow request_checks_execution action if the user does not have the all:host_checks_execution ability" do
    user = %User{abilities: [%Ability{name: "all", resource: "other_resource"}]}

    refute Policy.authorize(:request_checks_execution, user, HostReadModel)
  end

  test "should allow delete action if the user has cleanup:host ability" do
    user = %User{abilities: [%Ability{name: "cleanup", resource: "host"}]}

    assert Policy.authorize(:delete, user, HostReadModel)
  end

  test "should allow delete action if the user has all:all ability" do
    user = %User{abilities: [%Ability{name: "all", resource: "all"}]}

    assert Policy.authorize(:delete, user, HostReadModel)
  end

  test "should disallow delete action if the user does not have cleanup:host ability" do
    user = %User{abilities: []}

    refute Policy.authorize(:delete, user, HostReadModel)
  end

  test "should allow unguarded actions" do
    user = %User{abilities: []}

    Enum.each([:list], fn action ->
      assert Policy.authorize(action, user, HostReadModel)
    end)
  end
end
