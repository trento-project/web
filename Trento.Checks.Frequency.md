# `Trento.Checks.Frequency`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/checks/frequency.ex#L4)

How often the checks run periodically on every target, such as hosts and clusters:
every 5, 15 or 30 minutes, every 1, 6, 12 or 24 hours, or every 1, 2 or 4 weeks.

# `t`

```elixir
@type t() :: %Trento.Checks.Frequency{unit: term(), value: term()}
```

# `allowed`

```elixir
@spec allowed() :: [t()]
```

The frequencies a user can choose, from the most to the least frequent.

# `cast_and_validate_required_embed`

# `cast_and_validate_required_polymorphic_embed`

# `changeset`

```elixir
@spec changeset(t() | Ecto.Changeset.t(), map()) :: Ecto.Changeset.t()
```

Casts the fields by using Ecto reflection,
validates the required ones and returns a changeset.

# `default`

```elixir
@spec default() :: t()
```

# `format`

```elixir
@spec format(t() | :disabled) :: String.t()
```

Writes the compact notation of a frequency, like `6h`, or `disabled`, which parse/1 reads
back.

# `format_allowed`

```elixir
@spec format_allowed() :: String.t()
```

Writes disabled and the compact notation of the allowed frequencies, comma separated.

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

# `parse`

```elixir
@spec parse(String.t() | nil) ::
  {:ok, t() | :disabled | nil} | {:error, :invalid_frequency}
```

Parses the compact notation of a frequency: a value followed by `m`, `h` or `w`, like
`5m`, `6h` or `2w`, or a plain number of minutes matching an allowed frequency, like `60`.
The frequency goes through the same validation as the other inputs. `disabled` means
that the checks do not run periodically, and a missing value gives `nil`.

# `to_minutes`

```elixir
@spec to_minutes(t()) :: pos_integer()
```

# `validate_required_fields`

---

*Consult [api-reference.md](api-reference.md) for complete listing*
