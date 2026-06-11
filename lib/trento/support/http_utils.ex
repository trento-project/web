# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Support.HttpUtils do
  @moduledoc """
  HTTP-related utilities shared across infrastructure adapters and the
  AI tool dispatchers.

  Two concerns live here:

  - `request_origin/1` — derives a `scheme://host[:port]` string from
    either a `%Plug.Conn{}` (controller pipeline) or a `%URI{}` (socket
    `connect_info: [:uri]`). Default ports — 80 for http, 443 for https
    — are stripped so the result matches the canonical URL the browser
    used.

  - `resolve_url/3` — composes `base_url <> path`, optionally prepending
    a request origin when `base_url` is path-only (e.g. `/wanda`) rather
    than an absolute URL. Used by adapters that may be configured either
    with a full external URL (`https://wanda.example.com`) or with a
    same-origin reverse-proxy prefix.
  """

  alias Plug.Conn

  @doc """
  Builds the canonical `scheme://host[:port]` string for a request.

  Accepts either a `%Plug.Conn{}` (from a controller) or a `%URI{}`
  (from a websocket `connect_info: [:uri]`). Default ports (80 for http,
  443 for https) are stripped so the output matches the URL the browser
  produced.

  Returns `nil` for any other input — including `nil` itself — so
  callers can pass through whatever they received from the request
  layer without first checking the shape.
  """
  @spec request_origin(Conn.t() | URI.t() | any()) :: String.t() | nil
  def request_origin(%module{scheme: scheme, host: host, port: port})
      when module in [Conn, URI],
      do: "#{scheme}://#{host}#{detect_port_part({scheme, port})}"

  def request_origin(_), do: nil

  defp detect_port_part({_scheme, nil}), do: ""
  defp detect_port_part({scheme, 80}) when scheme in [:http, "http"], do: ""
  defp detect_port_part({scheme, 443}) when scheme in [:https, "https"], do: ""
  defp detect_port_part({_, port}), do: ":#{port}"

  @doc """
  Composes a request URL as `base_url <> path`, optionally rooted at
  `origin`.

  Behaviour depends on the shape of `base_url`:

  - When `base_url` carries an `http`/`https` scheme it is treated as
    absolute and used verbatim; `origin` is ignored.
  - Otherwise — typically when `base_url` is a path-only same-origin
    prefix (e.g. `/wanda`) or an empty string — `origin` is prepended
    when it is a non-empty binary; otherwise the path-only base URL is
    used as-is.

  Lets a service be configured with either an absolute URL (for
  cross-host deployments) or a reverse-proxy prefix (for same-origin
  deployments where the browser sees both Trento and the upstream
  behind a single host).
  """
  @spec resolve_url(String.t(), String.t(), String.t() | nil) :: String.t()
  def resolve_url(base_url, path, origin) when is_binary(base_url) do
    case URI.parse(base_url) do
      %URI{scheme: scheme} when scheme in ["http", "https"] ->
        base_url <> path

      _ when is_binary(origin) and origin != "" ->
        origin <> base_url <> path

      _ ->
        base_url <> path
    end
  end
end
