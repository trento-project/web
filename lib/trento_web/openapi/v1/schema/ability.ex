defmodule TrentoWeb.OpenApi.V1.Schema.Ability do
  @moduledoc false

  require OpenApiSpex
  alias OpenApiSpex.Schema

  defmodule AbilityItem do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "Ability",
        description: "Ability entry.",
        type: :object,
        additionalProperties: false,
        properties: %{
          id: %Schema{type: :integer, description: "Ability ID.", nullable: false},
          name: %Schema{type: :string, description: "Ability name.", nullable: false},
          resource: %Schema{
            type: :string,
            description: "Resource attached to ability.",
            nullable: false
          },
          label: %Schema{
            type: :string,
            description: "Description of the ability.",
            nullable: false
          }
        },
        required: [:id, :name, :resource],
        example: %{
          id: 1,
          name: "all",
          resource: "all",
          label: "Can do anything"
        }
      },
      struct?: false
    )
  end

  defmodule AbilityCollection do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "AbilityCollection",
        description: "A collection of abilities in the system.",
        type: :array,
        items: AbilityItem,
        example: [
          %{
            id: 1,
            name: "all",
            resource: "all",
            label: "Can do anything"
          },
          %{
            id: 2,
            name: "cleanup:request_execution",
            resource: "cluster",
            label: "Cleanup operations for a cluster"
          }
        ]
      },
      struct?: false
    )
  end
end
