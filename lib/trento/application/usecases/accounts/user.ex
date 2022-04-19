defmodule Trento.User do
  @moduledoc false

  use Ecto.Schema

  use Pow.Ecto.Schema,
    user_id_field: :username

  use Pow.Extension.Ecto.Schema,
    extensions: [PowPersistentSession]

  schema "users" do
    pow_user_fields()

    timestamps()
  end
end
