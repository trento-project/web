defmodule TrentoWeb.OpenApi.V1.Schema.SUMACredentials do
  @moduledoc false

  require OpenApiSpex
  alias OpenApiSpex.Schema

  defmodule SaveSUMACredentialsRequest do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "SaveSUMACredentialsRequest",
        description: "Request body for saving SUMA credentials",
        type: :object,
        additionalProperties: false,
        properties: %{
          url: %Schema{
            type: :string
          },
          username: %Schema{
            type: :string
          },
          password: %Schema{
            type: :string
          },
          ca_cert: %Schema{
            type: :string
          }
        },
        required: [:url, :username, :password]
      },
      struct?: false
    )
  end

  defmodule UpdateSUMACredentialsRequest do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "UpdateSUMACredentialsRequest",
        description:
          "Request body for updating SUMA credentials.\nOnly provide fields to be updated",
        type: :object,
        minProperties: 1,
        additionalProperties: false,
        properties: %{
          url: %Schema{
            type: :string
          },
          username: %Schema{
            type: :string
          },
          password: %Schema{
            type: :string
          },
          ca_cert: %Schema{
            type: :string,
            nullable: true
          }
        }
      },
      struct?: false
    )
  end

  defmodule Settings do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "SUMACredentials",
        description: "User settings for SUSE Manager",
        type: :object,
        additionalProperties: false,
        properties: %{
          url: %Schema{
            type: :string,
            description: "URL of SUSE Manager"
          },
          username: %Schema{
            type: :string,
            description: "Username"
          },
          ca_uploaded_at: %Schema{
            type: :string,
            format: :datetime,
            nullable: true,
            description: "Time that SSL certificate was uploaded."
          }
        }
      },
      struct?: false
    )
  end
end
