defmodule TrentoWeb.OpenApi.Schema.Database do
  @moduledoc false

  require OpenApiSpex
  alias OpenApiSpex.Schema

  alias TrentoWeb.OpenApi.Schema.{ResourceHealth, Tags}

  defmodule DatabaseInstance do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "DatabaseInstance",
      description: "A discovered HANA Database Instance on the target infrastructure",
      type: :object,
      properties: %{
        sap_system_id: %Schema{type: :string, description: "SAP System ID", format: :uuid},
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
        health: ResourceHealth
      }
    })
  end

  defmodule DatabaseInstances do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "DatabaseInstances",
      description:
        "A list of DatabaseInstances, part of a complete SAP System, or only a HANA Database",
      type: :array,
      items: DatabaseInstance
    })
  end

  defmodule DatabaseItem do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "Database",
      description: "A discovered HANA Database on the target infrastructure",
      type: :object,
      properties: %{
        id: %Schema{type: :string, description: "Database ID", format: :uuid},
        sid: %Schema{type: :string, description: "SID"},
        health: ResourceHealth,
        database_instances: DatabaseInstances,
        tags: Tags
      }
    })
  end

  defmodule DatabasesCollection do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "DatabasesCollection",
      description: "A list of the discovered HANA Databases",
      type: :array,
      items: DatabaseItem
    })
  end
end
