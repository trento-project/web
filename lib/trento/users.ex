defmodule Trento.Users do
  @moduledoc """
  The Users context.
  """

  import Ecto.Query, warn: false
  alias Trento.Repo

  alias Trento.Users.User

  def list_users do
    User
    |> where([u], is_nil(u.deleted_at))
    |> Repo.all()
  end

  def get_user(id) do
    case User
         |> where([u], is_nil(u.deleted_at) and u.id == ^id)
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

  def update_user(%User{} = user, attrs) do
    user
    |> User.update_changeset(attrs)
    |> Repo.update()
  end

  def delete_user(%User{} = user) do
    user
    |> User.delete_changeset(%{deleted_at: DateTime.utc_now()})
    |> Repo.update()
  end

  def change_user(%User{} = user, attrs \\ %{}) do
    User.changeset(user, attrs)
  end
end
