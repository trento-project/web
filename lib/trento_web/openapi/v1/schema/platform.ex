defmodule TrentoWeb.OpenApi.V1.Schema.Platform do
  @moduledoc false

  require OpenApiSpex
  alias OpenApiSpex.Schema

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
            enum: ["Community", "Premium"],
            deprecated: true
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

  defmodule AlertingSettings do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "AlertingSettings",
        description: "Settings for the alerting sub-system",
        type: :object,
        properties: %{
          enabled: %Schema{type: :boolean},
          sender_email: %Schema{type: :string},
          recipient_email: %Schema{type: :string},
          smtp_server: %Schema{type: :string},
          smtp_port: %Schema{
            type: :integer,
            example: 587
          },
          smtp_username: %Schema{type: :string},
          enforced_from_env: %Schema{type: :boolean}
        },
        required: [
          :enabled,
          :sender_email,
          :recipient_email,
          :smtp_server,
          :smtp_port,
          :smtp_username,
          :enforced_from_env
        ]
      },
      struct?: false
    )
  end

  defmodule CreateAlertingSettings do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "CreateAlertingSettings",
        description: "Request body for creating Alerting Settings",
        type: :object,
        properties: %{
          enabled: %Schema{type: :boolean},
          sender_email: %Schema{type: :string, format: :email},
          recipient_email: %Schema{type: :string, format: :email},
          smtp_server: %Schema{type: :string},
          smtp_port: %Schema{type: :integer, example: 587},
          smtp_username: %Schema{type: :string},
          smtp_password: %Schema{type: :string, format: :password}
        },
        required: [
          :enabled,
          :sender_email,
          :recipient_email,
          :smtp_server,
          :smtp_port,
          :smtp_username,
          :smtp_password
        ]
      },
      struct?: false
    )
  end

  defmodule UpdateAlertingSettings do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "UpdateAlertingSettings",
        description: "Request body for updating Alerting Settings.",
        type: :object,
        properties: %{
          enabled: %Schema{type: :boolean},
          sender_email: %Schema{type: :string, format: :email},
          recipient_email: %Schema{type: :string, format: :email},
          smtp_server: %Schema{type: :string},
          smtp_port: %Schema{type: :integer, example: 587},
          smtp_username: %Schema{type: :string},
          smtp_password: %Schema{type: :string, format: :password}
        }
      },
      struct?: false
    )
  end
end
