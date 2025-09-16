defmodule Trento.PersonalAccessTokens.PersonalAccessToken do
  @moduledoc """
  Represents a Personal Access Token for a user.
  """

  use Ecto.Schema
  import Ecto.Changeset

  alias Trento.Users.User

  @type t :: %__MODULE__{}

  @primary_key {:jti, :binary_id, autogenerate: true}
  schema "personal_access_tokens" do
    field :name, :string
    field :expires_at, :utc_datetime_usec

    belongs_to :user, User

    timestamps(inserted_at: :created_at, type: :utc_datetime_usec)
  end

  def changeset(pat, attrs) do
    pat
    |> cast(attrs, [:name, :expires_at, :user_id])
    |> validate_required([:name, :user_id])
    |> unique_constraint([:user_id, :name], error_key: :name)
    |> foreign_key_constraint(:user_id, message: "User does not exist")
  end
end
