defmodule TrentoWeb.OpenApi.V1.Schema.ActivityLog do
  @moduledoc false

  require OpenApiSpex
  alias OpenApiSpex.Schema

  defmodule ActivityLogEntries do
    @moduledoc false
    OpenApiSpex.schema(
      %{
        title: "ActivityLogEntries",
        description: "Collection of activity log entries.",
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
        },
        example: [
          %{
            id: "123e4567-e89b-12d3-a456-426614174000",
            type: "host_registered",
            actor: "system",
            severity: "info",
            metadata: %{
              host_id: "9876b7a8-2e1f-4b9a-8e7d-3a4b5c6d7e8f",
              hostname: "hana01"
            },
            occurred_on: "2024-01-15T10:30:00Z"
          }
        ]
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
        ],
        example: %{
          start_cursor: "eyJpZCI6IjEyM2U0NTY3LWU4OWItMTJkMy1hNDU2LTQyNjYxNDE3NDAwMCJ9",
          end_cursor: "eyJpZCI6IjQ1NmU3ODkwLWE5YmMtMTJkMy1hNDU2LTQyNjYxNDE3NDAwMCJ9",
          has_next_page: true,
          has_previous_page: false,
          first: 10,
          last: 5
        }
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
        example: %{
          data: [
            %{
              id: "123e4567-e89b-12d3-a456-426614174000",
              type: "host_registered",
              actor: "system",
              severity: "info",
              metadata: %{host_id: "456e7890-e89b-12d3-a456-426614174001"},
              occurred_on: "2024-01-15T10:30:00Z"
            }
          ],
          pagination: %{
            start_cursor: "cursor_start",
            end_cursor: "cursor_end",
            has_next_page: false,
            has_previous_page: false,
            first: 10,
            last: 5
          }
        },
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
