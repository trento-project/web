defmodule Trento.Users.User do
  @moduledoc false

  use Ecto.Schema
  import Ecto.Changeset

  use Pow.Ecto.Schema,
    user_id_field: :username,
    password_hash_verify: {&Argon2.hash_pwd_salt/1, &Argon2.verify_pass/2}

  use Pow.Extension.Ecto.Schema,
    extensions: [PowPersistentSession]

  alias EctoCommons.EmailValidator

  use PowAssent.Ecto.Schema

  alias Trento.Abilities.{
    Ability,
    UsersAbilities
  }

  alias Trento.Support.Ecto.EncryptedBinary

  defdelegate authorize(action, user, params), to: Trento.Users.Policy

  @sequences ["01234567890", "abcdefghijklmnopqrstuvwxyz", "ABCDEFGHIJKLMNOPQRSTUVWXYZ"]
  @max_sequential_chars 3

  schema "users" do
    pow_user_fields()

    field :email, :string
    field :fullname, :string
    field :deleted_at, :utc_datetime_usec
    field :locked_at, :utc_datetime_usec
    field :password_change_requested_at, :utc_datetime_usec
    field :totp_enabled_at, :utc_datetime_usec
    field :totp_secret, EncryptedBinary, redact: true
    field :totp_last_used_at, :utc_datetime_usec
    field :lock_version, :integer, default: 1

    many_to_many :abilities, Ability, join_through: UsersAbilities, unique: true

    timestamps(type: :utc_datetime_usec)
  end

  def changeset(user, attrs) do
    user
    |> pow_changeset(attrs)
    |> pow_extension_changeset(attrs)
    |> validate_password()
    |> custom_fields_changeset(attrs)
    |> cast(attrs, [:locked_at, :password_change_requested_at])
  end

  def user_identity_changeset(user_or_changeset, user_identity, attrs, user_id_attrs) do
    username = Map.get(attrs, "username")

    user_or_changeset
    |> cast(attrs, [:username, :email])
    |> put_change(
      :fullname,
      Map.get(attrs, "given_name", "Trento IDP User #{username}")
    )
    |> pow_assent_user_identity_changeset(user_identity, attrs, user_id_attrs)
  end

  def update_changeset(user, attrs) do
    user
    |> maybe_apply_password_changesets(attrs)
    |> pow_extension_changeset(attrs)
    |> custom_fields_changeset(attrs)
    |> cast(attrs, [:locked_at, :lock_version, :password_change_requested_at, :totp_enabled_at])
    |> validate_inclusion(:totp_enabled_at, [nil])
    |> optimistic_lock(:lock_version)
  end

  def profile_update_changeset(user, attrs) do
    user
    |> validate_current_password(attrs)
    |> pow_password_changeset(attrs)
    |> pow_extension_changeset(attrs)
    |> validate_password()
    |> custom_fields_changeset(attrs)
    |> cast(attrs, [:password_change_requested_at])
  end

  def totp_update_changeset(user, attrs) do
    cast(user, attrs, [:totp_enabled_at, :totp_secret, :totp_last_used_at])
  end

  def delete_changeset(
        %__MODULE__{username: username, email: email} = user,
        %{deleted_at: deleted_at} = attrs
      ) do
    user
    |> cast(attrs, [:deleted_at])
    |> validate_required(:deleted_at)
    |> put_change(:username, "#{username}__#{deleted_at}")
    |> put_change(:email, "#{email}__#{deleted_at}")
  end

  # When the user has user identities associated, means that the user comes from an external IDP
  # the password is not set in the user schema, so it should be skipped in updates.
  defp maybe_apply_password_changesets(%{user_identities: []} = user, attrs) do
    user
    |> pow_password_changeset(attrs)
    |> validate_password()
  end

  defp maybe_apply_password_changesets(user, _), do: user

  defp validate_current_password(changeset, %{password: _password} = attrs),
    do: pow_current_password_changeset(changeset, attrs)

  defp validate_current_password(changeset, _), do: changeset

  defp validate_password(changeset) do
    changeset
    |> validate_no_repetitive_characters()
    |> validate_no_sequential_characters()
  end

  defp validate_no_repetitive_characters(changeset) do
    Ecto.Changeset.validate_change(changeset, :password, fn :password, password ->
      case repetitive_characters?(password) do
        true -> [password: "has repetitive characters"]
        false -> []
      end
    end)
  end

  defp repetitive_characters?(password) when is_binary(password) do
    password
    |> String.to_charlist()
    |> repetitive_characters?()
  end

  defp repetitive_characters?([c, c, c | _rest]), do: true
  defp repetitive_characters?([_c | rest]), do: repetitive_characters?(rest)
  defp repetitive_characters?([]), do: false

  defp validate_no_sequential_characters(changeset) do
    Ecto.Changeset.validate_change(changeset, :password, fn :password, password ->
      case sequential_characters?(password) do
        true -> [password: "has sequential characters"]
        false -> []
      end
    end)
  end

  defp sequential_characters?(password) do
    Enum.any?(@sequences, &sequential_characters?(password, &1))
  end

  defp sequential_characters?(password, sequence) do
    max = String.length(sequence) - 1 - @max_sequential_chars

    Enum.any?(0..max, fn x ->
      pattern = String.slice(sequence, x, @max_sequential_chars + 1)

      String.contains?(password, pattern)
    end)
  end

  defp custom_fields_changeset(user, attrs) do
    user
    |> cast(attrs, [:email, :fullname])
    |> validate_required([:email, :fullname])
    |> EmailValidator.validate_email(:email, checks: [:pow])
    |> unique_constraint(:email)
  end
end
