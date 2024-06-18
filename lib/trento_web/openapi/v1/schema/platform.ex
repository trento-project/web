defmodule TrentoWeb.OpenApi.V1.Schema.Platform do
  @moduledoc false

  require OpenApiSpex
  alias OpenApiSpex.Schema

  defmodule Settings do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "PlatformSettings",
      description: "Settings values for the current installation",
      type: :object,
      additionalProperties: false,
      properties: %{
        eula_accepted: %Schema{
          type: :boolean,
          description: "Whether the user has accepted EULA (on a Premium installation)",
          deprecated: true
        },
        premium_subscription: %Schema{
          type: :boolean,
          description: "Whether current installation is a Premium one"
        }
      }
    })
  end

  defmodule ApiKeySettings do
    @moduledoc false
    OpenApiSpex.schema(%{
      title: "ApiKeySettings",
      description: "Settings for Api Key generation",
      type: :object,
      additionalProperties: false,
      properties: %{
        created_at: %Schema{
          type: :string,
          format: :"date-time",
          description: "The creation date of api key"
        },
        generated_api_key: %Schema{
          type: :string,
          description: "The generated api key from api key settings"
        },
        expire_at: %Schema{
          type: :string,
          format: :"date-time",
          description: "The expire date of api key",
          nullable: true
        }
      },
      required: [:generated_api_key, :expire_at, :created_at]
    })
  end

  defmodule ApiKeySettingsUpdateRequest do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "ApiKeySettingsUpdateRequest",
      description: "Request body for api key settings update",
      type: :object,
      additionalProperties: false,
      properties: %{
        expire_at: %Schema{
          type: :string,
          format: :"date-time",
          description: "The expire date of api key",
          nullable: true
        }
      },
      required: [:expire_at]
    })
  end

  defmodule GeneralInformation do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "GeneralInformation",
      description: "General information about the current installation",
      type: :object,
      additionalProperties: false,
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

  defmodule ActivityLogSettings do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "ActivityLogSettings",
      description: "Activity Log settings of the current installation",
      type: :object,
      additionalProperties: false,
      properties: %{
        retention_period: %Schema{
          type: :integer,
          description:
            "The integer retention duration, that is used in conjunction with the retention time unit.",
          minimum: 1
        },
        retention_period_unit: %Schema{
          type: :string,
          description:
            "The retention duration unit, that is used in conjunction with the retention time period.",
          enum: [:days, :weeks, :months, :years]
        }
      },
      required: [:retention_period, :retention_period_unit]
    })
  end
end
