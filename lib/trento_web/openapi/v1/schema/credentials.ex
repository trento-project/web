defmodule TrentoWeb.OpenApi.V1.Schema.Credentials do
  @moduledoc false

  require OpenApiSpex
  alias OpenApiSpex.Schema

  OpenApiSpex.schema(
    %{
      title: "Credentials",
      description: "Authentication result with access and refresh tokens for secure API usage.",
      type: :object,
      additionalProperties: false,
      properties: %{
        access_token: %Schema{type: :string, description: "Access token for API calls."},
        refresh_token: %Schema{type: :string, description: "Refresh token used to obtain new access tokens."},
        expires_in: %Schema{type: :integer, description: "Access token lifetime in seconds."}
      },
      required: [:access_token, :refresh_token, :expires_in],
      example: %{
        access_token: "eyJhbGciOi...",
        refresh_token: "eyJhbGciOi...",
        expires_in: 600
      }
    },
    struct?: false
  )
end
