defmodule TrontoWeb.HostsChannel do
  @moduledoc """
  Hosts discovery et al. channel/websocket.
  """

  use TrontoWeb, :channel

  @impl true
  def join("hosts:notifications", payload, socket) do
    case authorized?(payload) do
      true ->
        {:ok, socket}

        # _ ->
        # {:error, %{reason: "unauthorized"}}
    end
  end

  @impl true
  def handle_in("host_registered", payload, socket) do
    broadcast!(socket, "host_registered", payload)
    {:noreply, socket}
  end

  # TODO: Add authorization logic here as required.
  defp authorized?(_), do: true
end
