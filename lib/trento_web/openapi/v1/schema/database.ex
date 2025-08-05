defmodule TrentoWeb.OpenApi.V1.Schema.Database do
  @moduledoc false

  require OpenApiSpex
  alias OpenApiSpex.Schema

  alias TrentoWeb.OpenApi.V1.Schema.{ResourceHealth, Tags}

  defmodule DatabaseInstance do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "DatabaseInstance",
        description:
          "Represents a discovered HANA Database Instance on the target infrastructure, including its configuration, replication, and operational status.",
        type: :object,
        additionalProperties: false,
        properties: %{
          sap_system_id: %Schema{
            type: :string,
            description:
              "Unique identifier for the SAP system associated with this database instance, used for tracking and management.",
            format: :uuid,
            deprecated: true
          },
          database_id: %Schema{
            type: :string,
            description:
              "Unique identifier for the database instance, used for tracking and management.",
            format: :uuid
          },
          sid: %Schema{
            type: :string,
            description:
              "The system identifier (SID) for the database instance, used for SAP system management."
          },
          tenant: %Schema{
            type: :string,
            description:
              "The tenant name for the database instance, supporting multi-tenancy and organization."
          },
          instance_number: %Schema{
            type: :string,
            description:
              "The instance number assigned to the database, used for identification and management."
          },
          instance_hostname: %Schema{
            type: :string,
            description:
              "The hostname of the server where the database instance is running, supporting infrastructure management.",
            nullable: true
          },
          features: %Schema{
            type: :string,
            description:
              "Features enabled for the database instance, such as HDB or HDB_WORKER, supporting capability tracking."
          },
          http_port: %Schema{
            type: :integer,
            description:
              "The HTTP port used by the database instance, supporting connectivity and management.",
            nullable: true
          },
          https_port: %Schema{
            type: :integer,
            description:
              "The HTTPS port used by the database instance, supporting secure connectivity and management.",
            nullable: true
          },
          start_priority: %Schema{
            type: :string,
            description:
              "The start priority assigned to the database instance, used for controlling startup order and resource allocation.",
            nullable: true
          },
          host_id: %Schema{
            type: :string,
            description:
              "Unique identifier of the host where the current database instance is running, supporting infrastructure management.",
            format: :uuid
          },
          system_replication: %Schema{
            type: :string,
            description:
              "Indicates whether system replication is enabled for the database instance, supporting high availability and disaster recovery."
          },
          system_replication_status: %Schema{
            type: :string,
            description:
              "Shows the current status of system replication for the database instance, supporting monitoring and management."
          },
          system_replication_site: %Schema{
            type: :string,
            nullable: true,
            description:
              "The site associated with system replication for the database instance, supporting multi-site management."
          },
          system_replication_mode: %Schema{
            type: :string,
            nullable: true,
            description:
              "The mode used for system replication in the database instance, such as SYNC or ASYNC, supporting configuration and management."
          },
          system_replication_operation_mode: %Schema{
            type: :string,
            nullable: true,
            description:
              "The operation mode for system replication in the database instance, supporting synchronization and failover."
          },
          system_replication_source_site: %Schema{
            type: :string,
            nullable: true,
            description:
              "The source site from which system replication originates for the database instance, supporting traceability and management."
          },
          system_replication_tier: %Schema{
            type: :integer,
            nullable: true,
            description:
              "The tier number of the system replication site for the database instance, supporting hierarchical management."
          },
          health: ResourceHealth,
          absent_at: %Schema{
            type: :string,
            description:
              "The timestamp indicating when the database instance became absent, supporting monitoring and troubleshooting.",
            format: :datetime,
            nullable: true
          },
          inserted_at: %Schema{type: :string, format: :datetime},
          updated_at: %Schema{type: :string, format: :datetime, nullable: true}
        },
        example: %{
          sap_system_id: "290e8a7b-2e1f-4b9a-8e7d-3a4b5c6d7e8f",
          database_id: "9876b7a8-2e1f-4b9a-8e7d-3a4b5c6d7e8f",
          sid: "PRD",
          tenant: "SYSTEMDB",
          instance_number: "00",
          instance_hostname: "hanadb01",
          features: "HDB|HDB_WORKER",
          http_port: 8000,
          https_port: 8443,
          start_priority: "0.3",
          host_id: "9876b7a8-2e1f-4b9a-8e7d-3a4b5c6d7e8f",
          system_replication: "ENABLED",
          system_replication_status: "ACTIVE",
          system_replication_site: "Site1",
          system_replication_mode: "ASYNC",
          system_replication_operation_mode: "logreplay",
          system_replication_source_site: "Site2",
          system_replication_tier: 1,
          health: "passing",
          absent_at: "2024-01-15T08:00:00Z",
          inserted_at: "2024-01-15T10:30:00Z",
          updated_at: "2024-01-15T12:45:00Z"
        }
      },
      struct?: false
    )
  end

  defmodule DatabaseInstances do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "DatabaseInstances",
        description:
          "A list containing all database instances that are part of a complete SAP System or a standalone HANA Database, supporting system management.",
        type: :array,
        items: DatabaseInstance,
        example: [
          %{
            sap_system_id: "290e8a7b-2e1f-4b9a-8e7d-3a4b5c6d7e8f",
            database_id: "9876b7a8-2e1f-4b9a-8e7d-3a4b5c6d7e8f",
            sid: "PRD",
            tenant: "SYSTEMDB",
            instance_number: "00",
            instance_hostname: "hanadb01",
            features: "HDB|HDB_WORKER",
            http_port: 8000,
            https_port: 8443,
            start_priority: "0.3",
            host_id: "9876b7a8-2e1f-4b9a-8e7d-3a4b5c6d7e8f",
            system_replication: "ENABLED",
            system_replication_status: "ACTIVE",
            health: "passing",
            inserted_at: "2024-01-15T10:30:00Z"
          }
        ]
      },
      struct?: false
    )
  end

  defmodule DatabaseItem do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "Database",
        description:
          "Represents a discovered HANA Database on the target infrastructure, including its configuration, health, and associated instances.",
        type: :object,
        additionalProperties: false,
        properties: %{
          id: %Schema{
            type: :string,
            description:
              "Unique identifier for the HANA database, used for tracking and management.",
            format: :uuid,
            example: "9c86eb74-dd68-4c91-b4d1-4f9d91f2c2c8"
          },
          sid: %Schema{
            type: :string,
            description:
              "The system identifier (SID) for the HANA database, used for SAP system management.",
            example: "HA1"
          },
          health: ResourceHealth,
          database_instances: DatabaseInstances,
          tags: Tags,
          inserted_at: %Schema{type: :string, format: :datetime, example: "2024-01-15T10:30:00Z"},
          updated_at: %Schema{
            type: :string,
            format: :datetime,
            nullable: true,
            example: "2024-01-15T12:30:00Z"
          }
        },
        example: %{
          id: "9c86eb74-dd68-4c91-b4d1-4f9d91f2c2c8",
          sid: "HA1",
          health: "passing",
          database_instances: [],
          tags: [],
          inserted_at: "2024-01-15T10:30:00Z",
          updated_at: "2024-01-15T12:30:00Z"
        }
      },
      struct?: false
    )
  end

  defmodule DatabasesCollection do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "DatabasesCollection",
        description:
          "A list containing all discovered HANA Databases on the target infrastructure, supporting monitoring and management.",
        type: :array,
        items: DatabaseItem,
        example: [
          %{
            id: "9c86eb74-dd68-4c91-b4d1-4f9d91f2c2c8",
            sid: "HA1",
            health: "passing",
            database_instances: [],
            tags: [],
            inserted_at: "2024-01-15T10:30:00Z",
            updated_at: "2024-01-15T12:30:00Z"
          }
        ]
      },
      struct?: false
    )
  end
end
