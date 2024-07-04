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
        occured_on: %Schema{
          type: :string,
          description: "Timestamp upon Activity Log entry insertion."
        }
      },
      required: [:type, :actor, :metadata, :occured_on]
    }
  })
end
