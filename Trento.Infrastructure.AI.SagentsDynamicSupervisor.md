# `Trento.Infrastructure.AI.SagentsDynamicSupervisor`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/infrastructure/ai/sagents_dynamic_supervisor.ex#L4)

Production implementation of `Trento.AI.Agent.Supervisor` —
delegates to `Sagents.AgentsDynamicSupervisor`.

`start_agent_sync/1` exits once this node's sagents tree is down, for
example while the node drains. The exit is caught into
`{:error, :registry_unavailable}`.

---

*Consult [api-reference.md](api-reference.md) for complete listing*
