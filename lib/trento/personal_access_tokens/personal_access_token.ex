defmodule Trento.PersonalAccessTokens.PersonalAccessToken do
  @moduledoc """
  Represents a Personal Access Token for a user.
  """

  use Ecto.Schema
  import Ecto.Changeset

  alias Trento.Users.User

  @type t :: %__MODULE__{}

  @primary_key {:id, :binary_id, autogenerate: true}
  schema "personal_access_tokens" do
    field :name, :string
    field :hashed_token, :string, redact: true, primary_key: true
    field :token, :string, virtual: true, redact: true
    field :expires_at, :utc_datetime_usec

    belongs_to :user, User

    timestamps(inserted_at: :created_at, type: :utc_datetime_usec)
  end

  @doc """
  Generates a SHA-512 hash of the given token.
  Returns nil if the input token is nil.

  Argon2 does not fit well for this use case because:
    1. Every Argon2.hash_pwd_salt(token) call generates a different hash even for the same input token.
       This is due to the random salt used internally by Argon2, so that it becomes impossible to query the database for a given token hash.
    2. In order to run a Argon2.verify_pass(plain_pat, hashed_pat) we would need to query the hashed_pat first. But unless we rely on other information we cannot get that.
    3. We need the hashing to be fast since it will possibly happen on a lot of interactions with the system.
  """
  @spec hash_token(String.t() | nil) :: String.t() | nil
  def hash_token(nil), do: nil

  def hash_token(token) do
    :sha512
    |> :crypto.hash(token)
    |> Base.encode64(padding: false)
  end

  def changeset(pat, attrs) do
    hashed_token =
      attrs
      |> Map.get(:token)
      |> hash_token()

    pat
    |> cast(Map.put(attrs, :hashed_token, hashed_token), [
      :token,
      :hashed_token,
      :name,
      :expires_at,
      :user_id
    ])
    |> validate_required([:token, :hashed_token, :name, :user_id])
    |> unique_constraint([:user_id, :name], error_key: :name)
    |> unique_constraint([:user_id, :hashed_token], error_key: :hashed_token)
    |> foreign_key_constraint(:user_id, message: "User does not exist")
  end
end
