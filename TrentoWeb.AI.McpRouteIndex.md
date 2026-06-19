# `TrentoWeb.AI.McpRouteIndex`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento_web/ai/mcp_route_index.ex#L4)

Index of MCP-tagged controller routes, built on demand from the
Phoenix router + OpenApiSpex operations.

Consumed by `TrentoWeb.AI.ControllerToolSource` to materialise AI
assistant tools — see also `Trento.AI.ToolsRegistry`, the
aggregator that pulls together every configured
`Trento.AI.ToolSource`.

Every route whose controller declares an OpenApiSpex operation
tagged `"MCP"` becomes a catalog entry. The same `"MCP"` tag is
used by the trento MCP server, so the AI assistant's tool set and
the MCP server's stay aligned automatically.

`tool_name` defaults to `<ControllerStem>_<action>` (snake_case via
`Macro.underscore/1`) and `display_text` defaults to
`operation.summary`. Either can be overridden per action via the
`ai_tool/2` macro from `Trento.AI.ControllerSpecs`.

Each entry carries its HTTP verb + path template so dispatchers
don't need to re-scan the router per tool call.

# `entries`

```elixir
@spec entries(module()) :: [TrentoWeb.AI.McpRouteIndex.Entry.t()]
```

---

*Consult [api-reference.md](api-reference.md) for complete listing*
