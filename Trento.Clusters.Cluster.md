# `Trento.Clusters.Cluster`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/clusters/cluster.ex#L4)

The cluster aggregate manages all the domain logic related to
deployed HA Clusters (Pacemaker, Corosync, etc).
The HA cluster is used to handle the high availability scenarios on the installed
SAP infrastructure. That's why this domain is tailored to work on clusters managing
SAP workloads.

Each deployed cluster is registered as a new aggregate entry, meaning that all the hosts belonging
to the same cluster are part of the same stream.

A new cluster is registered when a cluster discovery message from any of the nodes of the cluster is received.

The cluster details will be populated if the received discovery message is coming from the **designated controller** node.
Otherwise the cluster details are left as unknown, and filled once a message from the **designated controller** is received.
Once a cluster is registered, other hosts will be added when cluster discovery messages from them are received.

All the hosts are listed in the `hosts` field.

The cluster aggregate stores and updates information coming in the cluster discovery messages such as:

- Cluster name
- Number of hosts and cluster resources
- Platform where the host is running (the cloud provider for instance)
- Managed SAP workload SID

## Cluster health

The cluster health is one of the most relevant concepts of this domain.
It shows if the cluster is working as expected or not, and in the second case,
what is the roout cause of the issue and if there is some possible remediation.
It is composed by sub-health elements:

- Replication health (only applicable for HANA clusters)
- Distributed health (only applicable for ASCS/ERS clusters)
- Checks health

The main cluster health is computed using the values from all of them. This means that the cluster health is a
computation of them.

### Replication health

The discovered replication health. It is based in the cluster replication values coming from cluster attributes.
The health is passing if the SR health is 4 and the secondary sync state "SOK". It is critical or
unknown (when the data is not available) otherwise.

# Distributed health

The discovered distributed health. It checks if ASCS and ERS workloads are distributed among 2 nodes and not running
in a single one. It is passing if all handled SAP systems are distributed and critical otherwise.

### Checks health

The checks health is obtained from the [Checks Engine executions](https://github.com/trento-project/wanda/).
Every time a checks execution is started, the selected checks for this cluster are executed, and based on the result
the health value is updated. The checks are started from a user request or periodically following the
project scheduler configuration.

This domain only knows about the health, the details about the execution are stored in the
[Checks Engine](https://github.com/trento-project/wanda/).

# `t`

```elixir
@type t() :: %Trento.Clusters.Cluster{
  cluster_id: term(),
  deregistered_at: term(),
  details: term(),
  health: term(),
  health_details: term(),
  hosts: term(),
  hosts_number: term(),
  name: term(),
  offline_hosts: term(),
  provider: term(),
  resources_number: term(),
  rolling_up: term(),
  sap_instances: term(),
  selected_checks: term(),
  state: term(),
  type: term()
}
```

# `apply`

# `cast_and_validate_required_embed`

# `cast_and_validate_required_polymorphic_embed`

# `changeset`

Casts the fields by using Ecto reflection,
validates the required ones and returns a changeset.

# `execute`

# `new`

```elixir
@spec new(map() | [map()]) :: {:ok, t() | [t()]} | {:error, any()}
```

Returns an ok tuple if the params are valid, otherwise returns `{:error, {:validation, errors}}`.
Accepts a map or a list of maps.

# `new!`

```elixir
@spec new!(map() | [map()]) :: t() | [t()]
```

Returns new struct(s) if the params are valid, otherwise raises a `RuntimeError`.

# `validate_required_fields`

---

*Consult [api-reference.md](api-reference.md) for complete listing*
