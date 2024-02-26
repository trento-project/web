defmodule TrentoWeb.OpenApi.V1.Schema.Cluster do
  @moduledoc false

  require OpenApiSpex

  alias OpenApiSpex.Schema

  alias TrentoWeb.OpenApi.V1.Schema.{Provider, ResourceHealth, Tags}

  defmodule ClusterResource do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "ClusterResource",
      description: "A Cluster Resource",
      type: :object,
      additionalProperties: false,
      properties: %{
        id: %Schema{type: :string},
        type: %Schema{type: :string},
        role: %Schema{type: :string},
        status: %Schema{type: :string},
        fail_count: %Schema{type: :integer}
      }
    })
  end

  defmodule HanaClusterNode do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "HanaClusterNode",
      description: "A HANA Cluster Node",
      additionalProperties: false,
      type: :object,
      properties: %{
        name: %Schema{type: :string},
        site: %Schema{type: :string},
        hana_status: %Schema{type: :string},
        attributes: %Schema{
          type: :object,
          description: "Node attributes",
          additionalProperties: %Schema{type: :string}
        },
        virtual_ip: %Schema{type: :string},
        resources: %Schema{
          description: "A list of Cluster resources",
          type: :array,
          items: ClusterResource
        }
      }
    })
  end

  defmodule SbdDevice do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "SbdDevice",
      description: "SBD Device",
      additionalProperties: false,
      type: :object,
      properties: %{
        device: %Schema{type: :string},
        status: %Schema{type: :string}
      }
    })
  end

  defmodule HanaClusterDetails do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "HanaClusterDetails",
      description: "Details of a HANA Pacemaker Cluster",
      type: :object,
      additionalProperties: false,
      properties: %{
        system_replication_mode: %Schema{type: :string, description: "System Replication Mode"},
        system_replication_operation_mode: %Schema{
          type: :string,
          description: "System Replication Operation Mode"
        },
        secondary_sync_state: %Schema{type: :string, description: "Secondary Sync State"},
        sr_health_state: %Schema{type: :string, description: "SR health state"},
        fencing_type: %Schema{type: :string, description: "Fencing Type"},
        stopped_resources: %Schema{
          description: "A list of the stopped resources on this HANA Cluster",
          type: :array,
          items: ClusterResource
        },
        nodes: %Schema{
          type: :array,
          items: HanaClusterNode
        },
        sbd_devices: %Schema{
          type: :array,
          items: SbdDevice
        }
      },
      required: [:nodes]
    })
  end

  defmodule Details do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "PacemakerClusterDetails",
      description: "Details of the detected PacemakerCluster",
      nullable: true,
      oneOf: [
        HanaClusterDetails
      ]
    })
  end

  defmodule PacemakerCluster do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "PacemakerCluster",
      description: "A discovered Pacemaker Cluster on the target infrastructure",
      type: :object,
      additionalProperties: false,
      properties: %{
        id: %Schema{type: :string, description: "Cluster ID", format: :uuid},
        name: %Schema{type: :string, description: "Cluster name"},
        sid: %Schema{type: :string, description: "SID"},
        additional_sids: %Schema{
          type: :array,
          items: %Schema{type: :string},
          description: "Additionally discovered SIDs, such as ASCS/ERS cluster SIDs"
        },
        provider: Provider.SupportedProviders,
        type: %Schema{
          type: :string,
          description: "Detected type of the cluster",
          enum: [:hana_scale_up, :hana_scale_out, :unknown]
        },
        selected_checks: %Schema{
          title: "SelectedChecks",
          description: "A list of check ids selected for an execution on this cluster",
          type: :array,
          items: %Schema{type: :string}
        },
        health: ResourceHealth,
        resources_number: %Schema{type: :integer, description: "Resource number", nullable: true},
        hosts_number: %Schema{type: :integer, description: "Hosts number", nullable: true},
        cib_last_written: %Schema{
          type: :string,
          description: "CIB last written date",
          nullable: true
        },
        details: Details,
        tags: Tags,
        inserted_at: %Schema{type: :string, format: :datetime},
        updated_at: %Schema{type: :string, format: :datetime, nullable: true}
      }
    })
  end

  defmodule PacemakerClustersCollection do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "PacemakerClustersCollection",
      description: "A list of the discovered Pacemaker Clusters",
      type: :array,
      items: PacemakerCluster
    })
  end
end
