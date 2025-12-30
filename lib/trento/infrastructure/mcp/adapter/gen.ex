defmodule Trento.Infrastructure.Mcp.Gen do
  @moduledoc """
  Behaviour of an MCP (Model Context Protocol) client adapter.
  """

  @callback list_tools() :: {:ok, [map]} | {:error, any}

  @callback call_tool(tool_name :: String.t(), arguments :: map) ::
              {:ok, any} | {:error, any}
end
