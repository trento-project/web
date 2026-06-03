# `TrentoWeb.Gettext`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento_web/gettext.ex#L4)

A module providing Internationalization with a gettext-based API.

By using [Gettext](https://hexdocs.pm/gettext),
your module gains a set of macros for translations, for example:

    import TrentoWeb.Gettext

    # Simple translation
    gettext("Here is the string to translate")

    # Plural translation
    ngettext("Here is the string to translate",
             "Here are the strings to translate",
             3)

    # Domain-based translation
    dgettext("errors", "Here is the error message to translate")

See the [Gettext Docs](https://hexdocs.pm/gettext) for detailed usage.

# `handle_missing_bindings`

# `handle_missing_plural_translation`

# `handle_missing_translation`

---

*Consult [api-reference.md](api-reference.md) for complete listing*
