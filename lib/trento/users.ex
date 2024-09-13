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
  alias Trento.UserIdentities.UserIdentity

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
    |> preload(:user_identities)
    |> Repo.all()
  end

  @doc """
  Returns all usernames tupled with the deleted_at timestamp, including those for users that are soft-deleted.
  """
  @spec list_all_usernames :: list({String.t(), DateTime.t()})
  def list_all_usernames do
    User
    |> select([u], {u.username, u.deleted_at})
    |> Repo.all()
  end

  def get_user(id) do
    case User
         |> where([u], is_nil(u.deleted_at) and u.id == ^id)
         |> preload(:abilities)
         |> preload(:user_identities)
         |> Repo.one() do
      nil -> {:error, :not_found}
      user -> {:ok, user}
    end
  end

  def create_user(%{abilities: abilities} = attrs) when not is_nil(abilities) do
    updated_attrs =
      attrs
      |> maybe_set_locked_at()
      |> maybe_set_password_change_requested_at(false)

    result =
      Ecto.Multi.new()
      |> Ecto.Multi.insert(:user, User.changeset(%User{user_identities: []}, updated_attrs))
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
    updated_attrs =
      attrs
      |> maybe_set_locked_at()
      |> maybe_set_password_change_requested_at(false)

    %User{abilities: [], user_identities: []}
    |> User.changeset(updated_attrs)
    |> Repo.insert()
  end

  def update_user_profile(%User{username: username} = user, attrs) do
    if username == admin_username() do
      {:error, :forbidden}
    else
      updated_attrs = maybe_set_password_change_requested_at(attrs, true)

      user
      |> User.profile_update_changeset(updated_attrs)
      |> Repo.update()
    end
  end

  def update_user(%User{locked_at: nil} = user, %{enabled: false} = attrs) do
    updated_attrs =
      attrs
      |> Map.put(:locked_at, DateTime.utc_now())
      |> maybe_set_password_change_requested_at(false)
      |> maybe_disable_totp()

    do_update(user, updated_attrs)
  end

  def update_user(%User{locked_at: locked_at} = user, %{enabled: false} = attrs)
      when not is_nil(locked_at) do
    updated_attrs =
      attrs
      |> maybe_set_password_change_requested_at(false)
      |> maybe_disable_totp()

    do_update(user, updated_attrs)
  end

  def update_user(%User{} = user, attrs) do
    updated_attrs =
      attrs
      |> Map.put(:locked_at, nil)
      |> maybe_set_password_change_requested_at(false)
      |> maybe_disable_totp()

    do_update(user, updated_attrs)
  end

  def maybe_disable_totp(%{totp_disabled: true} = attrs),
    do: Map.put(attrs, :totp_enabled_at, nil)

  def maybe_disable_totp(attrs), do: attrs

  def delete_user(%User{username: username} = user) do
    if username == admin_username() do
      {:error, :forbidden}
    else
      result =
        Ecto.Multi.new()
        |> Ecto.Multi.update(
          :user,
          User.delete_changeset(user, %{deleted_at: DateTime.utc_now()})
        )
        |> delete_abilities_multi()
        |> delete_user_identities_multi()
        |> Repo.transaction()

      case result do
        {:ok, %{user: user}} ->
          {:ok, user}

        {:error, _, changeset_error, _} ->
          {:error, changeset_error}
      end
    end
  end

  def reset_totp(%User{} = user) do
    update_user_totp(user, %{
      totp_enabled_at: nil,
      totp_secret: nil,
      totp_last_used_at: nil
    })
  end

  def initiate_totp_enrollment(%User{totp_enabled_at: nil} = user) do
    result =
      Ecto.Multi.new()
      |> Ecto.Multi.run(:reset_totp, fn _, _ ->
        reset_totp(user)
      end)
      |> Ecto.Multi.run(
        :enroll_totp,
        fn _, %{reset_totp: user} ->
          update_user_totp(user, %{
            totp_secret: NimbleTOTP.secret()
          })
        end
      )
      |> Repo.transaction()

    case result do
      {:ok, %{enroll_totp: %User{totp_secret: totp_secret, username: username}}} ->
        {:ok,
         %{
           secret: totp_secret,
           secret_qr_encoded:
             NimbleTOTP.otpauth_uri("trento:#{username}", totp_secret, issuer: "Trento")
         }}

      {:error, _, changeset_error, _} ->
        {:error, changeset_error}
    end
  end

  def initiate_totp_enrollment(_), do: {:error, :totp_already_enabled}

  def confirm_totp_enrollment(
        %User{totp_secret: totp_secret, totp_enabled_at: nil, username: username} = user,
        totp_code
      ) do
    if username == admin_username() do
      {:error, :forbidden}
    else
      if NimbleTOTP.valid?(totp_secret, totp_code) do
        now = DateTime.utc_now()
        update_user_totp(user, %{totp_enabled_at: now, totp_last_used_at: now})
      else
        {:error, :enrollment_totp_not_valid}
      end
    end
  end

  def confirm_totp_enrollment(_, _), do: {:error, :totp_already_enabled}

  def validate_totp(%User{totp_enabled_at: nil} = user, _), do: {:ok, user}

  def validate_totp(
        %User{totp_secret: totp_secret, totp_last_used_at: totp_last_used_at} = user,
        totp_code
      ) do
    if NimbleTOTP.valid?(totp_secret, totp_code, since: totp_last_used_at) do
      update_user_totp(user, %{totp_last_used_at: DateTime.utc_now()})
    else
      {:error, :totp_invalid}
    end
  end

  defp admin_username, do: Application.fetch_env!(:trento, :admin_user)

  defp maybe_set_locked_at(%{enabled: false} = attrs) do
    Map.put(attrs, :locked_at, DateTime.utc_now())
  end

  defp maybe_set_locked_at(attrs), do: attrs

  # 2nd argument is a boolean. true if it is a profile change, false otherwise
  defp maybe_set_password_change_requested_at(%{password: _} = attrs, true) do
    Map.put(attrs, :password_change_requested_at, nil)
  end

  defp maybe_set_password_change_requested_at(%{password: _} = attrs, false) do
    Map.put(attrs, :password_change_requested_at, DateTime.utc_now())
  end

  defp maybe_set_password_change_requested_at(attrs, _), do: attrs

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

  defp delete_user_identities_multi(multi) do
    Ecto.Multi.delete_all(
      multi,
      :delete_user_identities,
      fn %{user: %User{id: user_id}} ->
        from(u in UserIdentity, where: u.user_id == ^user_id)
      end
    )
  end

  defp do_update(%User{username: username} = user, %{abilities: abilities} = attrs) do
    if username == admin_username() do
      {:error, :forbidden}
    else
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
  rescue
    Ecto.StaleEntryError -> {:error, :stale_entry}
  end

  defp do_update(%User{username: username} = user, attrs) do
    if username == admin_username() do
      {:error, :forbidden}
    else
      user
      |> User.update_changeset(attrs)
      |> Repo.update()
    end
  rescue
    Ecto.StaleEntryError -> {:error, :stale_entry}
  end

  defp update_user_totp(%User{username: username} = user, attrs) do
    if username == admin_username() do
      {:error, :forbidden}
    else
      user
      |> User.totp_update_changeset(attrs)
      |> Repo.update()
    end
  end
end
