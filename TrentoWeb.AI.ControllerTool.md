# `TrentoWeb.AI.ControllerTool`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento_web/ai/controller_tool.ex#L4)

Translates a `TrentoWeb.AI.McpRouteIndex.Entry` into a
`%LangChain.Function{}` whose execution dispatches into the controller's
real action by re-entering `TrentoWeb.Endpoint.call/2`.

The endpoint runs the full plug stack (Plug.Parsers, Plug.Telemetry,
`TrentoWeb.Plugs.ActivityLoggingPlug`, Plug.Session, Pow.Plug.Session,
the router with its `:api` / `:api_v1` / `:protected_api` pipelines, and
the matched controller's own plugs) — so authorization, activity
logging, OpenApiSpex param casting, and FallbackController error
mapping all behave identically to a real HTTP request.

The only thing we bypass is JWT validation: the channel already
authenticated the user via the UserSocket. We pre-assign Pow's
`current_user` on the synthesized conn with the same credentials
map shape that `TrentoWeb.Plugs.AppJWTAuthPlug.fetch/2` would have
returned — `%{"user_id" => user_id}` — so `Pow.Plug.Base.call/2`
short-circuits (current user already present) and the rest of the
chain runs exactly as for a real HTTP request:
`TrentoWeb.Plugs.LoadUserPlug` (where wired by the controller)
hydrates the credentials map into a `%Trento.Users.User{}`, then
`Bodyguard.Plug.Authorize` / `OperationsPolicyPlug` authorise
against the loaded user. ControllerTool itself owns no auth logic.

Args are routed by the operation's declared `:in` field
(`:path` / `:query` / body) via `Trento.AI.OpenApiToolBuilder`.
Query-tagged args are appended to the request URL, not passed via
`Plug.Test.conn/3`'s `params_or_body` argument — that argument is a
single bucket routed by verb (GET → `query_string`, non-GET →
`body_params`) and cannot carry both query and body simultaneously.
Appending the query string to the URL is the only mechanism that
supports a non-GET endpoint with `:in => :query` parameters.

# `build`

```elixir
@spec build(TrentoWeb.AI.McpRouteIndex.Entry.t()) :: LangChain.Function.t()
```

Build a `%LangChain.Function{}` for the given catalog entry.

---

*Consult [api-reference.md](api-reference.md) for complete listing*
