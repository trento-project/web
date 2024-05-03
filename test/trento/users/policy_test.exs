defmodule Trento.Users.PolicyTest do
  use ExUnit.Case

  alias Trento.Abilities.Ability
  alias Trento.Users.Policy
  alias Trento.Users.User

  test "should allow read operations if the user has all:all ability" do
    user = %User{abilities: [%Ability{name: "all", resource: "all"}]}

    Enum.each([:show, :index], fn action ->
      assert true == Policy.authorize(action, user, User)
    end)
  end

  test "should allow read operations if the user has users:all ability" do
    user = %User{abilities: [%Ability{name: "all", resource: "users"}]}

    Enum.each([:show, :index], fn action ->
      assert true == Policy.authorize(action, user, User)
    end)
  end

  test "should allow write operations if the user has all:all ability" do
    user = %User{abilities: [%Ability{name: "all", resource: "all"}]}

    Enum.each([:update, :create, :delete], fn action ->
      assert true == Policy.authorize(action, user, User)
    end)
  end

  test "should allow write operations if the user has all:users ability" do
    user = %User{abilities: [%Ability{name: "all", resource: "all"}]}

    Enum.each([:update, :create, :delete], fn action ->
      assert true == Policy.authorize(action, user, User)
    end)
  end

  test "should disallow other abilities" do
    user = %User{abilities: [%Ability{name: "other", resource: "other"}]}

    Enum.each([:update, :create, :index, :show, :delete], fn action ->
      assert false == Policy.authorize(action, user, User)
    end)
  end
end
