# `TrentoWeb.AIAssistantChannel`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento_web/channels/ai_assistant_channel.ex#L4)

Phoenix Channel for the AI Assistant.

Bridges the React assistant-ui client (AG-UI protocol over WebSocket) to a
`Sagents.AgentServer` keyed on the JS-supplied `thread_id`. State lives in
the AgentServer until inactivity timeout.

AG-UI wire emission lives in `TrentoWeb.AIAssistant.AgUi`.

## Socket assigns

The channel keeps a small set of process-local assigns to track the
current run. All are scoped to one channel process — no DB persistence.

| Assign | Type | Lifetime | Why |
|---|---|---|---|
| `:current_user_id` | integer | from `UserSocket.connect` | auth + identifies the authenticated user |
| `:access_token` | string | from `UserSocket.connect` | raw JWT, forwarded to remote AI tools via `tool_context.access_token` so wanda etc. can authenticate the user on outbound calls |
| `:request_origin` | string | nil | from `UserSocket.connect` | scheme + host + port of the websocket request, forwarded via `tool_context.request_origin` so `Trento.AI.RemoteHttpTool` can resolve partial `:checks_service` base URLs (e.g. `/wanda`) against the same origin the browser used |
| `:current_scope` | `%Trento.Users.User{id: id}` | from `join/3` | passed to `Sagents.Agent.new!` as `:scope` so tool callbacks see `context.scope.id` |
| `:loading` | boolean | toggled per run | double-send guard — prevents race conditions |
| `:current_run_id` | UUID string | set at each `send_message` | echoed in `RUN_STARTED` + `RUN_FINISHED` AG-UI events for client-side correlation |
| `:current_thread_id` | UUID string | set at each `send_message` | used as the sagents `agent_id` + echoed in run events |
| `:message_id` | UUID string | set per run | identifies the assistant text-message lifecycle (`TEXT_MESSAGE_*`); also used as `parent_message_id` for `TOOL_CALL_START`. Currently equals `:current_run_id` but kept separate so future multi-message-per-run flows |
| `:message_started` | boolean | per run | tracks whether `TEXT_MESSAGE_START` has been emitted — drives "skip duplicate START on subsequent deltas" + "skip orphan END at :idle when no text streamed" |
| `:run_has_started` | boolean | per run | stale-`:idle` guard. `Sagents.AgentServer.init/1` broadcasts `{:status_changed, :idle, nil}` at boot and on Horde `node_transferred`; this flag is only set on the `:running` event for THIS run, so we ignore stray initial idles |

### Mutation surfaces

All run-state mutations go through three private helpers:

- `stash_run_ids/3` — at the head of `handle_in("send_message", ...)`, before validation.
- `activate_run/2` — once the agent is alive + subscribed + first message added; marks `:loading: true` and zeros per-run booleans.
- `reset_run/1` — on `:idle` (success), `:error`, and `run_agent` failure; clears per-run booleans and `:loading`. Leaves the IDs alone — next `send_message` overwrites them.

`:running` and `:llm_deltas` perform single-flag flips inline
(`run_has_started`, `message_started`).

# `child_spec`

# `start_link`

---

*Consult [api-reference.md](api-reference.md) for complete listing*
