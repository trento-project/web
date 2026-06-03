# `TrentoWeb.Plugs.NormalizeListsPlug`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento_web/plugs/normalize_lists_plug.ex#L4)

This plug normalizes query string elements into lists when they are not formmated
in brackets format.
This is needed to be compatible with openAPI 3.0, as brackets format is not supported.
The plug must be used before `plug OpenApiSpex.Plug.CastAndValidate` to make effect.

Options:
- list_fields: Query fields to convert into a list for each action

Usage example:
plug TrentoWeb.Plugs.NormalizeListsPlug,
  list_fields: %{
    get_activity_log: ["severity", "actor", "type"]
  }

---

*Consult [api-reference.md](api-reference.md) for complete listing*
