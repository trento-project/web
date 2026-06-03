# `Trento.Clusters.ClusterEnrichmentData`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/clusters/cluster_enrichment_data.ex#L4)

Enriched cluster data

# `t`

```elixir
@type t() :: %Trento.Clusters.ClusterEnrichmentData{
  __meta__: term(),
  cib_last_written: term(),
  cluster_id: term(),
  inserted_at: term(),
  updated_at: term()
}
```

# `changeset`

```elixir
@spec changeset(t() | Ecto.Changeset.t(), map()) :: Ecto.Changeset.t()
```

---

*Consult [api-reference.md](api-reference.md) for complete listing*
