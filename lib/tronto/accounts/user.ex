defmodule Tronto.Accounts.User do
  @moduledoc false

  use Ecto.Schema
  use Pow.Ecto.Schema

  schema "users" do
    pow_user_fields()

    timestamps()
  end
end
