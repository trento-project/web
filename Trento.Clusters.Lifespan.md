# `Trento.Clusters.Lifespan`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/clusters/lifespan.ex#L4)

Cluster aggregate lifespan.

It controls the lifespan of the aggregate GenServer representing a cluster.

# `after_command`

# `after_error`

 If the aggregate is rolling up, it will be stopped to avoid processing any other event.

# `after_event`

The cluster aggregate will be stopped after a ClusterRollUpRequested event is received.
This is needed to reset the aggregate version, so the aggregate can start appending events to the new stream.

---

*Consult [api-reference.md](api-reference.md) for complete listing*
