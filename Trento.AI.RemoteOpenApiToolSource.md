# `Trento.AI.RemoteOpenApiToolSource`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/ai/remote_open_api_tool_source.ex#L4)

`Trento.AI.ToolSource` implementation that derives AI assistant tools
from a remote service's OpenAPI document.

At `tools/1` time:

1. Fetch the spec from `:spec_url` (HTTP GET, JSON response).
2. Decode via `OpenApiSpex.OpenApi.from_map/1` into the struct
   hierarchy.
3. Walk every `(path, verb)` pair, keep operations whose `tags`
   include `"MCP"`.
4. Build a `Trento.AI.OperationEntry` per operation. `tool_name` and
   `display_text` follow the same fallback chain used locally:
   `operation.extensions["x-ai-tool"]["name" | "display_text"]` →
   `operation.operationId` / `operation.summary` → derived
   `<verb>_<slugified path>` / `tool_name`.
5. Extract the dispatch base URL from `spec.servers |> List.first()`'s
   `:url` field.
6. Map each entry through `Trento.AI.RemoteHttpTool.build/2`, threading
   that base URL into the dispatcher's closure.

## Configuration

    config :trento, :ai,
      tool_sources: [
        ...,
        {Trento.AI.RemoteOpenApiToolSource,
         name: :wanda,
         spec_url: "http://localhost:4001/api/all/openapi"}
      ]

The base URL used for tool invocations comes from `spec.servers[0].url`
in the fetched OpenAPI document — the spec itself is the source of
truth. Relative server URLs (no http/https scheme) are resolved against
`tool_context.request_origin` at request time — see
`Trento.AI.RemoteHttpTool`.

Spec-fetch failures, and specs missing a usable `servers[0].url`, are
logged and the source contributes `[]` for the current call; other
configured sources still surface their tools.

---

*Consult [api-reference.md](api-reference.md) for complete listing*
