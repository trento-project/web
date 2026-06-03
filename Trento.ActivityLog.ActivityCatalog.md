# `Trento.ActivityLog.ActivityCatalog`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/activity_logging/activity_catalog.ex#L4)

Activity logging catalog

# `activity_type`

```elixir
@type activity_type() :: atom()
```

# `connection_activity`

```elixir
@type connection_activity() :: {controller :: module(), action :: atom()}
```

# `domain_event_activity`

```elixir
@type domain_event_activity() :: event_module :: module()
```

# `logged_activity`

```elixir
@type logged_activity() ::
  connection_activity() | domain_event_activity() | queue_event_activity()
```

# `queue_event_activity`

```elixir
@type queue_event_activity() :: event_module :: module()
```

# `connection_activities`

```elixir
@spec connection_activities() :: [activity_type()]
```

# `detect_activity`

```elixir
@spec detect_activity(any()) :: {:ok, activity_type()} | {:error, :not_interesting}
```

# `detect_activity_category`

```elixir
@spec detect_activity_category(activity_type()) ::
  :connection_activity
  | :domain_event_activity
  | :queue_event_activity
  | :unsupported_activity
```

# `domain_event_activities`

```elixir
@spec domain_event_activities() :: [activity_type()]
```

# `queue_event_activities`

```elixir
@spec queue_event_activities() :: [activity_type()]
```

# `supported_activities`

```elixir
@spec supported_activities() :: [activity_type()]
```

---

*Consult [api-reference.md](api-reference.md) for complete listing*
