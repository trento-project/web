defmodule TrentoWeb.OpenApi.V1.Schema.SAPSystem do
  @moduledoc false

  require OpenApiSpex
  alias OpenApiSpex.Schema

  require Trento.SapSystems.Enums.EnsaVersion, as: EnsaVersion

  alias TrentoWeb.OpenApi.V1.Schema.{Database, ResourceHealth, Tags}

  defmodule ApplicationInstance do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "ApplicationInstance",
        description:
          "Represents a discovered SAP application instance on the target infrastructure, including identification, features, ports, and health status for monitoring and management.",
        type: :object,
        additionalProperties: false,
        properties: %{
          sap_system_id: %Schema{
            type: :string,
            description:
              "Unique identifier for the SAP system to which this application instance belongs, supporting resource tracking and management.",
            format: :uuid,
            example: "7269eb74-dd68-4c91-b4d1-4f9d91f2c2c8"
          },
          sid: %Schema{
            type: :string,
            description:
              "The SAP system identifier (SID) for this application instance, supporting system identification.",
            example: "HA1"
          },
          instance_number: %Schema{
            type: :string,
            description:
              "The instance number assigned to this SAP application instance, supporting unique identification.",
            example: "00"
          },
          instance_hostname: %Schema{
            type: :string,
            description:
              "The hostname of the server where this SAP application instance is running, supporting network management.",
            nullable: true,
            example: "sap-app-01"
          },
          absent_at: %Schema{
            type: :string,
            description:
              "Timestamp indicating when the application instance became absent from the infrastructure, supporting audit and monitoring.",
            format: :datetime,
            nullable: true,
            example: "2024-01-16T08:00:00Z"
          },
          features: %Schema{
            type: :string,
            description:
              "A list of features enabled for this SAP application instance, supporting capability tracking.",
            example: "MESSAGESERVER|ENQUE"
          },
          http_port: %Schema{
            type: :integer,
            description:
              "The HTTP port number used by this SAP application instance, supporting connectivity and monitoring.",
            nullable: true,
            example: 8000
          },
          https_port: %Schema{
            type: :integer,
            description:
              "The HTTPS port number used by this SAP application instance, supporting secure connectivity.",
            nullable: true,
            example: 44300
          },
          start_priority: %Schema{
            type: :string,
            description:
              "The start priority assigned to this SAP application instance, supporting startup sequencing and management.",
            nullable: true,
            example: "1"
          },
          host_id: %Schema{
            type: :string,
            description:
              "Unique identifier of the host where this application instance is running, supporting resource mapping.",
            format: :uuid,
            example: "779cdd70-e9e2-58ca-b18a-bf3eb3f71244"
          },
          health: ResourceHealth,
          inserted_at: %Schema{type: :string, format: :datetime, example: "2024-01-15T10:30:00Z"},
          updated_at: %Schema{
            type: :string,
            format: :datetime,
            nullable: true,
            example: "2024-01-15T12:30:00Z"
          }
        },
        example: %{
          sap_system_id: "7269eb74-dd68-4c91-b4d1-4f9d91f2c2c8",
          sid: "HA1",
          instance_number: "00",
          instance_hostname: "sap-app-01",
          absent_at: "2024-01-16T08:00:00Z",
          features: "MESSAGESERVER|ENQUE",
          http_port: 8000,
          https_port: 44300,
          start_priority: "1",
          host_id: "779cdd70-e9e2-58ca-b18a-bf3eb3f71244",
          health: "passing",
          inserted_at: "2024-01-15T10:30:00Z",
          updated_at: "2024-01-15T12:30:00Z"
        }
      },
      struct?: false
    )
  end

  defmodule SAPSystemItem do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "SAPSystem",
        description:
          "Represents a discovered SAP system on the target infrastructure, including identification, database, health, and instance details for monitoring and management.",
        type: :object,
        additionalProperties: false,
        properties: %{
          id: %Schema{
            type: :string,
            description:
              "Unique identifier for the SAP system, supporting resource tracking and management.",
            format: :uuid,
            example: "7269eb74-dd68-4c91-b4d1-4f9d91f2c2c8"
          },
          sid: %Schema{
            type: :string,
            description:
              "The SAP system identifier (SID) for this system, supporting system identification.",
            example: "HA1"
          },
          tenant: %Schema{
            type: :string,
            description:
              "The tenant identifier for this SAP system, supporting multi-tenancy and resource management.",
            example: "PRD"
          },
          db_host: %Schema{
            type: :string,
            description:
              "The address of the database connected to this SAP system, supporting connectivity and monitoring.",
            example: "10.1.1.5"
          },
          health: ResourceHealth,
          ensa_version: %Schema{
            type: :string,
            enum: EnsaVersion.values(),
            description: "ENSA version of the SAP system.",
            example: "ensa1"
          },
          application_instances: %Schema{
            description:
              "A list of the discovered Application Instances for current SAP Systems.",
            type: :array,
            items: ApplicationInstance
          },
          database_id: %Schema{
            type: :string,
            description: "Database ID.",
            format: :uuid,
            example: "6c76eb74-dd68-4c91-b4d1-4f9d91f2c2c8"
          },
          database_sid: %Schema{type: :string, description: "Database SID.", example: "HA1"},
          database_instances: Database.DatabaseInstances,
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
          id: "7269eb74-dd68-4c91-b4d1-4f9d91f2c2c8",
          sid: "HA1",
          tenant: "PRD",
          db_host: "10.1.1.5",
          health: "passing",
          ensa_version: "ensa1",
          application_instances: [],
          database_id: "6c76eb74-dd68-4c91-b4d1-4f9d91f2c2c8",
          database_sid: "HA1",
          database_instances: [],
          tags: [],
          inserted_at: "2024-01-15T10:30:00Z",
          updated_at: "2024-01-15T12:30:00Z"
        }
      },
      struct?: false
    )
  end

  defmodule SAPSystemsCollection do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "SAPSystemsCollection",
        description:
          "A list of discovered SAP systems, each including identification, database, health, and instance details for infrastructure monitoring and management.",
        type: :array,
        items: SAPSystemItem,
        example: [
          %{
            id: "7269eb74-dd68-4c91-b4d1-4f9d91f2c2c8",
            sid: "HA1",
            tenant: "PRD",
            db_host: "10.1.1.5",
            health: "passing",
            ensa_version: "ensa1",
            application_instances: [],
            database_id: "6c76eb74-dd68-4c91-b4d1-4f9d91f2c2c8",
            database_sid: "HA1",
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

  defmodule SAPSystemHealthOverview do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "SAPSystemHealthOverview",
        description:
          "Provides an overview of the health status for a discovered SAP system and its components, supporting infrastructure monitoring and alerting.",
        type: :object,
        additionalProperties: false,
        properties: %{
          id: %Schema{
            type: :string,
            description:
              "Unique identifier for the SAP system, supporting resource tracking and management.",
            format: :uuid,
            example: "7269eb74-dd68-4c91-b4d1-4f9d91f2c2c8"
          },
          sid: %Schema{
            type: :string,
            description:
              "The SAP system identifier (SID) for this system, supporting system identification.",
            example: "HA1"
          },
          cluster_id: %Schema{
            type: :string,
            description:
              "Unique identifier for the cluster associated with this SAP system, supporting infrastructure mapping.",
            format: :uuid,
            deprecated: true,
            example: "6c76eb74-dd68-4c91-b4d1-4f9d91f2c2c8"
          },
          application_cluster_id: %Schema{
            type: :string,
            description:
              "Unique identifier for the application cluster associated with this SAP system, supporting resource mapping.",
            format: :uuid,
            example: "6c76eb74-dd68-4c91-b4d1-4f9d91f2c2c8"
          },
          database_cluster_id: %Schema{
            type: :string,
            description:
              "Unique identifier for the database cluster associated with this SAP system, supporting resource mapping.",
            format: :uuid,
            example: "5a65db74-dd68-4c91-b4d1-4f9d91f2c2c8"
          },
          database_id: %Schema{
            type: :string,
            description:
              "Unique identifier for the database associated with this SAP system, supporting resource tracking and management.",
            format: :uuid,
            example: "9c86eb74-dd68-4c91-b4d1-4f9d91f2c2c8"
          },
          sapsystem_health: ResourceHealth,
          database_health: ResourceHealth,
          hosts_health: ResourceHealth,
          clusters_health: %Schema{
            allOf: [
              ResourceHealth,
              %Schema{deprecated: true}
            ]
          },
          application_cluster_health: ResourceHealth,
          database_cluster_health: ResourceHealth,
          tenant: %Schema{
            type: :string,
            description: "Tenant database SID.",
            deprecated: true,
            example: "PRD"
          },
          database_sid: %Schema{type: :string, description: "Database SID.", example: "HA1"}
        },
        example: %{
          id: "7269eb74-dd68-4c91-b4d1-4f9d91f2c2c8",
          sid: "HA1",
          cluster_id: "6c76eb74-dd68-4c91-b4d1-4f9d91f2c2c8",
          application_cluster_id: "6c76eb74-dd68-4c91-b4d1-4f9d91f2c2c8",
          database_cluster_id: "5a65db74-dd68-4c91-b4d1-4f9d91f2c2c8",
          database_id: "9c86eb74-dd68-4c91-b4d1-4f9d91f2c2c8",
          sapsystem_health: "passing",
          database_health: "passing",
          hosts_health: "passing",
          clusters_health: "passing",
          application_cluster_health: "passing",
          database_cluster_health: "passing",
          tenant: "PRD",
          database_sid: "HA1"
        }
      },
      struct?: false
    )
  end

  defmodule HealthOverview do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "HealthOverview",
        description:
          "A list of health summaries for discovered SAP systems, supporting infrastructure monitoring and alerting.",
        type: :array,
        items: SAPSystemHealthOverview,
        example: [
          %{
            id: "7269eb74-dd68-4c91-b4d1-4f9d91f2c2c8",
            sid: "HA1",
            cluster_id: "6c76eb74-dd68-4c91-b4d1-4f9d91f2c2c8",
            application_cluster_id: "6c76eb74-dd68-4c91-b4d1-4f9d91f2c2c8",
            database_cluster_id: "5a65db74-dd68-4c91-b4d1-4f9d91f2c2c8",
            database_id: "9c86eb74-dd68-4c91-b4d1-4f9d91f2c2c8",
            sapsystem_health: "passing",
            database_health: "passing",
            hosts_health: "passing",
            clusters_health: "passing",
            application_cluster_health: "passing",
            database_cluster_health: "passing",
            tenant: "PRD",
            database_sid: "HA1"
          }
        ]
      },
      struct?: false
    )
  end
end
