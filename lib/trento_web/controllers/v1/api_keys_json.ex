defmodule TrentoWeb.V1.ApiKeysJSON do
  @moduledoc false

  alias Trento.Users.ApiKey

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
