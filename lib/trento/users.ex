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
    updated_attrs =
      attrs
      |> maybe_set_locked_at()
      |> maybe_set_password_change_requested_at(false)

    result =
      Ecto.Multi.new()
      |> Ecto.Multi.insert(:user, User.changeset(%User{}, updated_attrs))
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

    %User{abilities: []}
    |> User.changeset(updated_attrs)
    |> Repo.insert()
  end

  def update_user_profile(%User{id: 1}, _), do: {:error, :forbidden}

  def update_user_profile(%User{} = user, attrs) do
    updated_attrs = maybe_set_password_change_requested_at(attrs, true)

    user
    |> User.profile_update_changeset(updated_attrs)
    |> Repo.update()
  end

  def update_user(%User{id: 1}, _), do: {:error, :forbidden}

  def update_user(%User{locked_at: nil} = user, %{enabled: false} = attrs) do
    updated_attrs =
      attrs
      |> Map.put(:locked_at, DateTime.utc_now())
      |> maybe_set_password_change_requested_at(false)

    do_update(user, updated_attrs)
  end

  def update_user(%User{locked_at: locked_at} = user, %{enabled: false} = attrs)
      when not is_nil(locked_at) do
    do_update(user, maybe_set_password_change_requested_at(attrs, false))
  end

  def update_user(%User{} = user, attrs) do
    updated_attrs =
      attrs
      |> Map.put(:locked_at, nil)
      |> maybe_set_password_change_requested_at(false)

    do_update(user, updated_attrs)
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

  def reset_totp(%User{id: 1}), do: {:error, :forbidden}

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

  def confirm_totp_enrollment(%User{id: 1}, _), do: {:error, :forbidden}

  def confirm_totp_enrollment(
        %User{totp_secret: totp_secret, totp_enabled_at: nil} = user,
        totp_code
      ) do
    if NimbleTOTP.valid?(totp_secret, totp_code) do
      now = DateTime.utc_now()
      update_user_totp(user, %{totp_enabled_at: now, totp_last_used_at: now})
    else
      {:error, :enrollment_totp_not_valid}
    end
  end

  def confirm_totp_enrollment(_, _), do: {:error, :totp_already_enabled}

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
  rescue
    Ecto.StaleEntryError -> {:error, :stale_entry}
  end

  defp do_update(user, attrs) do
    user
    |> User.update_changeset(attrs)
    |> Repo.update()
  rescue
    Ecto.StaleEntryError -> {:error, :stale_entry}
  end

  defp update_user_totp(%User{id: 1}, _), do: {:error, :forbidden}

  defp update_user_totp(%User{} = user, attrs) do
    user
    |> User.totp_update_changeset(attrs)
    |> Repo.update()
  end
end
