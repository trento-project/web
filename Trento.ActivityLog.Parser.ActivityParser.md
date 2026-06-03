# `Trento.ActivityLog.Parser.ActivityParser`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/activity_logging/parser/activity_parser.ex#L4)

Activity parser extracts the activity relevant information from the context.

# `activity_log`

```elixir
@type activity_log() :: %{
  type: String.t(),
  actor: String.t(),
  severity: non_neg_integer(),
  metadata: map()
}
```

# `to_activity_log`

```elixir
@spec to_activity_log(Trento.ActivityLog.ActivityCatalog.activity_type(), map()) ::
  {:ok, activity_log()} | {:error, :cannot_parse_activity}
```

---

*Consult [api-reference.md](api-reference.md) for complete listing*
