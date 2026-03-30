defmodule TrentoWeb.Presence do
  use Phoenix.Presence,
    otp_app: :trento,
    pubsub_server: Trento.PubSub
end
