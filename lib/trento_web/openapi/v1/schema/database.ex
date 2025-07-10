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
        description: "A discovered HANA Database Instance on the target infrastructure",
        type: :object,
        additionalProperties: false,
        properties: %{
          sap_system_id: %Schema{
            type: :string,
            description: "SAP System ID",
            format: :uuid,
            deprecated: true
          },
          database_id: %Schema{type: :string, description: "Database ID", format: :uuid},
          sid: %Schema{type: :string, description: "SID"},
          tenant: %Schema{type: :string, description: "Tenant"},
          instance_number: %Schema{type: :string, description: "Instance Number"},
          instance_hostname: %Schema{
            type: :string,
            description: "Instance Hostname",
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
          system_replication: %Schema{type: :string, description: "System Replication"},
          system_replication_status: %Schema{
            type: :string,
            description: "System Replication Status"
          },
          system_replication_site: %Schema{
            type: :string,
            nullable: true,
            description: "System Replication Site"
          },
          system_replication_mode: %Schema{
            type: :string,
            nullable: true,
            description: "System Replication Mode"
          },
          system_replication_operation_mode: %Schema{
            type: :string,
            nullable: true,
            description: "System Replication Operation mode"
          },
          system_replication_source_site: %Schema{
            type: :string,
            nullable: true,
            description: "System Replication Source site where replication is coming from"
          },
          system_replication_tier: %Schema{
            type: :integer,
            nullable: true,
            description: "System Replication Site tier number"
          },
          health: ResourceHealth,
          absent_at: %Schema{
            type: :string,
            description: "Absent instance timestamp",
            format: :datetime,
            nullable: true
          },
          inserted_at: %Schema{type: :string, format: :datetime},
          updated_at: %Schema{type: :string, format: :datetime, nullable: true}
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
          "A list of DatabaseInstances, part of a complete SAP System, or only a HANA Database",
        type: :array,
        items: DatabaseInstance
      },
      struct?: false
    )
  end

  defmodule DatabaseItem do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "Database",
        description: "A discovered HANA Database on the target infrastructure",
        type: :object,
        additionalProperties: false,
        properties: %{
          id: %Schema{type: :string, description: "Database ID", format: :uuid},
          sid: %Schema{type: :string, description: "SID"},
          health: ResourceHealth,
          database_instances: DatabaseInstances,
          tags: Tags,
          inserted_at: %Schema{type: :string, format: :datetime},
          updated_at: %Schema{type: :string, format: :datetime, nullable: true}
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
        description: "A list of the discovered HANA Databases",
        type: :array,
        items: DatabaseItem
      },
      struct?: false
    )
  end
end
