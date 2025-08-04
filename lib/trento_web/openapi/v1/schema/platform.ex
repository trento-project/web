defmodule TrentoWeb.OpenApi.V1.Schema.Platform do
  @moduledoc false

  require OpenApiSpex
  alias OpenApiSpex.Schema

  defmodule ApiKeySettings do
    @moduledoc false
    OpenApiSpex.schema(
      %{
        title: "ApiKeySettings",
        description: "Settings for Api Key generation.",
        type: :object,
        additionalProperties: false,
        example: %{
          created_at: "2024-01-15T09:00:00Z",
          generated_api_key: "api_key_abcd1234efgh5678ijkl9012mnop3456",
          expire_at: "2024-12-31T23:59:59Z"
        },
        properties: %{
          created_at: %Schema{
            type: :string,
            format: :"date-time",
            description: "The creation date of api key."
          },
          generated_api_key: %Schema{
            type: :string,
            description: "The generated api key from api key settings."
          },
          expire_at: %Schema{
            type: :string,
            format: :"date-time",
            description: "The expire date of api key.",
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
        description: "Request body for api key settings update.",
        type: :object,
        additionalProperties: false,
        example: %{
          expire_at: "2024-12-31T23:59:59Z"
        },
        properties: %{
          expire_at: %Schema{
            type: :string,
            format: :"date-time",
            description: "The expire date of api key.",
            nullable: true,
            example: "2024-12-31T23:59:59Z"
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
        description: "General information about the current installation.",
        type: :object,
        additionalProperties: false,
        example: %{
          flavor: "Community",
          version: "2.4.0",
          sles_subscriptions: 5
        },
        properties: %{
          flavor: %Schema{
            type: :string,
            description: "Flavor of the current installation.",
            enum: ["Community", "Premium"],
            deprecated: true
          },
          version: %Schema{
            type: :string,
            description: "Version of the current server component installation."
          },
          sles_subscriptions: %Schema{
            type: :integer,
            description:
              "The number of SLES Subscription discovered on the target infrastructure."
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
        description: "Retention Time settings of the Activity Log.",
        type: :object,
        additionalProperties: false,
        example: %{
          value: 30,
          unit: "day"
        },
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
        description: "Activity Log settings of the current installation.",
        type: :object,
        additionalProperties: false,
        properties: %{
          retention_time: RetentionTimeSettings
        },
        required: [:retention_time],
        example: %{
          retention_time: %{
            value: 30,
            unit: "day"
          }
        }
      },
      struct?: false
    )
  end

  defmodule SaveSuseManagerSettingsRequest do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "SaveSuseManagerSettingsRequest",
        description: "Request body for saving SUMA settings.",
        type: :object,
        additionalProperties: false,
        properties: %{
          url: %Schema{
            type: :string,
            example: "https://suse-manager.example.com"
          },
          username: %Schema{
            type: :string,
            example: "admin"
          },
          password: %Schema{
            type: :string,
            example: "secretpassword"
          },
          ca_cert: %Schema{
            type: :string,
            example:
              "-----BEGIN CERTIFICATE-----\nMIIDXTCCAkWgAwIBAgIJAKoK/heBjcOuMA0GCSqGSIb3DQEBBQUAMEUxCzAJBgNV\n...\n-----END CERTIFICATE-----"
          }
        },
        required: [:url, :username, :password],
        example: %{
          url: "https://suse-manager.example.com",
          username: "admin",
          password: "secretpassword",
          ca_cert:
            "-----BEGIN CERTIFICATE-----\nMIIDXTCCAkWgAwIBAgIJAKoK/heBjcOuMA0GCSqGSIb3DQEBBQUAMEUxCzAJBgNV\n...\n-----END CERTIFICATE-----"
        }
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
          "Request body for updating SUMA settings.\nOnly provide fields to be updated.",
        type: :object,
        minProperties: 1,
        additionalProperties: false,
        properties: %{
          url: %Schema{
            type: :string,
            example: "https://suse-manager.example.com"
          },
          username: %Schema{
            type: :string,
            example: "admin"
          },
          password: %Schema{
            type: :string,
            example: "secretpassword"
          },
          ca_cert: %Schema{
            type: :string,
            nullable: true,
            example:
              "-----BEGIN CERTIFICATE-----\nMIIDXTCCAkWgAwIBAgIJAKoK/heBjcOuMA0GCSqGSIb3DQEBBQUAMEUxCzAJBgNV\n...\n-----END CERTIFICATE-----"
          }
        },
        example: %{
          url: "https://suse-manager.example.com",
          username: "admin"
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
        description: "Settings for SUSE Manager.",
        type: :object,
        additionalProperties: false,
        properties: %{
          url: %Schema{
            type: :string,
            description: "URL of SUSE Manager.",
            example: "https://suse-manager.example.com"
          },
          username: %Schema{
            type: :string,
            description: "Username.",
            example: "admin"
          },
          ca_uploaded_at: %Schema{
            type: :string,
            format: :datetime,
            nullable: true,
            description: "Time that SSL certificate was uploaded.",
            example: "2024-01-15T10:30:00Z"
          }
        },
        example: %{
          url: "https://suse-manager.example.com",
          username: "admin",
          ca_uploaded_at: "2024-01-15T10:30:00Z"
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
        description: "Uploaded public keys.",
        type: :array,
        items: %Schema{
          description: "Public key information.",
          type: :object,
          properties: %{
            name: %Schema{type: :string, description: "Name.", example: "my-key"},
            content: %Schema{
              type: :string,
              description: "Public key content.",
              example: "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC7..."
            }
          },
          example: %{
            name: "my-key",
            content: "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC7..."
          }
        },
        example: [
          %{
            name: "my-key",
            content: "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC7..."
          }
        ]
      },
      struct?: false
    )
  end

  defmodule AlertingSettings do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "AlertingSettings",
        description: "Settings for the alerting sub-system.",
        type: :object,
        properties: %{
          enabled: %Schema{type: :boolean, example: true},
          sender_email: %Schema{type: :string, example: "noreply@example.com"},
          recipient_email: %Schema{type: :string, example: "admin@example.com"},
          smtp_server: %Schema{type: :string, example: "smtp.example.com"},
          smtp_port: %Schema{
            type: :integer,
            example: 587
          },
          smtp_username: %Schema{type: :string, example: "smtp_user"},
          enforced_from_env: %Schema{type: :boolean, example: false}
        },
        required: [
          :enabled,
          :sender_email,
          :recipient_email,
          :smtp_server,
          :smtp_port,
          :smtp_username,
          :enforced_from_env
        ],
        example: %{
          enabled: true,
          sender_email: "noreply@example.com",
          recipient_email: "admin@example.com",
          smtp_server: "smtp.example.com",
          smtp_port: 587,
          smtp_username: "smtp_user",
          enforced_from_env: false
        }
      },
      struct?: false
    )
  end

  defmodule CreateAlertingSettings do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "CreateAlertingSettings",
        description: "Request body for creating Alerting Settings.",
        type: :object,
        properties: %{
          enabled: %Schema{type: :boolean, example: true},
          sender_email: %Schema{type: :string, format: :email, example: "noreply@example.com"},
          recipient_email: %Schema{type: :string, format: :email, example: "admin@example.com"},
          smtp_server: %Schema{type: :string, example: "smtp.example.com"},
          smtp_port: %Schema{type: :integer, example: 587},
          smtp_username: %Schema{type: :string, example: "smtp_user"},
          smtp_password: %Schema{type: :string, format: :password, example: "smtp_password"}
        },
        required: [
          :enabled,
          :sender_email,
          :recipient_email,
          :smtp_server,
          :smtp_port,
          :smtp_username,
          :smtp_password
        ],
        example: %{
          enabled: true,
          sender_email: "noreply@example.com",
          recipient_email: "admin@example.com",
          smtp_server: "smtp.example.com",
          smtp_port: 587,
          smtp_username: "smtp_user",
          smtp_password: "smtp_password"
        }
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
          enabled: %Schema{type: :boolean, example: true},
          sender_email: %Schema{type: :string, format: :email, example: "noreply@example.com"},
          recipient_email: %Schema{type: :string, format: :email, example: "admin@example.com"},
          smtp_server: %Schema{type: :string, example: "smtp.example.com"},
          smtp_port: %Schema{type: :integer, example: 587},
          smtp_username: %Schema{type: :string, example: "smtp_user"},
          smtp_password: %Schema{type: :string, format: :password, example: "smtp_password"}
        },
        example: %{
          enabled: true,
          sender_email: "noreply@example.com",
          recipient_email: "admin@example.com"
        }
      },
      struct?: false
    )
  end
end
