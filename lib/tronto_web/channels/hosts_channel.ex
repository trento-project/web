defmodule TrontoWeb.HostsChannel do
  @moduledoc """
  Hosts discovery et al. channel/websocket.
  """

  use TrontoWeb, :channel

  @impl true
  def join("hosts:notifications", _payload, socket), do: {:ok, socket}

  @impl true
  def handle_in("host_registered", payload, socket) do
    broadcast!(socket, "host_registered", payload)
    {:noreply, socket}
  end
end
