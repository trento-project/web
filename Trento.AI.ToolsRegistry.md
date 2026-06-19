# `Trento.AI.ToolsRegistry`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/ai/tools_registry.ex#L4)

Aggregates AI assistant tools from every configured
`Trento.AI.ToolSource`.

The list of source modules is read at call time from
`config :trento, :ai, tool_sources: [...]` via
`Trento.AI.ApplicationConfigLoader`. Each source contributes a list
of `LangChain.Function` structs; the aggregator flat-concats them in
declaration order with no dedup — name collisions are configuration
errors and should be surfaced loudly by LangChain.

# `tools`

```elixir
@spec tools() :: [LangChain.Function.t()]
```

---

*Consult [api-reference.md](api-reference.md) for complete listing*
