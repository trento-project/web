defmodule TrentoWeb.OpenApi.V1.Schema.Ability do
  @moduledoc false

  require OpenApiSpex
  alias OpenApiSpex.Schema

  defmodule AbilityItem do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "Ability",
        description:
          "Represents a specific capability or permission that can be assigned to a user or resource in the system.",
        type: :object,
        additionalProperties: false,
        properties: %{
          id: %Schema{
            type: :integer,
            description:
              "Unique identifier for the ability, used to reference and manage permissions.",
            nullable: false
          },
          name: %Schema{
            type: :string,
            description:
              "The name of the ability, which describes the permission or action granted.",
            nullable: false
          },
          resource: %Schema{
            type: :string,
            description:
              "Indicates the resource to which this ability is associated, enabling fine-grained access control.",
            nullable: false
          },
          label: %Schema{
            type: :string,
            description:
              "Provides additional details about the ability, clarifying its purpose and scope within the system.",
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
        description:
          "A list containing all defined abilities available for assignment or management in the platform.",
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
