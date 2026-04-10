defmodule TrentoWeb.OpenApi.V1.Schema.AI do
  @moduledoc false

  require OpenApiSpex
  alias OpenApiSpex.Schema

  defmodule UserConfiguration do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "AIUserConfigurationV1",
        description: "AI configuration for a user.",
        type: :object,
        nullable: true,
        additionalProperties: false,
        properties: %{
          provider: %Schema{
            type: :string,
            description: "Chosen AI provider.",
            example: "googleai",
            nullable: false
          },
          model: %Schema{
            type: :string,
            description: "Chosen AI model.",
            example: "gemini-2.0-flash",
            nullable: false
          }
        },
        example: %{
          provider: "googleai",
          model: "gemini-2.0-flash"
        },
        required: [:provider, :model]
      },
      struct?: false
    )
  end

  defmodule CreateUserConfigurationRequest do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "CreateUserConfigurationRequestV1",
        description: "AI configuration request for a user.",
        type: :object,
        additionalProperties: false,
        properties: %{
          provider: %Schema{
            type: :string,
            description: "AI provider.",
            nullable: false,
            example: "googleai"
          },
          model: %Schema{
            type: :string,
            description: "AI model.",
            nullable: false,
            example: "gemini-2.0-flash"
          },
          api_key: %Schema{
            type: :string,
            description: "AI API key.",
            nullable: false,
            example: "AIza..."
          }
        },
        example: %{
          provider: "googleai",
          model: "gemini-2.0-flash",
          api_key: "AIza..."
        },
        required: [:provider, :model, :api_key]
      },
      struct?: false
    )
  end

  defmodule UpdateUserConfigurationRequest do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "UpdateUserConfigurationRequestV1",
        description: "AI configuration request for a user.",
        type: :object,
        additionalProperties: false,
        minProperties: 1,
        properties: %{
          provider: %Schema{
            type: :string,
            description: "AI provider.",
            nullable: false,
            example: "googleai"
          },
          model: %Schema{
            type: :string,
            description: "AI model.",
            nullable: false,
            example: "gemini-2.0-flash"
          },
          api_key: %Schema{
            type: :string,
            description: "AI API key.",
            nullable: false,
            example: "AIza..."
          }
        },
        example: %{
          api_key: "AIza...",
          model: "gemini-2.0-flash"
        }
      },
      struct?: false
    )
  end
end
