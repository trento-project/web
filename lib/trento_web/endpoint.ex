defmodule TrentoWeb.Endpoint do
  use Phoenix.Endpoint, otp_app: :trento

  # The session will be stored in the cookie and signed,
  # this means its contents can be read but not tampered with.
  # Set :encryption_salt if you would also like to encrypt it.
  @session_options [
    store: :cookie,
    key: "_trento_key",
    signing_salt: "dboCmt4v"
  ]

  socket "/live", Phoenix.LiveView.Socket, websocket: [connect_info: [session: @session_options]]
  socket "/socket", TrentoWeb.UserSocket, websocket: true, longpoll: false

  # Set script name from x-forwarded-prefix header for subpath support before asset paths are generated.
  plug :set_script_name

  # Serve at "/" the static files from "priv/static" directory.
  #
  # You should set gzip to true if you are running phx.digest
  # when deploying your static files in production.
  plug Plug.Static,
    at: "/",
    from: :trento,
    gzip: false,
    only: TrentoWeb.static_paths()

  # Code reloading can be explicitly enabled under the
  # :code_reloader configuration of your endpoint.
  if code_reloading? do
    socket "/phoenix/live_reload/socket", Phoenix.LiveReloader.Socket
    plug Phoenix.LiveReloader
    plug Phoenix.CodeReloader
    plug Phoenix.Ecto.CheckRepoStatus, otp_app: :trento
  end

  plug TrentoWeb.Plugs.ActivityLoggingPlug

  plug Phoenix.LiveDashboard.RequestLogger,
    param_key: "request_logger",
    cookie_key: "request_logger"

  plug Plug.RequestId
  plug Plug.Telemetry, event_prefix: [:phoenix, :endpoint]

  plug Plug.Parsers,
    parsers: [:urlencoded, :multipart, :json],
    pass: ["*/*"],
    json_decoder: Phoenix.json_library()

  plug Plug.MethodOverride
  plug Plug.Head
  plug Plug.Session, @session_options
  plug Pow.Plug.Session, otp_app: :trento
  # TODO: change to something better than a Cookie
  plug PowPersistentSession.Plug.Cookie
  plug TrentoWeb.Router

  # Sets the phoenix script_name from x-forwarded-prefix header for subpath support.
  def set_script_name(conn, _opts) do
    case Plug.Conn.get_req_header(conn, "x-forwarded-prefix") do
      [header_value] when is_binary(header_value) and byte_size(header_value) > 0 ->
        # Convert "/trento/foo/" to ["trento","foo"]
        script_name =
          header_value
          |> String.trim_leading("/")
          |> String.trim_trailing("/")
          |> String.split("/")
          |> Enum.filter(&(&1 != ""))

        %{conn | script_name: script_name}

      _ ->
        conn
    end
  end
end
