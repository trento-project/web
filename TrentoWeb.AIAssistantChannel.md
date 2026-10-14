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
| `:current_thread_id` | UUID string | set at join, and at each `send_message` | used as the sagents `agent_id` + echoed in run events |
| `:message_id` | UUID string | set per run | identifies the assistant text-message lifecycle (`TEXT_MESSAGE_*`); also used as `parent_message_id` for `TOOL_CALL_START`. Currently equals `:current_run_id` but kept separate so future multi-message-per-run flows |
| `:message_started` | boolean | per run | tracks whether `TEXT_MESSAGE_START` has been emitted — drives "skip duplicate START on subsequent deltas" + "skip orphan END at :idle when no text streamed" |
| `:agent_monitor_ref` | reference | nil | from `join/3`, replaced per run | monitor on the `Sagents.AgentServer`. The event stream does not survive a server crash, so its `:DOWN` is what surfaces one: `conversation_expired`, after a `RUN_ERROR` when a run was in flight |
| `:agent_server_pid` | pid | nil | nil at join and after leaving a thread, set once a run starts on it | the agent server holding the conversation on screen: a prompt must reach that very process, never a fresh agent (none running, or another one in its place), which would answer without the conversation |
| `:run_has_started` | boolean | per run | stale-status guard. `subscribe/1` sends a new subscriber a status snapshot, so the first `run/3` against a server delivers the status from before the prompt (`:idle`, or `:error` after a failed run); this flag is only set on the `:running` event for THIS run, so we ignore it |

### Mutation surfaces

All run-state mutations happen in these places:

- `stash_run_id/2` — on each prompt, once the model is built; sets `:current_run_id`.
- `activate_run/2` — once the agent is alive + subscribed + first message added; marks `:loading: true` and zeros per-run booleans.
- `reset_run/1` — on `:idle` (success), `:error`, `run_agent` failure, the client's `cancel_run` and `abandon_thread`, and an AI-configuration clear; clears per-run booleans and `:loading`. Leaves the IDs alone — next `send_message` overwrites them.
- `monitor_agent_server/2` — alongside `activate_run/2`; swaps `:agent_monitor_ref` for a monitor on the pid `Trento.AI.Agent.run/3` returned. Survives `reset_run/1`: the subscription spans runs.
- `track_viewer/2` — at `join/3`, and on each prompt through `maybe_switch_thread/2`; tracks the viewer and sets `:current_thread_id`. A prompt on another thread first goes through `leave_current_thread/1` (untracks the viewer, stops the agent).
- `leave_current_thread/1` — our own stop (`abandon_thread`, AI-configuration clear, thread change): drops the monitor, so the agent going down is not reported as an expired conversation, then untracks the viewer and stops the agent.
- `handle_in("send_message", ...)` — replaces `:access_token` with the token the prompt carries, once it validates.
- `run_agent/3` — sets `:agent_server_pid` once a run starts; `leave_current_thread/1` clears it.
- the `{:DOWN, ...}` handler — clears `:agent_monitor_ref` once the monitored agent server is gone.

The `:running` status flips `run_has_started` inline, and `AgUi.maybe_text_message_start/1`
flips `message_started` on the run's first `:llm_deltas` event.

# `child_spec`

# `start_link`

---

*Consult [api-reference.md](api-reference.md) for complete listing*
