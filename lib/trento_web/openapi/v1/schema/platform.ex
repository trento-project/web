defmodule TrentoWeb.OpenApi.V1.Schema.Platform do
  @moduledoc false

  require OpenApiSpex
  alias OpenApiSpex.Schema

  defmodule Settings do
    @moduledoc false

    OpenApiSpex.schema(
      %{
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
      },
      struct?: false
    )
  end

  defmodule ApiKeySettings do
    @moduledoc false
    OpenApiSpex.schema(
      %{
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
      },
      struct?: false
    )
  end

  defmodule ApiKeySettingsUpdateRequest do
    @moduledoc false

    OpenApiSpex.schema(
      %{
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
      },
      struct?: false
    )
  end

  defmodule GeneralInformation do
    @moduledoc false

    OpenApiSpex.schema(
      %{
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
      },
      struct?: false
    )
  end

  defmodule RetentionTimeSettings do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "RetentionTimeSettings",
        description: "Retention Time settings of the Activity Log",
        type: :object,
        additionalProperties: false,
        properties: %{
          value: %Schema{
            type: :integer,
            description:
              "The integer retention duration, that is used in conjunction with the retention time unit.",
            minimum: 1
          },
          unit: %Schema{
            type: :string,
            description:
              "The retention duration unit, that is used in conjunction with the retention time period.",
            enum: [:day, :week, :month, :year]
          }
        },
        required: [:value, :unit]
      },
      struct?: false
    )
  end

  defmodule ActivityLogSettings do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "ActivityLogSettings",
        description: "Activity Log settings of the current installation",
        type: :object,
        additionalProperties: false,
        properties: %{
          retention_time: RetentionTimeSettings
        },
        required: [:retention_time]
      },
      struct?: false
    )
  end

  defmodule SaveSuseManagerSettingsRequest do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "SaveSuseManagerSettingsRequest",
        description: "Request body for saving SUMA settings",
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

  defmodule UpdateSuseManagerSettingsRequest do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "UpdateSuseManagerSettingsRequest",
        description:
          "Request body for updating SUMA settings.\nOnly provide fields to be updated",
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

  defmodule SuseManagerSettings do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "SuseManagerSettings",
        description: "Settings for SUSE Manager",
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

  defmodule PublicKeys do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "PublicKeys",
        description: "Uploaded public keys",
        type: :array,
        items: %Schema{
          title: "PublicKey",
          type: :object,
          properties: %{
            name: %Schema{type: :string, description: "Name"},
            content: %Schema{type: :string, description: "Public key content"}
          }
        }
      },
      struct?: false
    )
  end
end
