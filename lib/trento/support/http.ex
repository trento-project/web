# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Support.HttpUtils do
  @moduledoc """
  Utility functions for HTTP-related operations, such as extracting request origins.
  """

  alias Plug.Conn

  def request_origin(%module{scheme: scheme, host: host, port: port})
      when module in [Conn, URI], do: "#{scheme}://#{host}#{detect_port_part({scheme, port})}"

  def request_origin(_), do: nil

  defp detect_port_part({scheme, 80}) when scheme in [:http, "http"], do: ""
  defp detect_port_part({scheme, 443}) when scheme in [:https, "https"], do: ""
  defp detect_port_part({_, port}), do: ":#{port}"

  @doc """
  Compose a final URL from `base_url <> path`. When `base_url` does not
  carry an http/https scheme and `origin` is a non-empty binary, the
  origin is prepended — useful for resolving relative service base URLs
  against the host the current request arrived on.
  """
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
