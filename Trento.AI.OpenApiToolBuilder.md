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

2. **Arg routing** — `resolve_path_and_body/3` turns the LLM-supplied
   argument map into a `{resolved_path, body_args}` pair, respecting
   each parameter's declared `in:` location.

Both `TrentoWeb.AI.ControllerTool` (local Plug.Test dispatch) and
`Trento.AI.RemoteHttpTool` (remote HTTP dispatch) consume these helpers,
so the OpenAPI surface drives both transports identically. The only
thing that differs is how the resolved request is actually executed.

# `body_to_string`

```elixir
@spec body_to_string(String.t() | nil | any()) :: String.t()
```

Coerces a response body to `String.t()`. `nil` → `""`, binaries pass through,
anything else is `inspect`-ed.

# `description`

```elixir
@spec description(OpenApiSpex.Operation.t() | nil) :: String.t()
```

Concatenates `summary` + `description` of an `%Operation{}` into the
human-readable tool description shown to the LLM.

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

# `resolve_path_and_body`

```elixir
@spec resolve_path_and_body(String.t(), OpenApiSpex.Operation.t() | nil, map()) ::
  {String.t(), map()}
```

Resolves a path template and splits `tool_args` into `{resolved_path, body_args}`.
Combines `param_locations/1`, `split_args/2`, `substitute_path/2`, and `append_query/2`.

---

*Consult [api-reference.md](api-reference.md) for complete listing*
