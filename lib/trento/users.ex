defmodule Trento.Users do
  @moduledoc """
  The Users context.
  """

  use Pow.Ecto.Context,
    repo: Trento.Repo,
    user: Trento.Users.User

  import Ecto.Query, warn: false
  alias Trento.Repo

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

  def create_user(attrs \\ %{}) do
    %User{}
    |> User.changeset(attrs)
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

  def delete_user(%User{} = user) do
    user
    |> User.delete_changeset(%{deleted_at: DateTime.utc_now()})
    |> Repo.update()
  end

  defp do_update(user, attrs) do
    user
    |> User.update_changeset(attrs)
    |> Repo.update()
  end
end
