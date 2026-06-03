# `Trento.Abilities`
[🔗](https://github.com/trento-project/web/blob/main/lib/trento/abilities.ex#L4)

The Abilities context.

# `change_ability`

Returns an `%Ecto.Changeset{}` for tracking ability changes.

## Examples

    iex> change_ability(ability)
    %Ecto.Changeset{data: %Ability{}}

# `create_ability`

Creates a ability.

## Examples

    iex> create_ability(%{field: value})
    {:ok, %Ability{}}

    iex> create_ability(%{field: bad_value})
    {:error, %Ecto.Changeset{}}

# `delete_ability`

Deletes a ability.

## Examples

    iex> delete_ability(ability)
    {:ok, %Ability{}}

    iex> delete_ability(ability)
    {:error, %Ecto.Changeset{}}

# `get_ability!`

Gets a single ability.

Raises `Ecto.NoResultsError` if the Ability does not exist.

## Examples

    iex> get_ability!(123)
    %Ability{}

    iex> get_ability!(456)
    ** (Ecto.NoResultsError)

# `list_abilities`

Returns the list of abilities.

## Examples

    iex> list_abilities()
    [%Ability{}, ...]

# `update_ability`

Updates a ability.

## Examples

    iex> update_ability(ability, %{field: new_value})
    {:ok, %Ability{}}

    iex> update_ability(ability, %{field: bad_value})
    {:error, %Ecto.Changeset{}}

---

*Consult [api-reference.md](api-reference.md) for complete listing*
