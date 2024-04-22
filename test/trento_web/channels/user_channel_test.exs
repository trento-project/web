defmodule TrentoWeb.UserChannelTest do
  use TrentoWeb.ChannelCase

  test "socket users can only join their channel" do
    assert {:ok, _, _socket} =
             TrentoWeb.UserSocket
             |> socket("user_id", %{current_user_id: 876})
             |> subscribe_and_join(TrentoWeb.UserChannel, "users:876")

    assert {:error, :unauthorized} =
             TrentoWeb.UserSocket
             |> socket("user_id", %{current_user_id: 788})
             |> subscribe_and_join(TrentoWeb.UserChannel, "users:876")
  end

  test "non logged users cannot join a user channel" do
    assert {:error, :user_not_logged} =
             TrentoWeb.UserSocket
             |> socket("user_id", %{})
             |> subscribe_and_join(TrentoWeb.UserChannel, "users:8989")
  end
end
