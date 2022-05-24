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

  defmodule GeneralInformation do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "GeneralInformation",
      description: "General information about the current installation",
      type: :object,
      properties: %{
        flavor: %Schema{
          type: :string,
          description: "Flavor of the current installation",
          enum: ["Community", "Premium"]
        },
        version: %Schema{
          type: :string,
          description: "Version of the current server component installation"
        },
        sles_subscriptions: %Schema{
          type: :integer,
          description: "The number of SLES Subscription discovered on the target infrastructure"
        }
      }
    })
  end
end
