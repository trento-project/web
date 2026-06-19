# `Trento.AI.ToolSource`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/ai/tool_source.ex#L4)

Behaviour for modules that contribute AI assistant tools to
`Trento.AI.ToolsRegistry`.

A source returns a list of ready-to-use `LangChain.Function` structs.
How those functions are produced is entirely up to the implementation
(controller-derived, remote-OpenAPI, MCP remote, ...).

Sources are wired in via the `:tool_sources` key under
`config :trento, :ai, ...`. Each entry is either a bare module
`MyToolSource` (normalised to `{MyToolSource, []}`) or a `{module, opts}`
tuple

Implementations must export `tools/1`. Sources that don't need
configuration match the argument with `_opts`.

# `tools`

```elixir
@callback tools(opts :: keyword()) :: [LangChain.Function.t()]
```

---

*Consult [api-reference.md](api-reference.md) for complete listing*
