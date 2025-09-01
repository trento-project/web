defmodule TrentoWeb.V1.PersonalAccessTokensJSON do
  @moduledoc false

  alias Trento.Users.PersonalAccessToken

  def new_personal_access_token(%{
        personal_access_token: %PersonalAccessToken{
          jti: jti,
          name: name,
          created_at: created_at,
          expire_at: expire_at
        },
        generated_token: generated_token
      }),
      do: %{
        jti: jti,
        name: name,
        created_at: created_at,
        expire_at: expire_at,
        access_token: generated_token
      }
end
