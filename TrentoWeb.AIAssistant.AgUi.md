# `TrentoWeb.AIAssistant.AgUi`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento_web/channels/ai_assistant/ag_ui.ex#L4)

AG-UI protocol emission helpers for `TrentoWeb.AIAssistantChannel`.

Every public function takes and returns the socket so the channel
pipes cleanly. Wire encoding (camelCase + nil-strip + JSON round-trip)
delegates to `AgUi.Encoder.EventEncoder.encode_json/1`.

# `maybe_text_message_content`

```elixir
@spec maybe_text_message_content(Phoenix.Socket.t(), String.t(), String.t()) ::
  Phoenix.Socket.t()
```

# `maybe_text_message_end`

```elixir
@spec maybe_text_message_end(Phoenix.Socket.t(), boolean(), String.t()) ::
  Phoenix.Socket.t()
```

Emits `TEXT_MESSAGE_END` only when `message_started?` is true. Skips
otherwise to avoid the orphan-pair bug (END without START).

# `maybe_text_message_start`

```elixir
@spec maybe_text_message_start(Phoenix.Socket.t()) :: Phoenix.Socket.t()
```

Emits `TEXT_MESSAGE_START` once per run. Skipped if `:message_started`
is already true. Flips `:message_started` to true on emit.

# `run_error`

```elixir
@spec run_error(Phoenix.Socket.t(), String.t()) :: Phoenix.Socket.t()
```

# `run_finished`

```elixir
@spec run_finished(Phoenix.Socket.t(), String.t(), String.t()) :: Phoenix.Socket.t()
```

# `run_started`

```elixir
@spec run_started(Phoenix.Socket.t(), String.t(), String.t()) :: Phoenix.Socket.t()
```

# `tool_call_lifecycle`

```elixir
@spec tool_call_lifecycle(Phoenix.Socket.t(), map(), String.t()) :: Phoenix.Socket.t()
```

Emits the full tool-call lifecycle (Start + Args + End) back-to-back.
Sagents collapses streamed argument JSON into a single map before
broadcasting `:tool_call_identified`, so we synthesize the trio from
one in-memory payload — assistant-ui doesn't care whether Args is
1 chunk or N.

# `tool_call_result`

```elixir
@spec tool_call_result(Phoenix.Socket.t(), String.t(), term()) :: Phoenix.Socket.t()
```

---

*Consult [api-reference.md](api-reference.md) for complete listing*
