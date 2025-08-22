defmodule TrentoWeb.V1.ApiKeysJSON do
  @moduledoc false

  alias Trento.Users.ApiKey

  def api_keys(%{api_keys: api_keys}),
    do:
      Enum.map(
        api_keys,
        &%{
          name: &1.name,
          created_at: &1.created_at,
          expire_at: &1.expire_at
        }
      )

  def new_api_key(%{
        api_key: %ApiKey{
          name: name,
          created_at: created_at,
          expire_at: expire_at
        },
        generated_token: generated_token
      }),
      do: %{
        name: name,
        created_at: created_at,
        expire_at: expire_at,
        access_token: generated_token
      }
end
