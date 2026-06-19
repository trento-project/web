# `Trento.AI.Agent.Server`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/ai/agent/server.ex#L4)

Behaviour wrapping the subset of `Sagents.AgentServer` that
`Trento.AI.Agent.run/2` calls into.

Default production implementation lives at
`Trento.Infrastructure.AI.SagentsAgentServer`. Override via the
`:trento, :ai, agent_server_adapter:` config so tests can substitute
a Mox mock without booting the real sagents stack.

# `add_message`

```elixir
@callback add_message(String.t(), LangChain.Message.t()) :: :ok | {:error, term()}
```

# `subscribe`

```elixir
@callback subscribe(String.t()) :: :ok | {:error, term()}
```

# `add_message`

# `subscribe`

---

*Consult [api-reference.md](api-reference.md) for complete listing*
