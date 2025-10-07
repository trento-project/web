defmodule TrentoWeb.OpenApi.V1.Schema.PersonalAccessToken do
  @moduledoc false

  require OpenApiSpex
  alias OpenApiSpex.Schema

  defmodule PersonalAccessTokenEntry do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "PersonalAccessTokenEntryV1",
        description: "A User's Personal Access Token.",
        type: :object,
        additionalProperties: false,
        properties: %{
          jti: %Schema{
            type: :string,
            format: :uuid,
            description: "Personal Access Token ID.",
            nullable: false,
            example: "550e8400-e29b-41d4-a716-446655440000"
          },
          name: %Schema{
            type: :string,
            description: "Personal Access Token name.",
            nullable: false,
            example: "My Token"
          },
          expires_at: %Schema{
            type: :string,
            format: :"date-time",
            description: "Personal Access Token expiration date.",
            nullable: true,
            example: "2024-12-31T23:59:59Z"
          },
          created_at: %Schema{
            type: :string,
            format: :"date-time",
            description: "Date of API Key creation.",
            nullable: false,
            example: "2023-01-01T00:00:00Z"
          }
        },
        required: [:jti, :name, :expires_at, :created_at],
        example: %{
          jti: "550e8400-e29b-41d4-a716-446655440000",
          name: "My Token",
          expires_at: "2024-12-31T23:59:59Z",
          created_at: "2023-01-01T00:00:00Z"
        }
      },
      struct?: false
    )
  end

  defmodule PersonalAccessTokenCollection do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "PersonalAccessTokenCollectionV1",
        description: "List of a user's Personal Access Tokens.",
        type: :array,
        items: PersonalAccessTokenEntry,
        example: [
          %{
            jti: "550e8400-e29b-41d4-a716-446655440000",
            name: "My Token",
            expires_at: "2024-12-31T23:59:59Z",
            created_at: "2023-01-01T00:00:00Z"
          }
        ]
      },
      struct?: false
    )
  end

  defmodule CreatePersonalAccessToken do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "CreatePersonalAccessTokenV1",
        description: "Request to create a new Personal Access Token.",
        type: :object,
        additionalProperties: false,
        properties: %{
          name: %Schema{
            type: :string,
            description: "Personal Access Token name.",
            nullable: false,
            example: "My Token"
          },
          expires_at: %Schema{
            type: :string,
            format: :"date-time",
            description: "Personal Access Token expiration date.",
            nullable: true,
            example: "2024-12-31T23:59:59Z"
          }
        },
        required: [:name],
        example: %{
          name: "My Token",
          expires_at: "2024-12-31T23:59:59Z"
        }
      },
      struct?: false
    )
  end

  defmodule CreatedPersonalAccessToken do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "CreatedPersonalAccessTokenV1",
        description: "A User's newly created Personal Access Token.",
        type: :object,
        additionalProperties: false,
        properties: %{
          jti: %Schema{
            type: :string,
            format: :uuid,
            description: "Personal Access Token ID.",
            nullable: false,
            example: "550e8400-e29b-41d4-a716-446655440000"
          },
          name: %Schema{
            type: :string,
            description: "Personal Access Token name.",
            nullable: false,
            example: "My Token"
          },
          expires_at: %Schema{
            type: :string,
            format: :"date-time",
            description: "Personal Access Token expiration date.",
            nullable: true,
            example: "2024-12-31T23:59:59Z"
          },
          created_at: %Schema{
            type: :string,
            format: :"date-time",
            description: "Date of Personal Access Token creation.",
            nullable: false,
            example: "2023-01-01T00:00:00Z"
          },
          access_token: %Schema{
            type: :string,
            description: "Personal Access Token access token.",
            nullable: false,
            example: "abc123"
          }
        },
        required: [:jti, :name, :expires_at, :created_at, :access_token],
        example: %{
          jti: "550e8400-e29b-41d4-a716-446655440000",
          name: "My Token",
          expires_at: "2024-12-31T23:59:59Z",
          created_at: "2023-01-01T00:00:00Z",
          access_token: "abc123"
        }
      },
      struct?: false
    )
  end
end
