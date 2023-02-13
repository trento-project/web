defmodule TrentoWeb.Plugs.ApiRedirector do
  @moduledoc """
    This Plug is responsible for redirecting api requests without a specific version
    to the latest version, when the requested path exists

    For example:
      Requesting /api/test, will redirect to /api/<latest version/test, only if the /api/<latest version/test exists.

    router and latest_version options should be provided.

    latest_version option should be a string,which will be interpolated with the path.
  """
  @behaviour Plug

  alias Phoenix.Controller

  alias TrentoWeb.ErrorView

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
      |> put_resp_content_type("application/json")
      |> resp(:not_found, Jason.encode!(ErrorView.render("error.json", reason: "not found")))
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
      |> String.to_existing_atom()

    router
    |> Phoenix.Router.routes()
    |> Enum.find(fn %{path: router_path, verb: router_verb} ->
      verb == router_verb and path == router_path
    end)
  end
end
