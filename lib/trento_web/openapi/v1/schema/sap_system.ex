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
        description: "A discovered Application Instance on the target infrastructure.",
        type: :object,
        additionalProperties: false,
        properties: %{
          sap_system_id: %Schema{
            type: :string,
            description: "SAP System ID.",
            format: :uuid,
            example: "7269eb74-dd68-4c91-b4d1-4f9d91f2c2c8"
          },
          sid: %Schema{type: :string, description: "SID.", example: "HA1"},
          instance_number: %Schema{type: :string, description: "Instance Number.", example: "00"},
          instance_hostname: %Schema{
            type: :string,
            description: "Instance Hostname.",
            nullable: true,
            example: "sap-app-01"
          },
          absent_at: %Schema{
            type: :string,
            description: "Absent instance timestamp.",
            format: :datetime,
            nullable: true,
            example: "2024-01-16T08:00:00Z"
          },
          features: %Schema{
            type: :string,
            description: "Instance Features.",
            example: "MESSAGESERVER|ENQUE"
          },
          http_port: %Schema{
            type: :integer,
            description: "Instance HTTP Port.",
            nullable: true,
            example: 8000
          },
          https_port: %Schema{
            type: :integer,
            description: "Instance HTTPS Port.",
            nullable: true,
            example: 44300
          },
          start_priority: %Schema{
            type: :string,
            description: "Instance Start Priority.",
            nullable: true,
            example: "1"
          },
          host_id: %Schema{
            type: :string,
            description: "Identifier of the host where current instance is running.",
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
        description: "A discovered SAP System on the target infrastructure.",
        type: :object,
        additionalProperties: false,
        properties: %{
          id: %Schema{
            type: :string,
            description: "SAP System ID.",
            format: :uuid,
            example: "7269eb74-dd68-4c91-b4d1-4f9d91f2c2c8"
          },
          sid: %Schema{type: :string, description: "SID.", example: "HA1"},
          tenant: %Schema{type: :string, description: "Tenant.", example: "PRD"},
          db_host: %Schema{
            type: :string,
            description: "Address of the connected Database.",
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
        description: "A list of the discovered SAP Systems.",
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
        description: "An overview of the health of a discovered SAP System and its components.",
        type: :object,
        additionalProperties: false,
        properties: %{
          id: %Schema{
            type: :string,
            description: "SAP System ID.",
            format: :uuid,
            example: "7269eb74-dd68-4c91-b4d1-4f9d91f2c2c8"
          },
          sid: %Schema{type: :string, description: "SID.", example: "HA1"},
          cluster_id: %Schema{
            type: :string,
            description: "Cluster ID.",
            format: :uuid,
            deprecated: true,
            example: "6c76eb74-dd68-4c91-b4d1-4f9d91f2c2c8"
          },
          application_cluster_id: %Schema{
            type: :string,
            description: "Application cluster ID.",
            format: :uuid,
            example: "6c76eb74-dd68-4c91-b4d1-4f9d91f2c2c8"
          },
          database_cluster_id: %Schema{
            type: :string,
            description: "Database cluster ID.",
            format: :uuid,
            example: "5a65db74-dd68-4c91-b4d1-4f9d91f2c2c8"
          },
          database_id: %Schema{
            type: :string,
            description: "Database ID.",
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
        description: "A list of health summaries for the discovered SAP Systems.",
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
