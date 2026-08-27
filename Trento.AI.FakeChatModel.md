# `Trento.AI.FakeChatModel`
[🔗](https://github.com/trento-project/web/blob/main/test/support/ai/fake_chat_model.ex#L4)

A `LangChain.ChatModels.ChatModel` that never talks to a provider.

Exists so integration tests can hold a `Sagents.AgentServer` run genuinely
in flight - the only state in which `Trento.AI.Agent.cancel/1` does anything
- without a network call.

`call/3` runs inside the agent's run task and parks there:

- `:notify` (pid) receives `{:llm_called, task_pid}` as soon as the chain
  reaches the model, so a test can wait for a *real* in-flight run instead
  of sleeping.
- the park ends on a `:release` message or after `:block_for` ms. The
  timeout is the CI guard: a cancel that fails to kill the task makes the
  test fail on its own assertions rather than hang.

`:reply` decides what the park ends with:

- a chunk of text, or a list of them - one `%MessageDelta{}` per element,
  each fired through `:on_llm_new_delta` as a provider fires one per
  received chunk. Every Trento model is built with `stream: true`, so this
  is the return shape production sees.
- `{:error, reason}` - the failing-run path, `reason` being a message or a
  ready-made `%LangChainError{}`.

Does not cover from drifts in the actual used models.

`:callbacks` is required by `LangChain.Utils.rewrap_callbacks_for_model/3`,
which writes the chain's wrapped callbacks onto the model struct.

# `reply`

```elixir
@type reply() ::
  String.t()
  | [String.t()]
  | {:error, String.t() | LangChain.LangChainError.t()}
```

# `t`

```elixir
@type t() :: %Trento.AI.FakeChatModel{
  block_for: non_neg_integer(),
  callbacks: [map()],
  notify: pid() | nil,
  reply: reply()
}
```

---

*Consult [api-reference.md](api-reference.md) for complete listing*
