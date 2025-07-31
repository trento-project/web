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
        description: "A discovered HANA Database Instance on the target infrastructure.",
        type: :object,
        additionalProperties: false,
        properties: %{
          sap_system_id: %Schema{
            type: :string,
            description: "SAP System ID.",
            format: :uuid,
            deprecated: true
          },
          database_id: %Schema{type: :string, description: "Database ID.", format: :uuid},
          sid: %Schema{type: :string, description: "SID"},
          tenant: %Schema{type: :string, description: "Tenant"},
          instance_number: %Schema{type: :string, description: "Instance Number"},
          instance_hostname: %Schema{
            type: :string,
            description: "Instance Hostname.",
            nullable: true
          },
          features: %Schema{type: :string, description: "Instance Features"},
          http_port: %Schema{type: :integer, description: "Instance HTTP Port.", nullable: true},
          https_port: %Schema{type: :integer, description: "Instance HTTPS Port.", nullable: true},
          start_priority: %Schema{
            type: :string,
            description: "Instance Start Priority.",
            nullable: true
          },
          host_id: %Schema{
            type: :string,
            description: "Identifier of the host where current instance is running.",
            format: :uuid
          },
          system_replication: %Schema{type: :string, description: "System Replication"},
          system_replication_status: %Schema{
            type: :string,
            description: "System Replication Status."
          },
          system_replication_site: %Schema{
            type: :string,
            nullable: true,
            description: "System Replication Site."
          },
          system_replication_mode: %Schema{
            type: :string,
            nullable: true,
            description: "System Replication Mode."
          },
          system_replication_operation_mode: %Schema{
            type: :string,
            nullable: true,
            description: "System Replication Operation mode."
          },
          system_replication_source_site: %Schema{
            type: :string,
            nullable: true,
            description: "System Replication Source site where replication is coming from."
          },
          system_replication_tier: %Schema{
            type: :integer,
            nullable: true,
            description: "System Replication Site tier number."
          },
          health: ResourceHealth,
          absent_at: %Schema{
            type: :string,
            description: "Absent instance timestamp.",
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
          "A list of DatabaseInstances, part of a complete SAP System, or only a HANA Database.",
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
        description: "A discovered HANA Database on the target infrastructure.",
        type: :object,
        additionalProperties: false,
        properties: %{
          id: %Schema{type: :string, description: "Database ID.", format: :uuid, example: "9c86eb74-dd68-4c91-b4d1-4f9d91f2c2c8"},
          sid: %Schema{type: :string, description: "SID.", example: "HA1"},
          health: ResourceHealth,
          database_instances: DatabaseInstances,
          tags: Tags,
          inserted_at: %Schema{type: :string, format: :datetime, example: "2024-01-15T10:30:00Z"},
          updated_at: %Schema{type: :string, format: :datetime, nullable: true, example: "2024-01-15T12:30:00Z"}
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
        description: "A list of the discovered HANA Databases.",
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
