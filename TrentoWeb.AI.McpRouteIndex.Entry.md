# `TrentoWeb.AI.McpRouteIndex.Entry`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento_web/ai/mcp_route_index_entry.ex#L4)

One catalog entry for `TrentoWeb.AI.McpRouteIndex`.

Built from a `Phoenix.Router` route + the controller's OpenApiSpex
operation. Self-describing — HTTP verb + path template are baked in
at construction time so `TrentoWeb.AI.ControllerTool.invoke/3` can
dispatch without re-scanning the router per call.

# `t`

```elixir
@type t() :: %TrentoWeb.AI.McpRouteIndex.Entry{
  action: atom(),
  controller: module(),
  display_text: String.t() | nil,
  operation: OpenApiSpex.Operation.t(),
  path: String.t(),
  tool_name: String.t(),
  verb: atom()
}
```

---

*Consult [api-reference.md](api-reference.md) for complete listing*
