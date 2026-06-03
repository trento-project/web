# `Trento.AI.LLMRegistry`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/ai/llm_registry.ex#L4)

This module is responsible for managing the registry of available LLM providers and their models.

# `get_provider_models`

```elixir
@spec get_provider_models(atom() | :all) :: [bitstring()]
```

Returns the list of models for a given provider or all models if `:all` is passed.

# `model_supported?`

```elixir
@spec model_supported?(bitstring()) :: boolean()
```

Checks if a given model is supported by any provider.

# `model_supported_by_provider?`

```elixir
@spec model_supported_by_provider?(bitstring(), atom()) :: boolean()
```

Checks if a given model is supported by a specific provider.

# `provider_supported?`

```elixir
@spec provider_supported?(atom()) :: boolean()
```

Checks if a given provider is supported.

# `providers`

```elixir
@spec providers() :: [atom()]
```

Returns the list of configured LLM providers.

---

*Consult [api-reference.md](api-reference.md) for complete listing*
