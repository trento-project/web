# `Trento.Support.StructHelper`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/support/struct_helper.ex#L4)

This module provides structs utility functions

# `to_atomized_map`

```elixir
@spec to_atomized_map(map() | [map()] | struct() | [struct()]) :: map() | [map()]
```

Converts the string keys of a map to existing atoms.
If the key does not exist as atom it continues being a string

# `to_map`

```elixir
@spec to_map(map() | [map()] | struct() | [struct()]) :: map() | [map()]
```

Converts struct to map.
Saniteize struct fields by removing __meta__ and Ecto.Association.NotLoaded.t() fields.

---

*Consult [api-reference.md](api-reference.md) for complete listing*
