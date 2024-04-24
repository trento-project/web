defmodule Trento.Abilities do
  @moduledoc """
  The Abilities context.
  """

  import Ecto.Query, warn: false
  alias Trento.Repo

  alias Trento.Abilities.Ability

  @doc """
  Returns the list of abilities.

  ## Examples

      iex> list_abilities()
      [%Ability{}, ...]

  """
  def list_abilities do
    Repo.all(Ability)
  end

  @doc """
  Gets a single ability.

  Raises `Ecto.NoResultsError` if the Ability does not exist.

  ## Examples

      iex> get_ability!(123)
      %Ability{}

      iex> get_ability!(456)
      ** (Ecto.NoResultsError)

  """
  def get_ability!(id), do: Repo.get!(Ability, id)

  @doc """
  Creates a ability.

  ## Examples

      iex> create_ability(%{field: value})
      {:ok, %Ability{}}

      iex> create_ability(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_ability(attrs \\ %{}) do
    %Ability{}
    |> Ability.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a ability.

  ## Examples

      iex> update_ability(ability, %{field: new_value})
      {:ok, %Ability{}}

      iex> update_ability(ability, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_ability(%Ability{} = ability, attrs) do
    ability
    |> Ability.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a ability.

  ## Examples

      iex> delete_ability(ability)
      {:ok, %Ability{}}

      iex> delete_ability(ability)
      {:error, %Ecto.Changeset{}}

  """
  def delete_ability(%Ability{} = ability) do
    Repo.delete(ability)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking ability changes.

  ## Examples

      iex> change_ability(ability)
      %Ecto.Changeset{data: %Ability{}}

  """
  def change_ability(%Ability{} = ability, attrs \\ %{}) do
    Ability.changeset(ability, attrs)
  end
end
