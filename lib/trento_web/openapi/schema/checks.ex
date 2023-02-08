defmodule TrentoWeb.OpenApi.Schema.Checks do
  @moduledoc false

  require OpenApiSpex
  alias OpenApiSpex.Schema

  defmodule ChecksSelectionRequest do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "ChecksSelectionRequest",
      description:
        "A list of desired checks that should be executed on the target infrastructure",
      type: :object,
      properties: %{
        checks: %Schema{
          type: :array,
          items: %Schema{type: :string}
        }
      }
    })
  end
end
