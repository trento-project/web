defmodule TrentoWeb.OpenApi.V1.Schema.SaptuneStatus do
  @moduledoc false

  require OpenApiSpex

  alias OpenApiSpex.Schema

  defmodule Service do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "SaptuneService",
        description: "Saptune service.",
        type: :object,
        additionalProperties: false,
        properties: %{
          name: %Schema{
            type: :string,
            description: "Saptune service name."
          },
          enabled: %Schema{
            type: :string,
            description: "Enabled state as string."
          },
          active: %Schema{
            type: :string,
            description: "Active state as string."
          }
        },
        example: %{
          name: "saptune",
          enabled: "enabled",
          active: "active"
        }
      },
      struct?: false
    )
  end

  defmodule Note do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "SaptuneNote",
        description: "Saptune note.",
        type: :object,
        additionalProperties: false,
        properties: %{
          id: %Schema{
            type: :string,
            description: "Saptune note ID."
          },
          additionally_enabled: %Schema{
            type: :boolean,
            description: "Note is additionally enabled."
          }
        },
        example: %{
          id: "1410736",
          additionally_enabled: false
        }
      },
      struct?: false
    )
  end

  defmodule Solution do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "SaptuneSolution",
        description: "Saptune solution.",
        type: :object,
        additionalProperties: false,
        properties: %{
          id: %Schema{
            type: :string,
            description: "Saptune solution ID."
          },
          notes: %Schema{
            type: :array,
            description: "Solution note IDs.",
            items: %Schema{type: :string}
          },
          partial: %Schema{
            type: :boolean,
            description: "Solution is partially applied."
          }
        },
        example: %{
          id: "HANA",
          notes: ["1410736", "1657417"],
          partial: false
        }
      },
      struct?: false
    )
  end

  defmodule Staging do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "SaptuneStaging",
        description: "Saptune staging data.",
        type: :object,
        additionalProperties: false,
        properties: %{
          enabled: %Schema{
            type: :boolean,
            description: "Saptune staging is enabled."
          },
          notes: %Schema{
            type: :array,
            description: "Staged saptune note IDs.",
            items: %Schema{type: :string}
          },
          solutions_ids: %Schema{
            type: :array,
            description: "Staged saptune solution IDs.",
            items: %Schema{type: :string}
          }
        },
        example: %{
          enabled: true,
          notes: ["1410736"],
          solutions_ids: ["HANA"]
        }
      },
      struct?: false
    )
  end

  OpenApiSpex.schema(
    %{
      title: "SaptuneStatus",
      description: "Saptune status output on the host.",
      type: :object,
      nullable: true,
      additionalProperties: false,
      properties: %{
        package_version: %Schema{type: :string, description: "Saptune package version"},
        configured_version: %Schema{type: :string, description: "Saptune configure version"},
        tuning_state: %Schema{type: :string, description: "Saptune tuning state"},
        services: %Schema{
          description: "A list of saptune services.",
          type: :array,
          items: Service
        },
        enabled_notes: %Schema{
          description: "A list of enabled notes.",
          type: :array,
          items: Note
        },
        applied_notes: %Schema{
          description: "A list of applied notes.",
          type: :array,
          items: Note
        },
        enabled_solution: Solution,
        applied_solution: Solution,
        staging: Staging
      },
      required: [:package_version],
      example: %{
        package_version: "3.1.0",
        configured_version: "3",
        tuning_state: "applied",
        services: [
          %{
            name: "saptune",
            enabled: "enabled",
            active: "active"
          }
        ],
        enabled_notes: [
          %{
            id: "1410736",
            additionally_enabled: false
          }
        ],
        applied_notes: [
          %{
            id: "1410736",
            additionally_enabled: false
          }
        ],
        enabled_solution: %{
          id: "HANA",
          partial: false
        },
        applied_solution: %{
          id: "HANA",
          partial: false
        },
        staging: %{
          enabled: true,
          notes: ["1410736"],
          solutions_ids: ["HANA"]
        }
      }
    },
    struct?: false
  )
end
