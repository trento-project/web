defmodule TrentoWeb.OpenApi.V1.Schema.ActivityLog do
  @moduledoc false

  require OpenApiSpex
  alias OpenApiSpex.Schema

  defmodule ActivityLogEntries do
    @moduledoc false
    OpenApiSpex.schema(%{
      type: :array,
      items: %Schema{
        title: "ActivityLogEntries",
        type: :object,
        additionalProperties: false,
        properties: %{
          id: %Schema{
            type: :string,
            format: :uuid,
            description: "UUID (v4) of Activity Log entry."
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

  defmodule ActivityLog do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "ActivityLog",
        description: "Activity Log for the current installation.",
        type: :object,
        properties: %{
          data: ActivityLogEntries,
          pagination: %Schema{
            type: :object
          }
        },
        required: [:data, :pagination]
      },
      struct?: false
    )
  end
end
