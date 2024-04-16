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

  @sequences ["01234567890", "abcdefghijklmnopqrstuvwxyz"]
  @max_sequential_chars 3

  schema "users" do
    pow_user_fields()

    field :email, :string
    field :fullname, :string

    timestamps(type: :utc_datetime_usec)
  end

  def changeset(user, attrs) do
    user
    |> pow_changeset(attrs)
    |> pow_extension_changeset(attrs)
    |> custom_fields_changeset(attrs)
  end

  defp custom_fields_changeset(user, attrs) do
    user
    |> cast(attrs, [:email, :fullname])
    |> validate_required([:email, :fullname])
    |> validate_password()
    |> EmailValidator.validate_email(:email, checks: [:pow])
  end

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
end
