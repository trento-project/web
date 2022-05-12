defmodule TrentoWeb.OpenApi.Schema.Cluster do
  @moduledoc false

  require OpenApiSpex
  alias OpenApiSpex.Schema

  alias TrentoWeb.OpenApi.Schema.{Checks, Provider, Tag}

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
        id: %Schema{type: :integer, description: "Cluster ID"},
        name: %Schema{type: :string, description: "Cluster name"},
        sid: %Schema{type: :string, description: "SID"},
        provider: Provider.SupportedProviders,
        type: %Schema{
          type: :string,
          description: "Detected type of the cluster",
          enum: [:hana_scale_up, :hana_scale_out, :unknown]
        },
        selected_checks: %Schema{
          title: "SelectedChecks",
          description: "A list ids of the checks selected for execution on this cluster",
          type: :array,
          items: %Schema{type: :string}
        },
        health: %Schema{
          type: :string,
          description: "Detected health of the cluster",
          enum: [:passing, :warning, :critical, :unknown]
        },
        resources_number: %Schema{type: :integer, description: "Resource number"},
        hosts_number: %Schema{type: :integer, description: "Hosts number"},
        details: Details,
        checks_execution: %Schema{
          type: :string,
          description: "Current status of the checks execution for this cluster",
          enum: [:not_running, :requested, :running]
        },
        hosts_executions: %Schema{
          title: "HostChecksExecutions",
          description: "A list of tags attached to a resource",
          type: :array,
          items: Checks.HostChecksExecution
        },
        checks_results: %Schema{
          title: "CheckResults",
          description: "A list of tags attached to a resource",
          type: :array,
          items: Checks.CheckResult
        },
        tags: %Schema{
          title: "Tags",
          description: "A list of tags attached to a resource",
          type: :array,
          items: Tag
        }
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
