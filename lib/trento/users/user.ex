defmodule Trento.Users.User do
  @moduledoc false

  use Ecto.Schema

  use Pow.Ecto.Schema,
    user_id_field: :username

  use Pow.Extension.Ecto.Schema,
    extensions: [PowPersistentSession]

  schema "users" do
    pow_user_fields()

    timestamps(type: :utc_datetime_usec)
  end

  def changeset(user, attrs) do
    user
    |> pow_changeset(attrs)
    |> pow_extension_changeset(attrs)
  end
end
