defmodule TrentoWeb.OpenApi.V1.Schema.PersonalAccessToken do
  @moduledoc false

  require OpenApiSpex
  alias OpenApiSpex.Schema

  defmodule PersonalAccessTokenEntry do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "PersonalAccessTokenEntry",
        description: "A User's Personal Access Token",
        type: :object,
        additionalProperties: false,
        properties: %{
          jti: %Schema{
            type: :string,
            format: :uuid,
            description: "Personal Access Token ID",
            nullable: false
          },
          name: %Schema{type: :string, description: "Personal Access Token name", nullable: false},
          expire_at: %Schema{
            type: :string,
            format: :"date-time",
            description: "Personal Access Token expiration date",
            nullable: true
          },
          created_at: %Schema{
            type: :string,
            format: :"date-time",
            description: "Date of API Key creation",
            nullable: false
          }
        },
        required: [:jti, :name, :expire_at, :created_at]
      },
      struct?: false
    )
  end

  defmodule PersonalAccessTokenCollection do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "PersonalAccessTokenCollection",
        description: "List of a user's Personal Access Tokens",
        type: :array,
        items: PersonalAccessTokenEntry
      },
      struct?: false
    )
  end

  defmodule CreatePersonalAccessToken do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "CreatePersonalAccessToken",
        description: "Request to create a new Personal Access Token",
        type: :object,
        additionalProperties: false,
        properties: %{
          name: %Schema{type: :string, description: "Personal Access Token name", nullable: false},
          expire_at: %Schema{
            type: :string,
            format: :"date-time",
            description: "Personal Access Token expiration date",
            nullable: true
          }
        },
        required: [:name]
      },
      struct?: false
    )
  end

  defmodule NewlyCreatedPersonalAccessToken do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "NewlyCreatedPersonalAccessToken",
        description: "A User's newly created Personal Access Token",
        type: :object,
        additionalProperties: false,
        properties: %{
          jti: %Schema{
            type: :string,
            format: :uuid,
            description: "Personal Access Token ID",
            nullable: false
          },
          name: %Schema{type: :string, description: "Personal Access Token name", nullable: false},
          expire_at: %Schema{
            type: :string,
            format: :"date-time",
            description: "Personal Access Token expiration date",
            nullable: true
          },
          created_at: %Schema{
            type: :string,
            format: :"date-time",
            description: "Date of Personal Access Token creation",
            nullable: false
          },
          access_token: %Schema{
            type: :string,
            description: "Personal Access Token access token",
            nullable: false
          }
        },
        required: [:jti, :name, :expire_at, :created_at, :access_token]
      },
      struct?: false
    )
  end
end
