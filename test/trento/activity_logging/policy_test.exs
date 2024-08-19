defmodule Trento.ActivityLog.PolicyTest do
  use ExUnit.Case

  alias Trento.ActivityLog.Policy
  alias Trento.Users.User

  test "should allow get_activity_log action by default for  aall users with any ability" do
    user = %User{abilities: [%{resource: "foo", name: "bar"}]}

    assert Policy.authorize(:get_activity_log, user, %{})
  end

  test "should allow get_activity_log when user has no abilities" do
    user = %User{abilities: []}

    assert Policy.authorize(:get_activity_log, user, %{})
  end

  test "should allow get_activity_log_all action when user has ability all:users" do
    user = %User{abilities: [%{resource: "users", name: "all"}]}

    assert Policy.authorize(:get_activity_log_all, user, %{})
  end

  test "should allow get_activity_log_all action when user has ability all:all" do
    user = %User{abilities: [%{resource: "all", name: "all"}]}

    assert Policy.authorize(:get_activity_log_all, user, %{})
  end

  test "should not allow get_activity_log_all action when user has no abilities" do
    user = %User{abilities: []}

    refute Policy.authorize(:get_activity_log_all, user, %{})
  end
end
