defmodule Trento.Users.ApiKey do
  @moduledoc """
  Represents an API key for a user.
  """

  use Ecto.Schema
  import Ecto.Changeset

  alias Trento.Users.User

  @type t :: %__MODULE__{}

  schema "api_keys" do
    field :name, :string
    field :expire_at, :utc_datetime_usec

    belongs_to :user, User, primary_key: true

    timestamps(inserted_at: :created_at, type: :utc_datetime_usec)
  end

  def changeset(api_key, attrs) do
    api_key
    |> cast(attrs, [:name, :expire_at, :user_id])
    |> validate_required([:name, :user_id])
    |> unique_constraint([:user_id, :name], error_key: :name)
    |> foreign_key_constraint(:user_id, message: "User does not exist")
  end
end
