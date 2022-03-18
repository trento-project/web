defmodule TrentoWeb.MonitoringChannel do
  @moduledoc """
  Monitoring CHannel
  """

  use TrentoWeb, :channel

  @impl true
  def join("monitoring:" <> _resource_name, _payload, socket), do: {:ok, socket}
end
