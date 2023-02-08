defmodule TrentoWeb.Plugs.ApiRedirector do
  @behaviour Plug

  alias Phoenix.Controller
  import Plug.Conn

  @impl true
  def init(opts), do: opts

  @impl true
  def call(%Plug.Conn{path_info: [_ | path_parts], method: method} = conn, opts) do
    latest_version = Keyword.get(opts, :latest_version)
    router = Keyword.get(opts, :router)

    unless latest_version do
      raise ArgumentError, "expected :latest_version option"
    end

    unless router do
      raise ArgumentError, "expected :router option"
    end

    redirect_path = build_path(latest_version, path_parts)

    if find_route(router, redirect_path, method) do
      conn
      |> put_status(:found)
      |> redirect(redirect_path)
      |> halt()
    else
      conn
      |> resp(:not_found, Jason.encode!(%{status: "not found"}))
      |> halt()
    end
  end

  defp build_path(version, path_parts) do
    "/api/" <> version <> "/" <> Enum.join(path_parts, "/")
  end

  defp redirect(conn, to) do
    Controller.redirect(conn, to: to <> conn.query_string)
  end

  defp find_route(router, path, verb) do
    verb =
      verb
      |> String.downcase()
      |> String.to_atom()

    router
    |> Phoenix.Router.routes()
    |> Enum.find(fn %{path: router_path, verb: router_verb} ->
      verb == router_verb and path == router_path
    end)
  end
end
