defmodule TrentoWeb.OpenApi.V1.Schema.ApiKey do
  @moduledoc false

  require OpenApiSpex
  alias OpenApiSpex.Schema

  defmodule CreateApiKey do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "CreateApiKey",
        description: "Request to create a new API Key",
        type: :object,
        additionalProperties: false,
        properties: %{
          name: %Schema{type: :string, description: "API Key name", nullable: false},
          expire_at: %Schema{
            type: :string,
            format: :"date-time",
            description: "API Key expiration date",
            nullable: true
          }
        },
        required: [:name]
      },
      struct?: false
    )
  end

  defmodule NewlyCreatedApiKey do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "NewlyCreatedApiKey",
        description: "A User's newly created API Key",
        type: :object,
        additionalProperties: false,
        properties: %{
          name: %Schema{type: :string, description: "API Key name", nullable: false},
          expire_at: %Schema{
            type: :string,
            format: :"date-time",
            description: "API Key expiration date",
            nullable: true
          },
          created_at: %Schema{
            type: :string,
            format: :"date-time",
            description: "Date of API Key creation",
            nullable: false
          },
          access_token: %Schema{
            type: :string,
            description: "API Key access token",
            nullable: false
          }
        },
        required: [:name, :expire_at, :created_at, :access_token]
      },
      struct?: false
    )
  end
end
