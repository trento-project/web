defmodule TrontoWeb.HostsChannel do
  @moduledoc """
  Hosts discovery et al. channel/websocket.
  """

  use TrontoWeb, :channel

  @impl true
  def join("hosts:notifications", _payload, socket), do: {:ok, socket}
end
