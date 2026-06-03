# `Trento.ActivityLog.Logger.Parser.MetadataEnricher`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/activity_logging/parser/metadata_enricher.ex#L4)

Metadata enricher enriches metadata extracted by activity parser.

# `enrich`

```elixir
@spec enrich(
  activity :: Trento.ActivityLog.ActivityCatalog.activity_type(),
  metadata :: map()
) ::
  {:ok, maybe_enriched_metadata :: map()}
```

---

*Consult [api-reference.md](api-reference.md) for complete listing*
