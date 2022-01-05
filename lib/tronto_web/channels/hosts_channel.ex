defmodule TrontoWeb.HostsChannel do
  use TrontoWeb, :channel

  @impl true
  def join("hosts:notifications", payload, socket) do
    if authorized?(payload) do
      {:ok, socket}
    else
      {:error, %{reason: "unauthorized"}}
    end
  end


  @impl true
  def handle_in("host_registered", payload, socket) do
    broadcast!(socket, "host_registered", payload)
    {:noreply, socket}
  end

  # TODO: Add authorization logic here as required.
  defp authorized?(_payload) do
    true
  end
end
