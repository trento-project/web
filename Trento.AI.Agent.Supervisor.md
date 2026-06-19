# `Trento.AI.Agent.Supervisor`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/ai/agent/supervisor.ex#L4)

Behaviour wrapping `Sagents.AgentsDynamicSupervisor.start_agent_sync/1`.

Default production implementation lives at
`Trento.Infrastructure.AI.SagentsDynamicSupervisor`. Override via the
`:trento, :ai, agent_supervisor_adapter:` config so tests can
substitute a Mox mock.

# `start_agent_sync`

```elixir
@callback start_agent_sync(keyword()) :: {:ok, pid()} | {:error, term()}
```

Start an agent supervisor synchronously.

Sagents.AgentsDynamicSupervisor.start_agent_sync/1 spec declares

@spec start_agent_sync(keyword()) ::
        {:ok, pid()} | {:ok, pid(), :already_started} | {:error, term()}

however, the `:already_started` case is not actually returned by the implementation.

# `start_agent_sync`

---

*Consult [api-reference.md](api-reference.md) for complete listing*
