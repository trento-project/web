# `Trento.Support.HttpUtils`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/support/http_utils.ex#L4)

HTTP-related utilities shared across infrastructure adapters and the
AI tool dispatchers.

Two concerns live here:

- `request_origin/1` — derives a `scheme://host[:port]` string from
  either a `%Plug.Conn{}` (controller pipeline) or a `%URI{}` (socket
  `connect_info: [:uri]`). Default ports — 80 for http, 443 for https
  — are stripped so the result matches the canonical URL the browser
  used.

- `resolve_url/3` — composes `base_url <> path`, optionally prepending
  a request origin when `base_url` is path-only (e.g. `/wanda`) rather
  than an absolute URL. Used by adapters that may be configured either
  with a full external URL (`https://wanda.example.com`) or with a
  same-origin reverse-proxy prefix.

# `request_origin`

```elixir
@spec request_origin(Plug.Conn.t() | URI.t() | any()) :: String.t() | nil
```

Builds the canonical `scheme://host[:port]` string for a request.

Accepts either a `%Plug.Conn{}` (from a controller) or a `%URI{}`
(from a websocket `connect_info: [:uri]`). Default ports (80 for http,
443 for https) are stripped so the output matches the URL the browser
produced.

Returns `nil` for any other input — including `nil` itself — so
callers can pass through whatever they received from the request
layer without first checking the shape.

# `resolve_url`

```elixir
@spec resolve_url(String.t(), String.t(), String.t() | nil) :: String.t()
```

Composes a request URL as `base_url <> path`, optionally rooted at
`origin`.

Behaviour depends on the shape of `base_url`:

- When `base_url` carries an `http`/`https` scheme it is treated as
  absolute and used verbatim; `origin` is ignored.
- Otherwise — typically when `base_url` is a path-only same-origin
  prefix (e.g. `/wanda`) or an empty string — `origin` is prepended
  when it is a non-empty binary; otherwise the path-only base URL is
  used as-is.

Lets a service be configured with either an absolute URL (for
cross-host deployments) or a reverse-proxy prefix (for same-origin
deployments where the browser sees both Trento and the upstream
behind a single host).

---

*Consult [api-reference.md](api-reference.md) for complete listing*
