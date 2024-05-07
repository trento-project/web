defmodule Trento.Users do
  @moduledoc """
  The Users context.
  """

  use Pow.Ecto.Context,
    repo: Trento.Repo,
    user: Trento.Users.User

  import Ecto.Query, warn: false
  alias Trento.Repo

  alias Trento.Abilities.UsersAbilities
  alias Trento.Users.User

  @impl true
  @doc """
  get_by function overrides the one defined in Pow.Ecto.Context,
  we retrieve the user by username as traditional Pow flow but we also exclude
  deleted and locked users
  """
  def get_by(clauses) do
    username = clauses[:username]

    User
    |> where([u], is_nil(u.deleted_at) and is_nil(u.locked_at) and u.username == ^username)
    |> Repo.one()
  end

  def list_users do
    User
    |> where([u], is_nil(u.deleted_at))
    |> preload(:abilities)
    |> Repo.all()
  end

  def get_user(id) do
    case User
         |> where([u], is_nil(u.deleted_at) and u.id == ^id)
         |> preload(:abilities)
         |> Repo.one() do
      nil -> {:error, :not_found}
      user -> {:ok, user}
    end
  end

  def create_user(%{abilities: abilities} = attrs) when not is_nil(abilities) do
    result =
      Ecto.Multi.new()
      |> Ecto.Multi.insert(:user, User.changeset(%User{}, set_locked_at(attrs)))
      |> insert_abilities_multi(abilities)
      |> Repo.transaction()

    case result do
      {:ok, %{user: user}} ->
        {:ok, Map.put(user, :abilities, abilities)}

      {:error, _, changeset_error, _} ->
        {:error, changeset_error}
    end
  end

  def create_user(attrs) do
    %User{abilities: []}
    |> User.changeset(set_locked_at(attrs))
    |> Repo.insert()
  end

  def update_user_profile(%User{id: 1}, _), do: {:error, :forbidden}

  def update_user_profile(%User{} = user, attrs) do
    user
    |> User.profile_update_changeset(attrs)
    |> Repo.update()
  end

  def update_user(%User{id: 1}, _), do: {:error, :forbidden}

  def update_user(%User{locked_at: nil} = user, %{enabled: false} = attrs) do
    do_update(user, Map.put(attrs, :locked_at, DateTime.utc_now()))
  end

  def update_user(%User{locked_at: locked_at} = user, %{enabled: false} = attrs)
      when not is_nil(locked_at) do
    do_update(user, attrs)
  end

  def update_user(%User{} = user, attrs) do
    do_update(user, Map.put(attrs, :locked_at, nil))
  end

  def delete_user(%User{id: 1}), do: {:error, :forbidden}

  def delete_user(%User{abilities: []} = user) do
    user
    |> User.delete_changeset(%{deleted_at: DateTime.utc_now()})
    |> Repo.update()
  end

  def delete_user(%User{} = user) do
    result =
      Ecto.Multi.new()
      |> Ecto.Multi.update(:user, User.delete_changeset(user, %{deleted_at: DateTime.utc_now()}))
      |> delete_abilities_multi()
      |> Repo.transaction()

    case result do
      {:ok, %{user: user}} ->
        {:ok, user}

      {:error, _, changeset_error, _} ->
        {:error, changeset_error}
    end
  end

  defp set_locked_at(%{enabled: false} = attrs) do
    Map.put(attrs, :locked_at, DateTime.utc_now())
  end

  defp set_locked_at(attrs), do: attrs

  defp insert_abilities_multi(multi, []), do: multi

  defp insert_abilities_multi(multi, abilities) do
    Enum.reduce(abilities, multi, fn %{id: ability_id}, acc ->
      Ecto.Multi.insert(acc, "ability_#{ability_id}", fn %{user: %User{id: user_id}} ->
        UsersAbilities.changeset(%UsersAbilities{}, %{user_id: user_id, ability_id: ability_id})
      end)
    end)
  end

  defp delete_abilities_multi(multi) do
    Ecto.Multi.delete_all(
      multi,
      :delete_abilities,
      fn %{user: %User{id: user_id}} ->
        from(u in UsersAbilities, where: u.user_id == ^user_id)
      end
    )
  end

  defp do_update(user, %{abilities: abilities} = attrs) do
    result =
      Ecto.Multi.new()
      |> Ecto.Multi.update(:user, User.update_changeset(user, attrs))
      |> delete_abilities_multi()
      |> insert_abilities_multi(abilities)
      |> Repo.transaction()

    case result do
      {:ok, %{user: user}} ->
        {:ok, Map.put(user, :abilities, abilities)}

      {:error, _, changeset_error, _} ->
        {:error, changeset_error}
    end
  end

  defp do_update(user, attrs) do
    user
    |> User.update_changeset(attrs)
    |> Repo.update()
  rescue
    Ecto.StaleEntryError -> {:error, :stale_entry}
  end
end
