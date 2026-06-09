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
end
