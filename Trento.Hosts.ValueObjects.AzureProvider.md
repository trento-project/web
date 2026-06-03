# `Trento.Hosts.ValueObjects.AzureProvider`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/hosts/value_objects/azure_provider.ex#L4)

Azure provider value object

# `t`

```elixir
@type t() :: %Trento.Hosts.ValueObjects.AzureProvider{
  admin_username: term(),
  data_disk_number: term(),
  location: term(),
  offer: term(),
  resource_group: term(),
  sku: term(),
  vm_name: term(),
  vm_size: term()
}
```

# `cast_and_validate_required_embed`

# `cast_and_validate_required_polymorphic_embed`

# `changeset`

Casts the fields by using Ecto reflection,
validates the required ones and returns a changeset.

# `new`

```elixir
@spec new(map() | [map()]) :: {:ok, t() | [t()]} | {:error, any()}
```

Returns an ok tuple if the params are valid, otherwise returns `{:error, {:validation, errors}}`.
Accepts a map or a list of maps.

# `new!`

```elixir
@spec new!(map() | [map()]) :: t() | [t()]
```

Returns new struct(s) if the params are valid, otherwise raises a `RuntimeError`.

# `validate_required_fields`

---

*Consult [api-reference.md](api-reference.md) for complete listing*
