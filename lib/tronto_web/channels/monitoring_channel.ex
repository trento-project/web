defmodule TrontoWeb.MonitoringChannel do
  @moduledoc """
  Monitoring CHannel
  """

  use TrontoWeb, :channel

  @impl true
  def join("monitoring:" <> _resource_name, _payload, socket), do: {:ok, socket}
end
