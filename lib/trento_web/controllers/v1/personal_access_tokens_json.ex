defmodule TrentoWeb.V1.PersonalAccessTokensJSON do
  @moduledoc false

  alias Trento.PersonalAccessTokens.PersonalAccessToken

  def personal_access_tokens(%Ecto.Association.NotLoaded{}), do: []

  def personal_access_tokens(personal_access_tokens) do
    Enum.map(
      personal_access_tokens,
      &%{
        id: &1.id,
        name: &1.name,
        created_at: &1.created_at,
        expires_at: &1.expires_at
      }
    )
  end

  def new_personal_access_token(%{
        personal_access_token: %PersonalAccessToken{
          id: id,
          name: name,
          created_at: created_at,
          expires_at: expires_at
        },
        generated_token: generated_token
      }),
      do: %{
        id: id,
        name: name,
        created_at: created_at,
        expires_at: expires_at,
        access_token: generated_token
      }
end
