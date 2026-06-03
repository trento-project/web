# `Trento.Tags`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/tags.ex#L4)

Tag related functions

# `taggable_resource`

```elixir
@type taggable_resource() :: :host | :cluster | :sap_system | :database
```

# `add_tag`

```elixir
@spec add_tag(String.t(), Ecto.UUID.t(), taggable_resource()) ::
  {:ok, Ecto.Schema.t()} | {:error, Ecto.Changeset.t()}
```

# `delete_tag`

```elixir
@spec delete_tag(String.t(), Ecto.UUID.t()) :: :ok | {:error, :not_found}
```

---

*Consult [api-reference.md](api-reference.md) for complete listing*
