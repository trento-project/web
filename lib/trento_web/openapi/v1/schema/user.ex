defmodule TrentoWeb.OpenApi.V1.Schema.User do
  @moduledoc false

  require OpenApiSpex
  alias OpenApiSpex.Schema

  defmodule UserProfile do
    @moduledoc false

    @schema %Schema{
      title: "UserProfile",
      description: "Trento User profile",
      type: :object,
      additionalProperties: false,
      properties: %{
        id: %Schema{type: :integer, description: "User ID", nullable: false},
        fullname: %Schema{type: :string, description: "User full name", nullable: false},
        username: %Schema{type: :string, description: "User username", nullable: false},
        email: %Schema{type: :string, description: "User email", nullable: false, format: :email},
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
      required: [:username, :id, :fullname, :email, :created_at]
    }

    def schema, do: @schema
  end

  defmodule UserProfileUpdateRequest do
    @moduledoc false

    @schema %Schema{
      title: "UserProfileUpdateRequest",
      description: "Request body to update a user profile",
      additionalProperties: false,
      type: :object,
      properties: %{
        fullname: %Schema{type: :string, description: "User full name", nullable: false},
        email: %Schema{type: :string, description: "User email", nullable: false, format: :email},
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
    }

    def schema, do: @schema
  end

  defmodule UserCreationRequest do
    @moduledoc false

    @schema %Schema{
      title: "UserCreationRequest",
      description: "Request body to create a user",
      type: :object,
      additionalProperties: false,
      properties: %{
        fullname: %Schema{type: :string, description: "User full name", nullable: false},
        email: %Schema{type: :string, description: "User email", nullable: false, format: :email},
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
        }
      },
      required: [:fullname, :email, :enabled, :password, :password_confirmation, :username]
    }

    def schema, do: @schema
  end

  defmodule UserUpdateRequest do
    @moduledoc false

    @schema %Schema{
      title: "UserUpdateRequest",
      description: "Request body to update a user",
      type: :object,
      additionalProperties: false,
      properties: %{
        fullname: %Schema{type: :string, description: "User full name", nullable: false},
        email: %Schema{type: :string, description: "User email", nullable: false, format: :email},
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
        }
      }
    }

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
    def schema, do: @schema
  end

  defmodule UserItem do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "UserItem",
      description: "User entity in the system",
      type: :object,
      additionalProperties: false,
      properties: %{
        id: %Schema{type: :integer, description: "User ID", nullable: false},
        fullname: %Schema{type: :string, description: "User full name", nullable: false},
        username: %Schema{type: :string, description: "User username", nullable: false},
        email: %Schema{type: :string, description: "User email", nullable: false, format: :email},
        enabled: %Schema{
          type: :boolean,
          description: "User enabled in the system",
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
      required: [:username, :id, :fullname, :email, :created_at]
    })
  end

  defmodule UserCollection do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "UserCollection",
      description: "A collection of users in the system",
      type: :array,
      items: UserItem
    })
  end
end
