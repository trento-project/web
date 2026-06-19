# `Trento.AI.LLMBuilder`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/ai/llm_builder.ex#L4)

Builds a LangChain chat-model struct for a given User.

# `build_for_user`

```elixir
@spec build_for_user(non_neg_integer()) ::
  {:ok, struct()} | {:error, :user_not_found | :no_ai_configuration}
```

---

*Consult [api-reference.md](api-reference.md) for complete listing*
