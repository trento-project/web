# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule TrentoWeb.AI.ControllerToolSourceTest do
  use ExUnit.Case, async: true

  alias LangChain.Function
  alias TrentoWeb.AI.{ControllerToolSource, McpRouteIndex}

  describe "tools/1" do
    test "returns one %LangChain.Function{} per MCP-tagged route" do
      tools = ControllerToolSource.tools([])

      assert is_list(tools)
      assert length(tools) == length(McpRouteIndex.entries())

      for tool <- tools do
        assert %Function{name: name, display_text: display_text} = tool
        assert is_binary(name) and name != ""
        assert is_binary(display_text) and display_text != ""
      end
    end
  end
end
