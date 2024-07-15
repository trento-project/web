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
        description: "A discovered Application Instance on the target infrastructure",
        type: :object,
        additionalProperties: false,
        properties: %{
          sap_system_id: %Schema{type: :string, description: "SAP System ID", format: :uuid},
          sid: %Schema{type: :string, description: "SID"},
          instance_number: %Schema{type: :string, description: "Instance Number"},
          instance_hostname: %Schema{
            type: :string,
            description: "Instance Hostname",
            nullable: true
          },
          absent_at: %Schema{
            type: :string,
            description: "Absent instance timestamp",
            format: :datetime,
            nullable: true
          },
          features: %Schema{type: :string, description: "Instance Features"},
          http_port: %Schema{type: :integer, description: "Instance HTTP Port", nullable: true},
          https_port: %Schema{type: :integer, description: "Instance HTTPS Port", nullable: true},
          start_priority: %Schema{
            type: :string,
            description: "Instance Start Priority",
            nullable: true
          },
          host_id: %Schema{
            type: :string,
            description: "Identifier of the host where current instance is running",
            format: :uuid
          },
          health: ResourceHealth,
          inserted_at: %Schema{type: :string, format: :datetime},
          updated_at: %Schema{type: :string, format: :datetime, nullable: true}
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
        description: "A discovered SAP System on the target infrastructure",
        type: :object,
        additionalProperties: false,
        properties: %{
          id: %Schema{type: :string, description: "SAP System ID", format: :uuid},
          sid: %Schema{type: :string, description: "SID"},
          tenant: %Schema{type: :string, description: "Tenant"},
          db_host: %Schema{type: :string, description: "Address of the connected Database"},
          health: ResourceHealth,
          ensa_version: %Schema{
            type: :string,
            enum: EnsaVersion.values(),
            description: "ENSA version of the SAP system"
          },
          application_instances: %Schema{
            title: "ApplicationInstances",
            description: "A list of the discovered Application Instances for current SAP Systems",
            type: :array,
            items: ApplicationInstance
          },
          database_id: %Schema{type: :string, description: "Database ID", format: :uuid},
          database_sid: %Schema{type: :string, description: "Database SID"},
          database_instances: Database.DatabaseInstances,
          tags: Tags,
          inserted_at: %Schema{type: :string, format: :datetime},
          updated_at: %Schema{type: :string, format: :datetime, nullable: true}
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
        description: "A list of the discovered SAP Systems",
        type: :array,
        items: SAPSystemItem
      },
      struct?: false
    )
  end

  defmodule SAPSystemHealthOverview do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "SAPSystemHealthOverview",
        description: "An overview of the health of a discovered SAP System and its components",
        type: :object,
        additionalProperties: false,
        properties: %{
          id: %Schema{type: :string, description: "SAP System ID", format: :uuid},
          sid: %Schema{type: :string, description: "SID"},
          cluster_id: %Schema{
            type: :string,
            description: "Cluster ID",
            format: :uuid,
            deprecated: true
          },
          application_cluster_id: %Schema{
            type: :string,
            description: "Application cluster ID",
            format: :uuid
          },
          database_cluster_id: %Schema{
            type: :string,
            description: "Database cluster ID",
            format: :uuid
          },
          database_id: %Schema{type: :string, description: "Database ID", format: :uuid},
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
          tenant: %Schema{type: :string, description: "Tenant database SID", deprecated: true},
          database_sid: %Schema{type: :string, description: "Database SID"}
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
        description: "A list of health summaries for the discovered SAP Systems",
        type: :array,
        items: SAPSystemHealthOverview
      },
      struct?: false
    )
  end
end
