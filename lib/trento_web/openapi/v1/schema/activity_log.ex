defmodule TrentoWeb.OpenApi.V1.Schema.ActivityLog do
  @moduledoc false

  require OpenApiSpex
  alias OpenApiSpex.Schema

  defmodule ActivityLogEntries do
    @moduledoc false
    OpenApiSpex.schema(
      %{
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
            severity: %Schema{
              type: :string,
              enum: [:debug, :info, :warning, :error, :critical],
              description: "Severity level of an Activity Log entry. E.g. info, warning etc."
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
      },
      struct?: false
    )
  end

  defmodule Pagination do
    @moduledoc false
    OpenApiSpex.schema(
      %{
        title: "Pagination",
        description: "Pagination metadata for the current list.",
        additionalProperties: false,
        type: :object,
        properties: %{
          start_cursor: %Schema{
            type: :string,
            description: "Cursor pointing to the start of the list.",
            nullable: true
          },
          end_cursor: %Schema{
            type: :string,
            description: "Cursor pointing to the end of the list.",
            nullable: true
          },
          has_next_page: %Schema{
            type: :boolean,
            description: "Flag indicating if there are more pages after the current one.",
            nullable: false
          },
          has_previous_page: %Schema{
            type: :boolean,
            description: "Flag indicating if there are more pages before the current one.",
            nullable: false
          },
          first: %Schema{
            type: :integer,
            description:
              "Number of elements requested from the beginning of the list (forward navigation).",
            nullable: true
          },
          last: %Schema{
            type: :integer,
            description:
              "Number of elements requested from the end of the list (backward navigation).",
            nullable: true
          }
        },
        required: [
          :start_cursor,
          :end_cursor,
          :has_next_page,
          :has_previous_page,
          :first,
          :last
        ]
      },
      struct?: false
    )
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
          pagination: Pagination
        },
        required: [:data, :pagination]
      },
      struct?: false
    )
  end
end
