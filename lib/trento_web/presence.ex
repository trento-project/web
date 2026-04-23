defmodule TrentoWeb.Presence do
  @moduledoc """
  Phoenix Presence implementation for tracking user presence in channels.
  """

  use Phoenix.Presence,
    otp_app: :trento,
    pubsub_server: Trento.PubSub
end
