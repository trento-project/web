defmodule TrentoWeb.OpenApi.V1.Schema.SUMACredentials do
  @moduledoc false

  require OpenApiSpex
  alias OpenApiSpex.Schema

  defmodule SUMACredentialsRequest do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "SUMACredentialsRequest",
      description: "Request body for saving SUMA credentials",
      type: :object,
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
    })
  end

  defmodule Settings do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "SUMACredentials",
      description: "User settings for SUSE Manager",
      type: :object,
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
    })
  end
end
