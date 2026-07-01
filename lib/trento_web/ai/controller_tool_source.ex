# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule TrentoWeb.AI.ControllerToolSource do
  @moduledoc """
  `Trento.AI.ToolSource` implementation that materialises a
  `LangChain.Function` for every MCP-tagged controller route discovered
  by `TrentoWeb.AI.McpRouteIndex`.
  """

  @behaviour Trento.AI.ToolSource

  alias TrentoWeb.AI.{ControllerTool, McpRouteIndex}

  @impl true
  def tools(_opts), do: Enum.map(McpRouteIndex.entries(), &ControllerTool.build/1)
end
