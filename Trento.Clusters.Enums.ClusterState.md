# `Trento.Clusters.Enums.ClusterState`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/clusters/enums/cluster_state.ex#L4)

Type that represents the cluster state.
Values are coming from pacemaker directly:
https://github.com/ClusterLabs/pacemaker/blob/main/daemons/controld/controld_fsa.h#L23

:stopped and :unknown are custom Trento values.

# `t`

```elixir
@type t() ::
  :unknown
  | :stopped
  | :S_MAX
  | :S_TRANSITION_ENGINE
  | :S_TERMINATE
  | :S_STOPPING
  | :S_PENDING
  | :S_STARTING
  | :S_RELEASE_DC
  | :S_RECOVERY
  | :S_POLICY_ENGINE
  | :S_NOT_DC
  | :S_FINALIZE_JOIN
  | :S_INTEGRATION
  | :S_ELECTION
  | :S_IDLE
```

# `S_ELECTION`
*macro* 

# `S_FINALIZE_JOIN`
*macro* 

# `S_IDLE`
*macro* 

# `S_INTEGRATION`
*macro* 

# `S_MAX`
*macro* 

# `S_NOT_DC`
*macro* 

# `S_PENDING`
*macro* 

# `S_POLICY_ENGINE`
*macro* 

# `S_RECOVERY`
*macro* 

# `S_RELEASE_DC`
*macro* 

# `S_STARTING`
*macro* 

# `S_STOPPING`
*macro* 

# `S_TERMINATE`
*macro* 

# `S_TRANSITION_ENGINE`
*macro* 

# `stopped`
*macro* 

# `unknown`
*macro* 

# `values`
*macro* 

---

*Consult [api-reference.md](api-reference.md) for complete listing*
