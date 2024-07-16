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
        description: "Trento User TOTP enrollment payload",
        type: :object,
        additionalProperties: false,
        properties: %{
          secret: %Schema{type: :string, description: "TOTP secret", nullable: false},
          secret_qr_encoded: %Schema{
            type: :string,
            description: "TOTP secret qr encoded",
            nullable: false
          }
        },
        required: [:secret, :secret_qr_encoded]
      },
      struct?: false
    )
  end

  defmodule UserTOTPEnrollmentConfirmPayload do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "UserTOTPEnrollmentConfirmPayload",
        description: "Trento User TOTP enrollment completed payload",
        type: :object,
        additionalProperties: false,
        properties: %{
          totp_enabled_at: %OpenApiSpex.Schema{
            type: :string,
            format: :"date-time",
            description: "Date of TOTP enrollment",
            nullable: false
          }
        },
        required: [:totp_enabled_at]
      },
      struct?: false
    )
  end

  defmodule UserTOTPEnrollmentConfirmRequest do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "UserTOTPEnrollmentConfirmRequest",
        description: "Trento User totp enrollment confirmation payload",
        type: :object,
        additionalProperties: false,
        properties: %{
          totp_code: %Schema{
            type: :string,
            description: "TOTP generated from enrollment secret",
            nullable: false
          }
        },
        required: [:totp_code]
      },
      struct?: false
    )
  end

  defmodule UserProfile do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "UserProfile",
        description: "Trento User profile",
        type: :object,
        additionalProperties: false,
        properties: %{
          id: %Schema{type: :integer, description: "User ID", nullable: false},
          fullname: %Schema{type: :string, description: "User full name", nullable: false},
          username: %Schema{type: :string, description: "User username", nullable: false},
          email: %Schema{
            type: :string,
            description: "User email",
            nullable: false,
            format: :email
          },
          abilities: AbilityCollection,
          password_change_requested: %Schema{
            type: :boolean,
            description: "Password change is requested",
            nullable: false
          },
          totp_enabled: %Schema{
            type: :boolean,
            description: "TOTP is enabled",
            nullable: false
          },
          created_at: %OpenApiSpex.Schema{
            type: :string,
            format: :"date-time",
            description: "Date of user creation",
            nullable: false
          },
          updated_at: %OpenApiSpex.Schema{
            type: :string,
            format: :"date-time",
            description: "Date of user last update",
            nullable: true
          }
        },
        required: [:username, :id, :fullname, :email, :created_at, :totp_enabled]
      },
      struct?: false
    )
  end

  defmodule UserProfileUpdateRequest do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "UserProfileUpdateRequest",
        description: "Request body to update a user profile",
        additionalProperties: false,
        type: :object,
        properties: %{
          fullname: %Schema{type: :string, description: "User full name", nullable: false},
          email: %Schema{
            type: :string,
            description: "User email",
            nullable: false,
            format: :email
          },
          password: %Schema{type: :string, description: "User new password", nullable: false},
          current_password: %Schema{
            type: :string,
            description: "User current password, used to set a new password",
            nullable: false
          },
          password_confirmation: %Schema{
            type: :string,
            description: "User new password, should be the same as password field",
            nullable: false
          }
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
        description: "Request body to create a user",
        type: :object,
        additionalProperties: false,
        properties: %{
          fullname: %Schema{type: :string, description: "User full name", nullable: false},
          email: %Schema{
            type: :string,
            description: "User email",
            nullable: false,
            format: :email
          },
          username: %Schema{type: :string, description: "User username", nullable: false},
          enabled: %Schema{
            type: :boolean,
            description: "User enabled in the system",
            nullable: false
          },
          password: %Schema{type: :string, description: "User new password", nullable: false},
          password_confirmation: %Schema{
            type: :string,
            description: "User new password, should be the same as password field",
            nullable: false
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
        description: "Request body to update a user",
        type: :object,
        additionalProperties: false,
        properties: %{
          fullname: %Schema{type: :string, description: "User full name", nullable: false},
          email: %Schema{
            type: :string,
            description: "User email",
            nullable: false,
            format: :email
          },
          enabled: %Schema{
            type: :boolean,
            description: "User enabled in the system",
            nullable: false
          },
          password: %Schema{type: :string, description: "User new password", nullable: false},
          password_confirmation: %Schema{
            type: :string,
            description: "User new password, should be the same as password field",
            nullable: false
          },
          abilities: AbilityCollection,
          totp_disabled: %Schema{
            type: :boolean,
            description:
              "TOTP feature disabled for the user. The only accepted value here is 'true'",
            nullable: false
          }
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
        description: "User entity in the system",
        type: :object,
        additionalProperties: false,
        properties: %{
          id: %Schema{type: :integer, description: "User ID", nullable: false},
          fullname: %Schema{type: :string, description: "User full name", nullable: false},
          username: %Schema{type: :string, description: "User username", nullable: false},
          email: %Schema{
            type: :string,
            description: "User email",
            nullable: false,
            format: :email
          },
          enabled: %Schema{
            type: :boolean,
            description: "User enabled in the system",
            nullable: false
          },
          abilities: AbilityCollection,
          password_change_requested_at: %OpenApiSpex.Schema{
            type: :string,
            format: :"date-time",
            description: "Date of password change request",
            nullable: true
          },
          created_at: %OpenApiSpex.Schema{
            type: :string,
            format: :"date-time",
            description: "Date of user creation",
            nullable: false
          },
          updated_at: %OpenApiSpex.Schema{
            type: :string,
            format: :"date-time",
            description: "Date of user last update",
            nullable: true
          },
          totp_enabled_at: %OpenApiSpex.Schema{
            type: :string,
            format: :"date-time",
            description: "Date of TOTP enrollment",
            nullable: true
          }
        },
        required: [:username, :id, :fullname, :email, :created_at]
      },
      struct?: false
    )
  end

  defmodule UserCollection do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "UserCollection",
        description: "A collection of users in the system",
        type: :array,
        items: UserItem
      },
      struct?: false
    )
  end
end
