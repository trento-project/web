# `Trento.Hosts.ValueObjects.AwsProvider`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/hosts/value_objects/aws_provider.ex#L4)

AWS provider value object

# `t`

```elixir
@type t() :: %Trento.Hosts.ValueObjects.AwsProvider{
  account_id: term(),
  ami_id: term(),
  availability_zone: term(),
  data_disk_number: term(),
  instance_id: term(),
  instance_type: term(),
  region: term(),
  vpc_id: term()
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
