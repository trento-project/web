defmodule TrentoWeb.OpenApi.V1.Schema.Ability do
  @moduledoc false

  require OpenApiSpex
  alias OpenApiSpex.Schema

  defmodule AbilityItem do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "Ability",
      description: "Ability entry",
      type: :object,
      additionalProperties: false,
      properties: %{
        id: %Schema{type: :integer, description: "Ability ID", nullable: false},
        name: %Schema{type: :string, description: "Ability name", nullable: false},
        resource: %Schema{
          type: :string,
          description: "Resource attached to ability",
          nullable: false
        },
        label: %Schema{
          type: :string,
          description: "Description of the ability",
          nullable: false
        }
      },
      required: [:id, :name, :resource]
    })
  end

  defmodule AbilityCollection do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "AbilityCollection",
      description: "A collection of abilities in the system",
      type: :array,
      items: AbilityItem
    })
  end
end
