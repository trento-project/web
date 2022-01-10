defmodule TrontoWeb.HostsChannelTest do
  use TrontoWeb.ChannelCase

  setup do
    {:ok, _, socket} =
      TrontoWeb.UserSocket
      |> socket("user_id", %{some: :assign})
      |> subscribe_and_join(TrontoWeb.HostsChannel, "hosts:notifications")

    %{socket: socket}
  end

  test "broadcasts are pushed to the client", %{socket: socket} do
    broadcast_from!(socket, "broadcast", %{"some" => "data"})
    assert_push "broadcast", %{"some" => "data"}
  end
end
