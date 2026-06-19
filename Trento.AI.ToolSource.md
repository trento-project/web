# `Trento.AI.ToolSource`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/ai/tool_source.ex#L4)

Behaviour for modules that contribute AI assistant tools to
`Trento.AI.ToolsRegistry`.

A source returns a list of ready-to-use `LangChain.Function` structs.
How those functions are produced is entirely up to the implementation
(controller-derived, native, MCP remote, ...).

Sources are wired in via the `:tool_sources` key under
`config :trento, :ai, ...` and aggregated at call time.

# `tools`

```elixir
@callback tools() :: [LangChain.Function.t()]
```

---

*Consult [api-reference.md](api-reference.md) for complete listing*
