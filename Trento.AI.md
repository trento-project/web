# `Trento.AI`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/ai.ex#L4)

The `Trento.AI` module provides functions to interact with the AI features of the Trento application.

# `clear_user_configuration`

Clears a user's AI configuration.

See `Trento.AI.Configurations.clear_user_configuration/1` for more details.

# `create_user_configuration`

Creates a user configuration for AI.

See `Trento.AI.Configurations.create_user_configuration/2` for more details.

# `enabled?`

```elixir
@spec enabled?() :: boolean()
```

Checks if the AI features are enabled.

# `subscribe_to_configuration_events`

```elixir
@spec subscribe_to_configuration_events(non_neg_integer() | String.t()) ::
  :ok | {:error, term()}
```

Subscribes the calling process to the given user's AI configuration lifecycle
events.

Every AI Assistant channel (one per browser tab) subscribes on join so it can
react in real time to configuration changes made elsewhere (another tab, or a
raw API call). See `Trento.AI.Configurations.Events` for the message contract.

# `update_user_configuration`

Updates a user configuration for AI.

See `Trento.AI.Configurations.update_user_configuration/2` for more details.

---

*Consult [api-reference.md](api-reference.md) for complete listing*
