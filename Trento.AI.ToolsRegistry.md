# `Trento.AI.ToolsRegistry`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/ai/tools_registry.ex#L4)

Aggregates AI assistant tools from every configured
`Trento.AI.ToolSource`.

The list of source modules is read from
`config :trento, :ai, tool_sources: [...]` via
`Trento.AI.ApplicationConfigLoader`. Each entry is either:

- a bare module `MyToolSource` — normalised to `{MyToolSource, []}`, or
- a `{module, opts}` tuple — passed through as-is.

Every source's `tools/1` callback is invoked with its opts list (empty
for bare-module entries). Sources are flat-concatenated in declaration
order; name collisions are configuration errors and should surface
loudly via LangChain.

# `tools`

```elixir
@spec tools(tool_context :: map()) :: [LangChain.Function.t()]
```

---

*Consult [api-reference.md](api-reference.md) for complete listing*
