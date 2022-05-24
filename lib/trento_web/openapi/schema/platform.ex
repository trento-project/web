defmodule TrentoWeb.OpenApi.Schema.Platform do
  @moduledoc false

  require OpenApiSpex
  alias OpenApiSpex.Schema

  defmodule Settings do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "PlatformSettings",
      description: "Settings values for the current installation",
      type: :object,
      properties: %{
        eula_accepted: %Schema{
          type: :boolean,
          description: "Whether the user has accepted EULA (on a Premium installation)"
        },
        premium_subscription: %Schema{
          type: :boolean,
          description: "Whether current installation is a Premium one"
        }
      }
    })
  end
end
