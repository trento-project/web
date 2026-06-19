# `Trento.AI.OpenApiToolBuilder`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/ai/open_api_tool_builder.ex#L4)

Transport-agnostic helpers shared by every `Trento.AI.ToolSource` that
derives `LangChain.Function`s from `%OpenApiSpex.Operation{}` structs.

Two distinct concerns live here:

1. **Schema synthesis** — `description/1` and `parameters_schema/1`
   produce the metadata `LangChain.Function.new!/1` consumes. The
   resulting `parameters_schema` is the JSON-Schema map a provider
   adapter (Anthropic, Google AI, OpenAI) eventually forwards to the
   model.

2. **Arg routing** — `param_locations/1`, `split_args/2`,
   `substitute_path/2`, `append_query/2` turn the LLM-supplied
   argument map into a `{path, body}` pair, respecting each parameter's
   declared `in:` location.

Both `TrentoWeb.AI.ControllerTool` (local Plug.Test dispatch) and
`Trento.AI.RemoteHttpTool` (remote HTTP dispatch) consume these helpers,
so the OpenAPI surface drives both transports identically. The only
thing that differs is how the resolved request is actually executed.

# `append_query`

```elixir
@spec append_query(String.t(), map()) :: String.t()
```

Appends a `?k=v&...` query string to `path`. Array values explode into
repeated keys, matching OpenAPI 3 `style: form, explode: true`.

# `description`

```elixir
@spec description(OpenApiSpex.Operation.t() | nil) :: String.t()
```

Concatenates `summary` + `description` of an `%Operation{}` into the
human-readable tool description shown to the LLM.

# `param_locations`

```elixir
@spec param_locations(OpenApiSpex.Operation.t() | any()) :: %{
  required(String.t()) =&gt; atom()
}
```

Map of parameter name (string) → declared `:in` location atom
(`:path | :query | :header | :cookie`) for an `%Operation{}`.

# `parameters_schema`

```elixir
@spec parameters_schema(OpenApiSpex.Operation.t() | any()) :: map()
```

JSON-Schema map for `LangChain.Function.new!/1`'s `:parameters_schema`.

String-keyed throughout to match LangChain convention and the
`Map.put_new(schema, "additionalProperties", false)` behaviour of
`ChatAnthropic.get_parameters/1`. The `"required"` key is omitted when
empty so parameterless tools pass `ChatGoogleAI.for_api/1`'s exact-match
deletion check.

# `split_args`

```elixir
@spec split_args(%{required(String.t()) =&gt; atom()}, map()) :: {map(), map(), map()}
```

Splits the LLM-supplied `tool_args` map into `{path, query, body}`
according to each key's declared `:in` location. Unknown keys (and any
non-`:path`/`:query` locations like `:header` or `:cookie`) land in the
body bucket.

# `substitute_path`

```elixir
@spec substitute_path(String.t(), map()) :: String.t()
```

Substitutes `:placeholder` (Phoenix-style) and `{placeholder}`
(OpenAPI-style) segments in the path template with URI-encoded values
from `path_args`.

Phoenix routes carry `:id`-style templates; OpenAPI specs carry
`{id}`-style templates. Supporting both lets the same helper drive both
local controller routes and remote OpenAPI-described endpoints.

---

*Consult [api-reference.md](api-reference.md) for complete listing*
