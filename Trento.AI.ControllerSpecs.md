# `Trento.AI.ControllerSpecs`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/ai/controller_specs.ex#L4)

Per-action AI-tool metadata macro. Sits next to `OpenApiSpex.ControllerSpecs.operation/2`
in controllers and labels the immediately following public function as an AI tool.

    operation :index,
      tags: ["User Management", "MCP"],
      summary: "Gets the list of users in the system."

    ai_tool :users_list, display_text: "List users"

    def index(conn, _params), do: ...

The first positional argument is the **tool name** as an atom; it becomes
the LLM-facing identifier verbatim via `Atom.to_string/1` (no casing
transform). The controller action the override applies to is inferred
from the immediately following public `def` via `@on_definition`.

Supported options:
  * `:display_text` — string. Overrides `operation.summary` as the human-friendly label
    rendered in the AG-UI tool-call card.

# `ai_tool`
*macro* 

Label the next public `def` as an AI tool.

The first argument is the tool name as an atom. Options:
  * `:display_text` — human-friendly label (defaults to `operation.summary`).

---

*Consult [api-reference.md](api-reference.md) for complete listing*
