defmodule TrentoWeb.OpenApi.V1.Schema.ActivityLog do
  @moduledoc false

  require OpenApiSpex
  alias OpenApiSpex.Schema

  OpenApiSpex.schema(%{
    title: "ActivityLog",
    description: "Activity Log for the current installation.",
    type: :array,
    items: %Schema{
      title: "ActivityLogEntry",
      type: :object,
      additionalProperties: false,
      properties: %{
        id: %Schema{
          type: :string,
          description: "Identifier of Activity Log entry.",
          format: :uuid
        },
        type: %Schema{
          type: :string,
          description: "Type of Activity Log entry."
        },
        actor: %Schema{
          type: :string,
          description: "Actor causing an Activity Log entry. E.g. System or a specific user."
        },
        metadata: %Schema{
          type: :object
        },
        occurred_on: %Schema{
          type: :string,
          description: "Timestamp upon Activity Log entry insertion."
        }
      },
      required: [:id, :type, :actor, :metadata, :occurred_on]
    }
  })
end
