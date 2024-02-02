defmodule TrentoWeb.OpenApi.V1.Schema.SoftwareUpdates do
  @moduledoc false

  require OpenApiSpex
  alias OpenApiSpex.Schema

  defmodule Settings do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "Settings",
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
