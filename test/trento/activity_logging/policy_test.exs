defmodule Trento.ActivityLog.PolicyTest do
  use ExUnit.Case

  alias Trento.ActivityLog.Policy
  alias Trento.Users.User

  test "should allow access to user management log types when user has ability all:all" do
    user = %User{abilities: [%{resource: "all", name: "all"}]}

    assert Policy.authorize(:get_activity_log, user, %{})
  end

  test "should allow access to user management log types when user has ability all:users" do
    user = %User{abilities: [%{resource: "users", name: "all"}]}

    assert Policy.authorize(:get_activity_log, user, %{})
  end

  test "should not allow access to user management log types when user has ability all:foo" do
    user = %User{abilities: [%{resource: "foo", name: "all"}]}

    refute Policy.authorize(:get_activity_log, user, %{})
  end

  test "should not allow access to user management log types when user has no abilities" do
    user = %User{abilities: []}

    refute Policy.authorize(:get_activity_log, user, %{})
  end
end
