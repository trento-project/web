defmodule TrentoWeb.UserSocket do
  use Phoenix.Socket

  require Logger
  alias TrentoWeb.Auth.AccessToken

  # A Socket handler
  #
  # It's possible to control the websocket connection and
  # assign values that can be accessed by your channel topics.

  ## Channels

  channel "monitoring:*", TrentoWeb.MonitoringChannel
  channel "users:*", TrentoWeb.UserChannel

  # Socket params are passed from the client and can
  # be used to verify and authenticate a user. After
  # verification, you can put default assigns into
  # the socket that will be set for all channels, ie
  #
  #     {:ok, assign(socket, :user_id, verified_user_id)}
  #
  # To deny connection, return `:error`.
  #
  # See `Phoenix.Token` documentation for examples in
  # performing token verification on connect.
  @impl true
  def connect(%{"access_token" => access_token}, socket, _connect_info) do
    case AccessToken.verify_and_validate(access_token) do
      {:ok, %{"sub" => user_id}} ->
        {:ok, assign(socket, :current_user_id, user_id)}

      {:error, reason} ->
        Logger.error("Could not authenticate user socket: #{inspect(reason)}")
        {:error, reason}
    end
  end

  def connect(_, _, _) do
    Logger.error("Could not authenticate user socket: missing auth token")
    {:error, :missing_auth_token}
  end

  # Socket id's are topics that allow you to identify all sockets for a given user:
  #
  #     def id(socket), do: "user_socket:#{socket.assigns.user_id}"
  #
  # Would allow you to broadcast a "disconnect" event and terminate
  # all active sockets and channels for a given user:
  #
  #     Elixir.TrentoWeb.Endpoint.broadcast("user_socket:#{user.id}", "disconnect", %{})
  #
  # Returning `nil` makes this socket anonymous.
  @impl true
  def id(socket), do: "user_socket:#{socket.assigns.current_user_id}"
end
