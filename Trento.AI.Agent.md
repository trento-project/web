# `Trento.AI.Agent`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/ai/agent.ex#L4)

Factory + lifecycle entrypoint for the Trento AI Assistant agent.

`run/1` is the single side-effecting entrypoint: it builds the agent,
ensures the per-thread `Sagents.AgentServer` is running, subscribes the
**calling process** to the agent's `{:agent, ...}` PubSub stream, and
sends the user prompt. Callers (the Phoenix channel) only deal with
trento-domain arguments + the AG-UI events that arrive in their mailbox;
`Sagents` and `LangChain` are implementation details of this module.

`new!/1` is the pure factory (no side effects). Useful for tests that
want to inspect the configured agent.

# `new!`

```elixir
@spec new!(keyword()) :: Sagents.Agent.t()
```

Pure factory for a Sagents.Agent struct configured as the Trento AI Assistant.

Accepted `opts`:

- `:agent_id`, `:model`, `:scope` — required (see Sagents docs).
- `:tool_context` — optional map set verbatim on the Sagents agent's
  `tool_context` field. Sagents propagates this into the per-call
  `context.tool_context` map that tool function closures receive.
  Used to forward request-scoped data (e.g. the websocket user's JWT)
  to tools that need it, without polluting `:scope`.

# `run`

```elixir
@spec run(Sagents.Agent.t(), String.t(), keyword()) :: :ok | {:error, term()}
```

Ensure the agent for `:agent_id` is running, subscribe the calling
process to its event stream, and send the user prompt. Returns `:ok`
or the first `{:error, reason}` from the start/subscribe/send chain.

---

*Consult [api-reference.md](api-reference.md) for complete listing*
