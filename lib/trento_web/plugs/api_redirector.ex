defmodule TrentoWeb.Plugs.ApiRedirector do
  @behaviour Plug

  alias Phoenix.Controller
  import Plug.Conn


  @impl true
  def init(opts), do: opts

  @impl true
  def call(%Plug.Conn{path_info: [_ | path_parts]} = conn, opts) do
    latest_version = Keyword.get(opts, :latest_version)

    unless latest_version do
      raise ArgumentError, "expected :latest_version option"
    end

    # TODO: Handle 404 when routes does not exists in the router config
    redirect_path = build_path(latest_version, path_parts)

    conn
    |> put_status(:found)
    |> redirect(redirect_path)
    |> halt()
  end

  defp build_path(version, path_parts) do
    "/api/" <> version <> "/" <> Enum.join(path_parts, "/")
  end

  defp redirect(conn, to) do
    Controller.redirect(conn, to: to <> conn.query_string)
  end
end
