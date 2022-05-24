defmodule TrentoWeb.OpenApi.Schema.SAPSystem do
  @moduledoc false

  require OpenApiSpex
  alias OpenApiSpex.Schema

  alias TrentoWeb.OpenApi.Schema.{Database, ResourceHealth, Tags}

  defmodule ApplicationInstance do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "ApplicationInstance",
      description: "A discovered Application Instance on the target infrastructure",
      type: :object,
      properties: %{
        sap_system_id: %Schema{type: :string, description: "SAP System ID", format: :uuid},
        sid: %Schema{type: :string, description: "SID"},
        instance_number: %Schema{type: :string, description: "Instance Number"},
        instance_hostname: %Schema{type: :string, description: "Instance Hostname"},
        features: %Schema{type: :string, description: "Instance Features"},
        http_port: %Schema{type: :integer, description: "Instance HTTP Port"},
        https_port: %Schema{type: :integer, description: "Instance HTTPS Port"},
        start_priority: %Schema{type: :string, description: "Instance Start Priority"},
        host_id: %Schema{
          type: :string,
          description: "Identifier of the host where current instance is running",
          format: :uuid
        },
        health: ResourceHealth
      }
    })
  end

  defmodule SAPSystemItem do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "SAPSystem",
      description: "A discovered SAP System on the target infrastructure",
      type: :object,
      properties: %{
        id: %Schema{type: :string, description: "SAP System ID", format: :uuid},
        sid: %Schema{type: :string, description: "SID"},
        tenant: %Schema{type: :string, description: "Tenant"},
        db_host: %Schema{type: :string, description: "Address of the connected Database"},
        health: ResourceHealth,
        application_instances: %Schema{
          title: "ApplicationInstances",
          description: "A list of the discovered Application Instances for current SAP Systems",
          type: :array,
          items: ApplicationInstance
        },
        database_instances: Database.DatabaseInstances,
        tags: Tags
      }
    })
  end

  defmodule SAPSystemsCollection do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "SAPSystemsCollection",
      description: "A list of the discovered SAP Systems",
      type: :array,
      items: SAPSystemItem
    })
  end

  defmodule SAPSystemHealthOverview do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "SAPSystemHealthOverview",
      description: "An overview of the health of a discovered SAP System and its components",
      type: :object,
      properties: %{
        id: %Schema{type: :string, description: "SAP System ID", format: :uuid},
        sid: %Schema{type: :string, description: "SID"},
        sapsystem_health: ResourceHealth,
        database_health: ResourceHealth,
        hosts_health: ResourceHealth,
        clusters_health: ResourceHealth
      }
    })
  end

  defmodule HealthOverview do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "HealthOverview",
      description: "A list of health summaries for the discovered SAP Systems",
      type: :array,
      items: SAPSystemHealthOverview
    })
  end
end
