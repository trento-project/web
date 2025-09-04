defmodule TrentoWeb.OpenApi.V1.Schema.SaptuneStatus do
  @moduledoc false

  require OpenApiSpex

  alias OpenApiSpex.Schema

  defmodule Service do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "SaptuneService",
        description:
          "Represents a saptune service, including its name, enabled state, and active state for system tuning and monitoring.",
        type: :object,
        additionalProperties: false,
        properties: %{
          name: %Schema{
            type: :string,
            description:
              "The name of the saptune service, supporting identification and management of system tuning components."
          },
          enabled: %Schema{
            type: :string,
            description:
              "Indicates whether the saptune service is enabled, supporting system configuration and monitoring."
          },
          active: %Schema{
            type: :string,
            description:
              "Indicates whether the saptune service is currently active, supporting system health and status tracking."
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
        description:
          "Represents a saptune note, including its identifier and whether it is additionally enabled for system tuning and compliance.",
        type: :object,
        additionalProperties: false,
        properties: %{
          id: %Schema{
            type: :string,
            description:
              "Unique identifier for the saptune note, supporting tracking and management of system tuning recommendations."
          },
          additionally_enabled: %Schema{
            type: :boolean,
            description:
              "Indicates whether the saptune note is additionally enabled, supporting compliance and configuration management."
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
        description:
          "Represents a saptune solution, including its identifier, associated notes, and whether it is partially applied for system tuning and compliance.",
        type: :object,
        additionalProperties: false,
        properties: %{
          id: %Schema{
            type: :string,
            description:
              "Unique identifier for the saptune solution, supporting tracking and management of system tuning configurations."
          },
          notes: %Schema{
            type: :array,
            description:
              "A list of note identifiers associated with this saptune solution, supporting compliance and configuration management.",
            items: %Schema{type: :string}
          },
          partial: %Schema{
            type: :boolean,
            description:
              "Indicates whether the saptune solution is only partially applied, supporting system health and configuration tracking."
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
        description:
          "Represents saptune staging data, including enabled state, staged notes, and solution identifiers for system configuration and compliance.",
        type: :object,
        additionalProperties: false,
        properties: %{
          enabled: %Schema{
            type: :boolean,
            description:
              "Indicates whether saptune staging is enabled, supporting system configuration and compliance management."
          },
          notes: %Schema{
            type: :array,
            description:
              "A list of staged saptune note identifiers, supporting configuration and compliance tracking.",
            items: %Schema{type: :string}
          },
          solutions_ids: %Schema{
            type: :array,
            description:
              "A list of staged saptune solution identifiers, supporting configuration and compliance tracking.",
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
      description:
        "Represents the saptune status output on the host, including package version, configuration, tuning state, services, notes, solutions, and staging for system health and compliance.",
      type: :object,
      nullable: true,
      additionalProperties: false,
      properties: %{
        package_version: %Schema{
          type: :string,
          description:
            "The version of the saptune package installed on the host, supporting system health and compliance tracking."
        },
        configured_version: %Schema{
          type: :string,
          description:
            "The version of saptune configuration applied on the host, supporting system health and compliance tracking."
        },
        tuning_state: %Schema{
          type: :string,
          description:
            "The current tuning state of saptune on the host, supporting system health and configuration tracking."
        },
        services: %Schema{
          description:
            "A list of saptune services running on the host, supporting system health and configuration management.",
          type: :array,
          items: Service
        },
        enabled_notes: %Schema{
          description:
            "A list of saptune notes that are currently enabled on the host, supporting compliance and configuration tracking.",
          type: :array,
          items: Note
        },
        applied_notes: %Schema{
          description:
            "A list of saptune notes that have been applied on the host, supporting compliance and configuration tracking.",
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
