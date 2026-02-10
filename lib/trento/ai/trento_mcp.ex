defmodule Trento.AI.MCP do
  use LangChain.MCP.Client,
    name: "TrentoMCP",
    version: "1.0.0",
    # protocol_version: "2025-03-26"
    protocol_version: "2025-06-18"
end
