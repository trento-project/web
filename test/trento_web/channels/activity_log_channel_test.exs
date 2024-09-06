defmodule TrentoWeb.ActivityLogChannelTest do
  use TrentoWeb.ChannelCase

  test "Socket users can only join the activity log channel" do
    assert {:ok, _, _socket} =
             TrentoWeb.UserSocket
             |> socket("user_id", %{current_user_id: 876})
             |> join(TrentoWeb.ActivityLogChannel, "activity_log:876")

    assert_push("al_users_pushed", %{users: _})
  end

  test "Unauthorized users cannot join the activity log channel" do
    assert {:error, :unauthorized} =
             TrentoWeb.UserSocket
             |> socket("user_id", %{current_user_id: 788})
             |> join(TrentoWeb.ActivityLogChannel, "activity_log:876")
  end

  test "Non logged users cannot join an activity log channel" do
    assert {:error, :user_not_logged} =
             TrentoWeb.UserSocket
             |> socket("user_id", %{})
             |> join(TrentoWeb.ActivityLogChannel, "activity_log:8989")
  end
end
