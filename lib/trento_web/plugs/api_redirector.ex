defmodule TrentoWeb.Plugs.ApiRedirector do
  @moduledoc """
    This Plug is responsible for redirecting api requests without a specific version
    to the latest available version, when the requested path exists

    For example:
      Requesting /api/test, will try to redirect to to /api/<latest version>/test,
      only if the /api/<latest version>/test exists, otherwise, it will continue with the next available version.
      If the route doesn't match with any of the available versions, it returns a not found error.

    router and available_api_versions options should be provided.

    `available_api_versions` option should be a list with the available version from newest to oldest.

    For example: ["v3", "v2", "v1"]
  """
  @behaviour Plug

  alias Phoenix.Controller

  alias TrentoWeb.ErrorJSON

  import Plug.Conn

  @impl true
  def init(opts) do
    available_api_versions =
      Keyword.get(opts, :available_api_versions) ||
        raise ArgumentError, "expected :available_api_versions option"

    if Enum.empty?(available_api_versions),
      do: raise(ArgumentError, ":available_api_versions must have 1 element at least")

    Keyword.get(opts, :router) || raise ArgumentError, "expected :router option"

    opts
  end

  @impl true
  def call(%Plug.Conn{path_info: [_ | path_parts], method: method} = conn, opts) do
    router = Keyword.get(opts, :router)
    available_api_versions = Keyword.get(opts, :available_api_versions)

    case find_versioned_path(router, available_api_versions, path_parts, method) do
      nil ->
        conn
        |> put_resp_content_type("application/json")
        |> resp(:not_found, Jason.encode!(ErrorJSON.render("404.json", %{detail: "Not found"})))
        |> halt()

      versioned_path ->
        conn
        |> put_status(307)
        |> redirect(versioned_path)
        |> halt()
    end
  end

  # Find first available versioned path. If none is found nil is returned.
  defp find_versioned_path(router, available_api_vesions, path_parts, method) do
    available_api_vesions
    |> Enum.map(fn version ->
      ["/api", version]
      |> Enum.concat(path_parts)
      |> Enum.join("/")
    end)
    |> Enum.find_value(nil, fn path ->
      if route_exists?(router, path, method), do: path
    end)
  end

  defp redirect(conn, to) do
    Controller.redirect(conn, to: maybe_add_query_string(to, conn.query_string))
  end

  defp route_exists?(router, path, verb) do
    case Phoenix.Router.route_info(router, verb, path, "") do
      :error -> false
      %{plug: __MODULE__} -> false
      _ -> true
    end
  end

  defp maybe_add_query_string(path, ""), do: path
  defp maybe_add_query_string(path, query_string), do: "#{path}?#{query_string}"
end
