# `Trento.Discovery`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/discovery.ex#L4)

Discovery integration context.

# `command`

```elixir
@type command() :: struct()
```

# `get_current_discovery_events`

```elixir
@spec get_current_discovery_events() :: [Trento.Discovery.DiscoveryEvent.t()]
```

Get the discovery events that were handled to build the current state of the system.

# `get_discarded_discovery_events`

```elixir
@spec get_discarded_discovery_events(number()) :: [
  Trento.Discovery.DiscardedDiscoveryEvent.t()
]
```

Get the discovery events that were dead-lettered.

# `handle`

```elixir
@spec handle(map()) :: :ok | {:error, any()}
```

Transform a discovery in a list of commands event by using the appropriate policy.
Store the event in the discovery events log for auditing purposes and dispatch the commands.

# `prune_discovery_events`

```elixir
@spec prune_discovery_events(number()) :: :ok
```

Prune all discovery events (regular and discarded) older than the given number of days.

# `request_cluster_discovery`

```elixir
@spec request_cluster_discovery(String.t()) :: :ok | {:error, any()}
```

Request cluster discovery

# `request_cluster_hosts_discovery`

```elixir
@spec request_cluster_hosts_discovery(String.t()) :: :ok | {:error, any()}
```

Request cluster hosts discovery

# `request_saptune_discovery`

```elixir
@spec request_saptune_discovery(String.t()) :: :ok | {:error, any()}
```

Request saptune discovery in host

---

*Consult [api-reference.md](api-reference.md) for complete listing*
