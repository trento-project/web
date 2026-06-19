# `Trento.AI.OperationEntry`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/ai/operation_entry.ex#L4)

Transport-agnostic catalog entry shared by every `Trento.AI.ToolSource`
that derives AI tools from `%OpenApiSpex.Operation{}` structs.

Self-describing — the HTTP verb + path template are baked in at
construction time so dispatchers don't need to re-walk the source
document per tool call.

`TrentoWeb.AI.McpRouteIndex.Entry` is the local-controller counterpart
with two extra fields (`:controller`, `:action`). Remote sources use
this struct directly.

# `t`

```elixir
@type t() :: %Trento.AI.OperationEntry{
  display_text: String.t() | nil,
  operation: OpenApiSpex.Operation.t(),
  path: String.t(),
  tool_name: String.t(),
  verb: atom()
}
```

---

*Consult [api-reference.md](api-reference.md) for complete listing*
