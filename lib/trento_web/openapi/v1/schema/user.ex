defmodule TrentoWeb.OpenApi.V1.Schema.User do
  @moduledoc false

  require OpenApiSpex
  alias OpenApiSpex.Schema

  alias TrentoWeb.OpenApi.V1.Schema.Ability.AbilityCollection

  defmodule UserTOTPEnrollmentPayload do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "UserTOTPEnrollmentPayload",
        description: "Trento User TOTP enrollment payload.",
        type: :object,
        additionalProperties: false,
        properties: %{
          secret: %Schema{type: :string, description: "TOTP secret.", nullable: false, example: "JBSWY3DPEHPK3PXP"},
          secret_qr_encoded: %Schema{
            type: :string,
            description: "TOTP secret qr encoded.",
            nullable: false,
            example: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAYAAAA+s9J6AAA..."
          }
        },
        required: [:secret, :secret_qr_encoded],
        example: %{
          secret: "JBSWY3DPEHPK3PXP",
          secret_qr_encoded: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAYAAAA+s9J6AAA..."
        }
      },
      struct?: false
    )
  end

  defmodule UserTOTPEnrollmentConfirmPayload do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "UserTOTPEnrollmentConfirmPayload",
        description: "Trento User TOTP enrollment completed payload.",
        type: :object,
        additionalProperties: false,
        properties: %{
          totp_enabled_at: %OpenApiSpex.Schema{
            type: :string,
            format: :"date-time",
            description: "Date of TOTP enrollment.",
            nullable: false,
            example: "2024-01-15T09:00:00Z"
          }
        },
        required: [:totp_enabled_at],
        example: %{
          totp_enabled_at: "2024-01-15T09:00:00Z"
        }
      },
      struct?: false
    )
  end

  defmodule UserTOTPEnrollmentConfirmRequest do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "UserTOTPEnrollmentConfirmRequest",
        description: "Trento User totp enrollment confirmation payload.",
        type: :object,
        additionalProperties: false,
        properties: %{
          totp_code: %Schema{
            type: :string,
            description: "TOTP generated from enrollment secret.",
            nullable: false,
            example: "123456"
          }
        },
        required: [:totp_code],
        example: %{
          totp_code: "123456"
        }
      },
      struct?: false
    )
  end

  defmodule UserProfile do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "UserProfile",
        description: "Trento User profile.",
        type: :object,
        additionalProperties: false,
        properties: %{
          id: %Schema{type: :integer, description: "User ID.", nullable: false, example: 1},
          fullname: %Schema{type: :string, description: "User full name.", nullable: false, example: "John Doe"},
          username: %Schema{type: :string, description: "User username.", nullable: false, example: "jdoe"},
          email: %Schema{
            type: :string,
            description: "User email.",
            nullable: false,
            format: :email,
            example: "john.doe@example.com"
          },
          idp_user: %Schema{
            type: :boolean,
            description: "User coming from an external IDP.",
            nullable: false,
            example: false
          },
          abilities: AbilityCollection,
          password_change_requested: %Schema{
            type: :boolean,
            description: "Password change is requested.",
            nullable: false,
            example: false
          },
          analytics_enabled: %Schema{
            type: :boolean,
            description: "Whether user analytics collection is enabled.",
            nullable: false,
            example: false
          },
          totp_enabled: %Schema{
            type: :boolean,
            description: "TOTP is enabled.",
            nullable: false,
            example: true
          },
          created_at: %OpenApiSpex.Schema{
            type: :string,
            format: :"date-time",
            description: "Date of user creation.",
            nullable: false,
            example: "2024-01-15T09:00:00Z"
          },
          updated_at: %OpenApiSpex.Schema{
            type: :string,
            format: :"date-time",
            description: "Date of user last update.",
            nullable: true,
            example: "2024-01-15T12:00:00Z"
          }
        },
        required: [:username, :id, :fullname, :email, :created_at, :totp_enabled],
        example: %{
          id: 1,
          fullname: "John Doe",
          username: "jdoe",
          email: "john.doe@example.com",
          idp_user: false,
          abilities: [],
          password_change_requested: false,
          analytics_enabled: false,
          totp_enabled: true,
          created_at: "2024-01-15T09:00:00Z",
          updated_at: "2024-01-15T12:00:00Z"
        }
      },
      struct?: false
    )
  end

  defmodule UserProfileUpdateRequest do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "UserProfileUpdateRequest",
        description: "Request body to update a user profile.",
        additionalProperties: false,
        type: :object,
        properties: %{
          fullname: %Schema{type: :string, description: "User full name.", nullable: false, example: "John Updated Doe"},
          email: %Schema{
            type: :string,
            description: "User email.",
            nullable: false,
            format: :email,
            example: "updated.email@example.com"
          },
          password: %Schema{type: :string, description: "User new password.", nullable: false, example: "new_secure_password123"},
          current_password: %Schema{
            type: :string,
            description: "User current password, used to set a new password.",
            nullable: false,
            example: "current_password123"
          },
          password_confirmation: %Schema{
            type: :string,
            description: "User new password, should be the same as password field.",
            nullable: false,
            example: "new_secure_password123"
          },
          analytics_enabled: %Schema{
            type: :boolean,
            description: "Whether user analytics collection is enabled.",
            nullable: false,
            example: false
          }
        },
        example: %{
          fullname: "John Updated Doe",
          email: "updated.email@example.com",
          password: "new_secure_password123",
          current_password: "current_password123",
          password_confirmation: "new_secure_password123",
          analytics_enabled: true
        }
      },
      struct?: false
    )
  end

  defmodule UserCreationRequest do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "UserCreationRequest",
        description: "Request body to create a user.",
        type: :object,
        additionalProperties: false,
        example: %{
          fullname: "John Doe",
          email: "john.doe@example.com",
          username: "john.doe",
          enabled: true,
          password: "secure_password",
          password_confirmation: "secure_password",
          abilities: []
        },
        properties: %{
          fullname: %Schema{type: :string, description: "User full name.", nullable: false, example: "New User"},
          email: %Schema{
            type: :string,
            description: "User email.",
            nullable: false,
            format: :email,
            example: "new.user@example.com"
          },
          username: %Schema{type: :string, description: "User username.", nullable: false, example: "john.doe"},
          enabled: %Schema{
            type: :boolean,
            description: "User enabled in the system.",
            nullable: false,
            example: true
          },
          password: %Schema{type: :string, description: "User new password.", nullable: false, example: "secure_password"},
          password_confirmation: %Schema{
            type: :string,
            description: "User new password, should be the same as password field.",
            nullable: false,
            example: "secure_password"
          },
          abilities: AbilityCollection
        },
        required: [:fullname, :email, :enabled, :password, :password_confirmation, :username]
      },
      struct?: false
    )
  end

  defmodule UserUpdateRequest do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "UserUpdateRequest",
        description: "Request body to update a user.",
        type: :object,
        additionalProperties: false,
        properties: %{
          fullname: %Schema{type: :string, description: "User full name.", nullable: false, example: "Admin User"},
          email: %Schema{
            type: :string,
            description: "User email.",
            nullable: false,
            format: :email,
            example: "admin.user@example.com"
          },
          enabled: %Schema{
            type: :boolean,
            description: "User enabled in the system.",
            nullable: false,
            example: true
          },
          password: %Schema{type: :string, description: "User new password.", nullable: false, example: "new_secure_password123"},
          password_confirmation: %Schema{
            type: :string,
            description: "User new password, should be the same as password field.",
            nullable: false,
            example: "new_secure_password123"
          },
          abilities: AbilityCollection,
          totp_disabled: %Schema{
            type: :boolean,
            description:
              "TOTP feature disabled for the user. The only accepted value here is 'true'.",
            nullable: false,
            example: true
          }
        },
        example: %{
          fullname: "Admin User",
          email: "admin.user@example.com",
          enabled: true,
          password: "new_secure_password123",
          password_confirmation: "new_secure_password123",
          abilities: []
        }
      },
      struct?: false
    )

    # see: https://github.com/open-api-spex/open_api_spex/issues/87
    # This is an alternative way of defining schemas without having to deal to default values
    # when the struct is converted to plain parameters in controller
    # by default all the struct values have nil values, so we can't distinguish between a parameter not passed
    # or a parameter passed explicitly nil.
    # this is an update request and we have to distinguish in PATCH verb values passed or not passed.
    # Having a value not passed as nil by default is not practical nor correct.
    # this means that in the controller the body params are passed as map, without converting from the struct
    # and we have everything cast and validated BUT without the hassle of cannot distinguish between passed
    # object keys or not and further conversions in the controller.
  end

  defmodule UserItem do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "UserItem",
        description: "User entity in the system.",
        type: :object,
        additionalProperties: false,
        properties: %{
          id: %Schema{type: :integer, description: "User ID.", nullable: false},
          fullname: %Schema{type: :string, description: "User full name.", nullable: false, example: "User Item"},
          username: %Schema{type: :string, description: "User username.", nullable: false},
          email: %Schema{
            type: :string,
            description: "User email.",
            nullable: false,
            format: :email,
            example: "user.item@example.com"
          },
          enabled: %Schema{
            type: :boolean,
            description: "User enabled in the system.",
            nullable: false,
            example: true
          },
          idp_user: %Schema{
            type: :boolean,
            description: "User coming from an external IDP.",
            nullable: false
          },
          abilities: AbilityCollection,
          password_change_requested_at: %OpenApiSpex.Schema{
            type: :string,
            format: :"date-time",
            description: "Date of password change request.",
            nullable: true
          },
          created_at: %OpenApiSpex.Schema{
            type: :string,
            format: :"date-time",
            description: "Date of user creation.",
            nullable: false,
            example: "2024-01-15T09:00:00Z"
          },
          updated_at: %OpenApiSpex.Schema{
            type: :string,
            format: :"date-time",
            description: "Date of user last update.",
            nullable: true
          },
          analytics_enabled: %Schema{
            type: :boolean,
            description: "Whether user analytics collection is enabled.",
            nullable: false,
            example: false
          },
          totp_enabled_at: %OpenApiSpex.Schema{
            type: :string,
            format: :"date-time",
            description: "Date of TOTP enrollment.",
            nullable: true,
            example: "2024-01-15T09:00:00Z"
          }
        },
        required: [:username, :id, :fullname, :email, :created_at],
        example: %{
          id: 1,
          fullname: "User Item",
          username: "user.item",
          email: "user.item@example.com",
          enabled: true,
          idp_user: false,
          abilities: [],
          created_at: "2024-01-15T09:00:00Z",
          updated_at: "2024-01-15T10:30:00Z",
          analytics_enabled: false,
          totp_enabled_at: "2024-01-15T09:00:00Z"
        }
      },
      struct?: false
    )
  end

  defmodule UserCollection do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "UserCollection",
        description: "A collection of users in the system.",
        type: :array,
        items: UserItem,
        example: [
          %{
            id: 1,
            fullname: "John Doe",
            email: "john.doe@example.com",
            username: "john.doe",
            enabled: true,
            totp_enabled_at: "2024-01-15T10:00:00Z",
            password_change_requested_at: "2024-01-14T08:00:00Z",
            created_at: "2024-01-15T09:00:00Z",
            updated_at: "2024-01-15T10:30:00Z",
            abilities: []
          }
        ]
      },
      struct?: false
    )
  end
end
