defmodule TrentoWeb.OpenApi.V1.Schema.SaptuneStatus do
  @moduledoc false

  require OpenApiSpex

  alias OpenApiSpex.Schema

  defmodule Service do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "Saptune service",
        description: "Saptune service",
        type: :object,
        additionalProperties: false,
        properties: %{
          name: %Schema{
            type: :string,
            description: "Saptune service name"
          },
          enabled: %Schema{
            type: :string,
            description: "Enabled state as string"
          },
          active: %Schema{
            type: :string,
            description: "Active state as string"
          }
        }
      },
      struct?: false
    )
  end

  defmodule Note do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "Saptune note",
        description: "Saptune note",
        type: :object,
        additionalProperties: false,
        properties: %{
          id: %Schema{
            type: :string,
            description: "Saptune note ID"
          },
          additionally_enabled: %Schema{
            type: :boolean,
            description: "Note is additionally enabled"
          }
        }
      },
      struct?: false
    )
  end

  defmodule Solution do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "Saptune solution",
        description: "Saptune solution",
        type: :object,
        additionalProperties: false,
        properties: %{
          id: %Schema{
            type: :boolean,
            description: "Saptune solution ID"
          },
          notes: %Schema{
            type: :array,
            description: "Solution note IDs",
            items: %Schema{type: :string}
          },
          partial: %Schema{
            type: :boolean,
            description: "Solution is partially applied"
          }
        }
      },
      struct?: false
    )
  end

  defmodule Staging do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "Saptune staging",
        description: "Saptune staging data",
        type: :object,
        additionalProperties: false,
        properties: %{
          enabled: %Schema{
            type: :boolean,
            description: "Saptune staging is enabled"
          },
          notes: %Schema{
            type: :array,
            description: "Staged saptune note IDs",
            items: %Schema{type: :string}
          },
          solutions_ids: %Schema{
            type: :array,
            description: "Staged saptune solution IDs",
            items: %Schema{type: :string}
          }
        }
      },
      struct?: false
    )
  end

  OpenApiSpex.schema(
    %{
      title: "Saptune status",
      description: "Saptune status output on the host",
      type: :object,
      nullable: true,
      additionalProperties: false,
      properties: %{
        package_version: %Schema{type: :string, description: "Saptune package version"},
        configured_version: %Schema{type: :string, description: "Saptune configure version"},
        tuning_state: %Schema{type: :string, description: "Saptune tuning state"},
        services: %Schema{
          title: "Saptune services",
          description: "A list of saptune services",
          type: :array,
          items: Service
        },
        enabled_nodes: %Schema{
          title: "Enabled notes",
          description: "A list of enabled notes",
          type: :array,
          items: Note
        },
        applied_notes: %Schema{
          title: "Applied notes",
          description: "A list of applied notes",
          type: :array,
          items: Note
        },
        enabled_solution: Solution,
        applied_solution: Solution,
        staging: Staging
      },
      required: [:package_version]
    },
    struct?: false
  )
end
