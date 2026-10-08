# `Trento.Infrastructure.AI.SagentsAgentServer`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/infrastructure/ai/sagents_agent_server.ex#L4)

Production implementation of `Trento.AI.Agent.Server` —
delegates to `Sagents.AgentServer`.

`get_agent/1`, `get_info/1`, `get_status/1` and `update_agent_and_state/3` raise
`Sagents.RegistryUnavailableError` once this node's sagents tree is down, for example while the node drains.
They are rescued into `{:error, :registry_unavailable}`, as the behaviour requires.

---

*Consult [api-reference.md](api-reference.md) for complete listing*
