defmodule TrentoWeb.OpenApi.V1.Schema.ActivityLog do
  @moduledoc false

  require OpenApiSpex
  alias OpenApiSpex.Schema

  defmodule ActivityLogEntries do
    @moduledoc false
    OpenApiSpex.schema(
      %{
        title: "ActivityLogEntries",
        description:
          "A collection of activity log entries that record significant events and actions within the platform for auditing and monitoring purposes.",
        type: :array,
        items: %Schema{
          title: "ActivityLogEntries",
          type: :object,
          additionalProperties: false,
          properties: %{
            id: %Schema{
              type: :string,
              format: :uuid,
              description:
                "A universally unique identifier (UUID v4) assigned to each activity log entry for precise tracking and reference."
            },
            type: %Schema{
              type: :string,
              description:
                "Specifies the category or nature of the activity log entry, helping to classify the recorded event."
            },
            actor: %Schema{
              type: :string,
              description:
                "Identifies the actor responsible for triggering the activity log entry, such as a system process or a specific user."
            },
            severity: %Schema{
              type: :string,
              enum: [:debug, :info, :warning, :error, :critical],
              description:
                "Indicates the severity level of the activity log entry, such as informational, warning, error, or critical."
            },
            metadata: %Schema{
              type: :object
            },
            occurred_on: %Schema{
              type: :string,
              description:
                "Records the exact time when the activity log entry was created, providing chronological context for events."
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
        description:
          "Metadata describing the pagination state of the current list, including cursors and navigation flags for result sets.",
        additionalProperties: false,
        type: :object,
        properties: %{
          start_cursor: %Schema{
            type: :string,
            description:
              "A cursor value that marks the beginning of the paginated list, used for efficient navigation and data retrieval.",
            nullable: true
          },
          end_cursor: %Schema{
            type: :string,
            description:
              "A cursor value that marks the end of the paginated list, facilitating navigation and result management.",
            nullable: true
          },
          has_next_page: %Schema{
            type: :boolean,
            description:
              "Indicates whether additional pages of results exist beyond the current set, enabling forward navigation.",
            nullable: false
          },
          has_previous_page: %Schema{
            type: :boolean,
            description:
              "Indicates whether previous pages of results exist before the current set, enabling backward navigation.",
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
        description:
          "Represents the activity log for the current installation, providing a comprehensive record of platform events and actions.",
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
