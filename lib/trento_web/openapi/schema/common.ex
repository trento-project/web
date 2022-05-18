defmodule TrentoWeb.OpenApi.Schema.Common do
  @moduledoc false

  require OpenApiSpex
  alias OpenApiSpex.Schema

  defmodule BadRequestResponse do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "BadRequestResponse",
      description: "Something wrong happened while executing requested operation",
      type: :object,
      properties: %{
        error: %Schema{type: :string, description: "The error message"}
      },
      example: %{error: "some error message"}
    })
  end
end
