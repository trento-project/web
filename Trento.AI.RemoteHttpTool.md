# `Trento.AI.RemoteHttpTool`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/ai/remote_http_tool.ex#L4)

Translates a `Trento.AI.OperationEntry` into a `%LangChain.Function{}`
whose execution dispatches an authenticated HTTP request against a
remote service described by its OpenAPI document.

This is the remote counterpart of `TrentoWeb.AI.ControllerTool`. Both
share `Trento.AI.OpenApiToolBuilder` for the transport-independent
pieces (description, parameters_schema, arg routing, path templating,
query encoding). Only the actual dispatch differs — `ControllerTool`
re-enters `TrentoWeb.Endpoint.call/2` via `Plug.Test`; this module
performs an outbound HTTP request via `HTTPoison`.

The JWT used to authenticate the websocket conversation is forwarded
to the remote service as an `Authorization: Bearer <token>` header.
Remote services that share an introspection endpoint with trento web
(e.g. wanda's `WandaWeb.Auth.AuthPlug`) authenticate the request as
the same user.

Arguments are routed by the operation's declared `:in` field
(`:path` / `:query` / body). Body args for non-GET verbs are
JSON-encoded and sent with `Content-Type: application/json`. GET
bodies are dropped — query args end up in the URL via
`OpenApiToolBuilder.resolve_path_and_body/3`.

Return convention mirrors `ControllerTool` so LangChain marks
`ToolResult.is_error` correctly:

- `{:ok, body_string}` for 2xx responses
- `{:error, "<status> <body>"}` for non-2xx responses
- `{:error, "tool invocation failed (<reason>)"}` for transport-level
  failures or unexpected closure crashes

# `build`

```elixir
@spec build(Trento.AI.OperationEntry.t(), String.t()) :: LangChain.Function.t()
```

Build a `%LangChain.Function{}` for the given entry. `base_url` is
the dispatch base supplied by the source (typically
`spec.servers[0].url`). When `base_url` carries an http/https scheme
it's used verbatim; otherwise the websocket request origin forwarded
through `tool_context.request_origin` is prepended at request time.

---

*Consult [api-reference.md](api-reference.md) for complete listing*
