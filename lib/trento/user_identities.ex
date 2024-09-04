defmodule Trento.UserIdentities do
  @moduledoc """
  The UserIdentities context, serves as custom context for PowAssent
  """
  require Logger

  use PowAssent.Ecto.UserIdentities.Context,
    repo: Trento.Repo,
    user: Trento.Users.User

  import Ecto.Query, warn: false

  alias Trento.Abilities.UsersAbilities
  alias Trento.Repo
  alias Trento.Users
  alias Trento.Users.User

  @impl true
  @doc """
  redefining the PowAssent create user method, this is called when the user login through idp and a user identity
  does not exists on our database.

  If a user with the same username exists on our database, the user will be recovered and associated with the idp identity,
  otherwise the user will be created.
  """
  def create_user(user_identity_params, %{"username" => username} = user_params, user_id_params) do
    existing_user = Users.get_by(username: username)
    maybe_create_user(existing_user, user_identity_params, user_params, user_id_params)
  end

  @impl true
  @doc """
  redefining the PowAssent upsert method, if a IDP user is associated with a locked user,
  this is called when the user login with IDP and exist in our database with or without a user identity
  """
  def upsert(%User{locked_at: locked_at} = user, _)
      when not is_nil(locked_at),
      do: {:error, {:user_not_allowed, user}}

  def upsert(user, user_identity_params) do
    pow_assent_upsert(maybe_assign_global_abilities(user), user_identity_params)
  end

  defp maybe_create_user(nil, user_identity_params, user_params, user_id_params) do
    case pow_assent_create_user(user_identity_params, user_params, user_id_params) do
      {:ok, %User{} = user} ->
        {:ok, maybe_assign_global_abilities(user)}

      error ->
        error
    end
  end

  defp maybe_create_user(user, _, _, _) do
    {:ok, maybe_assign_global_abilities(user)}
  end

  defp maybe_assign_global_abilities(user) do
    if admin_user?(user) do
      {:ok, user} = assign_global_abilities(user)

      user
    else
      user
    end
  end

  # assign_global_abilities assigns the global ability to the admin user retrieved from oidc
  # we don't use the Users context directly because it's forbidden to update an admin user.
  # The only exception is in this particular flow, because it's strictly needed
  defp assign_global_abilities(%User{} = user) do
    result =
      Ecto.Multi.new()
      |> Ecto.Multi.put(:user, user)
      |> Ecto.Multi.delete_all(
        :delete_abilities,
        fn %{user: %User{id: user_id}} ->
          from(u in UsersAbilities, where: u.user_id == ^user_id)
        end
      )
      |> Ecto.Multi.insert(:add_global_ability, fn %{user: %User{id: user_id}} ->
        UsersAbilities.changeset(%UsersAbilities{}, %{user_id: user_id, ability_id: 1})
      end)
      |> Repo.transaction()

    case result do
      {:ok, %{user: %{id: user_id}}} ->
        # reload the current user with full assoc
        Users.get_user(user_id)

      {:error, _, changeset_error, _} ->
        Logger.error(
          "could not assign the global abilities to the sso admin user #{inspect(changeset_error)}"
        )

        {:error, :assign_global_abilities}
    end
  end

  defp admin_user?(%User{username: username}),
    do: username == Application.fetch_env!(:trento, :admin_user)
end
