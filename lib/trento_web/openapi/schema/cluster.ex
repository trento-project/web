defmodule TrentoWeb.OpenApi.Schema.Cluster do
  @moduledoc false

  require OpenApiSpex
  require Trento.Domain.Enums.ClusterType, as: ClusterType

  alias OpenApiSpex.Schema

  alias TrentoWeb.OpenApi.Schema.{Provider, ResourceHealth, Tags}

  defmodule ClusterResource do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "ClusterResource",
      description: "A Cluster Resource",
      type: :object,
      properties: %{
        id: %Schema{type: :string},
        type: %Schema{type: :string},
        role: %Schema{type: :string},
        status: %Schema{type: :string},
        fail_count: %Schema{type: :integer}
      }
    })
  end

  defmodule ClusterNode do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "ClusterNode",
      description: "A Cluster Node",
      type: :object,
      properties: %{
        name: %Schema{type: :string},
        site: %Schema{type: :string},
        hana_status: %Schema{type: :string},
        attributes: %Schema{
          title: "ClusterNodeAttributes",
          type: :array,
          items: %Schema{type: :string}
        },
        virtual_ip: %Schema{type: :string},
        resources: %Schema{
          title: "ClustrNodeResources",
          description: "A list of ClusterNodes",
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
      description: "Ad Sbd Device",
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
          title: "ClusterResource",
          description: "A list of the stopped resources on this HANA Cluster",
          type: :array,
          items: ClusterResource
        },
        nodes: %Schema{
          title: "HanaClusterNodes",
          type: :array,
          items: ClusterNode
        },
        sbd_devices: %Schema{
          title: "SbdDevice",
          type: :array,
          items: SbdDevice
        }
      }
    })
  end

  defmodule Details do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "PacemakerClusterDetail",
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
          enum: ClusterType.values()
        },
        selected_checks: %Schema{
          title: "SelectedChecks",
          description: "A list ids of the checks selected for execution on this cluster",
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
        tags: Tags
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
