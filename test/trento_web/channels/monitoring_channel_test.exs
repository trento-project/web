# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule TrentoWeb.MonitoringChannelTest do
  use TrentoWeb.ChannelCase

  alias Trento.Infrastructure.Checks.PubSubEvents

  setup do
    {:ok, _, socket} =
      TrentoWeb.UserSocket
      |> socket("user_id", %{some: :assign})
      |> subscribe_and_join(TrentoWeb.MonitoringChannel, "monitoring:*")

    %{socket: socket}
  end

  test "broadcasts are pushed to the client", %{socket: socket} do
    broadcast_from!(socket, "broadcast", %{"some" => "data"})
    assert_push "broadcast", %{"some" => "data"}
  end

  for {target_type, topic, event, other_type} <- [
        {:host, "monitoring:hosts", "host_checks_execution_requested", :cluster},
        {:cluster, "monitoring:clusters", "cluster_checks_execution_requested", :host}
      ] do
    @target_type target_type
    @topic topic
    @event event
    @other_type other_type

    test "should push the periodic request of a #{target_type} to #{topic}" do
      {:ok, _, _socket} =
        TrentoWeb.UserSocket
        |> socket("user_id", %{some: :assign})
        |> subscribe_and_join(TrentoWeb.MonitoringChannel, @topic)

      target_id = Faker.UUID.v4()

      PubSubEvents.broadcast_execution_requested(
        @target_type,
        target_id,
        ~U[2026-03-02 10:00:00.000000Z]
      )

      assert_push @event, %{id: ^target_id, requested_at: ~U[2026-03-02 10:00:00.000000Z]}

      other_id = Faker.UUID.v4()

      PubSubEvents.broadcast_execution_requested(
        @other_type,
        other_id,
        ~U[2026-03-02 10:00:00.000000Z]
      )

      refute_push _, %{id: ^other_id}
    end
  end

  test "should keep the hosts channel alive on an unexpected message" do
    {:ok, _, socket} =
      TrentoWeb.UserSocket
      |> socket("user_id", %{some: :assign})
      |> subscribe_and_join(TrentoWeb.MonitoringChannel, "monitoring:hosts")

    ref = Process.monitor(socket.channel_pid)
    send(socket.channel_pid, :unexpected)

    refute_receive {:DOWN, ^ref, _, _, _}
  end
end
