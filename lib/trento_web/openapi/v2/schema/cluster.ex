defmodule TrentoWeb.OpenApi.V2.Schema.Cluster do
  @moduledoc false

  require OpenApiSpex
  require Trento.Clusters.Enums.ClusterType, as: ClusterType
  require Trento.Clusters.Enums.AscsErsClusterRole, as: AscsErsClusterRole

  alias OpenApiSpex.Schema

  alias TrentoWeb.OpenApi.V1.Schema.{Cluster, Provider, ResourceHealth, Tags}

  defmodule HanaClusterNode do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "HanaClusterNode",
      description: "A HANA Cluster Node",
      type: :object,
      properties: %{
        name: %Schema{type: :string},
        site: %Schema{type: :string},
        hana_status: %Schema{type: :string, deprecated: true},
        attributes: %Schema{
          type: :object,
          description: "Node attributes",
          additionalProperties: %Schema{type: :string}
        },
        virtual_ip: %Schema{type: :string},
        resources: %Schema{
          description: "A list of Cluster resources",
          type: :array,
          items: Cluster.ClusterResource
        }
      }
    })
  end

  defmodule HanaClusterSite do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "HanaClusterSite",
      description: "A HANA Cluster Site",
      type: :object,
      properties: %{
        name: %Schema{type: :string, description: "Site name"},
        state: %Schema{type: :string, description: "Site state"},
        sr_health_state: %Schema{type: :string, description: "Site SR Health state"}
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
        sr_health_state: %Schema{type: :string, description: "SR health state", deprecated: true},
        fencing_type: %Schema{type: :string, description: "Fencing Type"},
        stopped_resources: %Schema{
          description: "A list of the stopped resources on this HANA Cluster",
          type: :array,
          items: Cluster.ClusterResource
        },
        nodes: %Schema{
          type: :array,
          items: HanaClusterNode
        },
        sites: %Schema{
          description: "A list of HANA sites",
          type: :array,
          items: HanaClusterSite
        },
        sbd_devices: %Schema{
          type: :array,
          items: Cluster.SbdDevice
        }
      },
      required: [:nodes]
    })
  end

  defmodule AscsErsClusterNode do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "AscsErsClusterNode",
      description: "ASCS/ERS Cluster Node",
      type: :object,
      properties: %{
        attributes: %Schema{
          type: :object,
          description: "Node attributes",
          additionalProperties: %Schema{type: :string}
        },
        filesystems: %Schema{
          type: :array,
          items: %Schema{type: :string},
          description: "List of filesystems managed in this node"
        },
        name: %Schema{
          type: :string,
          description: "Node name"
        },
        resources: %Schema{
          type: :array,
          items: Cluster.ClusterResource,
          description: "A list of Cluster resources"
        },
        roles: %Schema{
          type: :array,
          items: %Schema{type: :string, enum: AscsErsClusterRole.values()},
          description: "List of roles managed in this node"
        },
        virtual_ips: %Schema{
          type: :array,
          items: %Schema{type: :string},
          description: "List of virtual IPs managed in this node"
        }
      }
    })
  end

  defmodule AscsErsClusterSAPSystem do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "AscsErsClusterSAPSystem",
      description: "SAP system managed by a ASCS/ERS cluster",
      type: :object,
      properties: %{
        distributed: %Schema{
          type: :boolean,
          description: "ASCS and ERS instances are distributed and running in different nodes"
        },
        filesystem_resource_based: %Schema{
          type: :boolean,
          description:
            "ASCS and ERS filesystems are handled by the cluster with the Filesystem resource agent"
        },
        nodes: %Schema{
          type: :array,
          items: AscsErsClusterNode,
          description: "List of ASCS/ERS nodes for this SAP system"
        }
      }
    })
  end

  defmodule AscsErsClusterDetails do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "AscsErsClusterDetails",
      description: "Details of a ASCS/ERS Pacemaker Cluster",
      type: :object,
      properties: %{
        fencing_type: %Schema{
          type: :string,
          description: "Fencing type"
        },
        sap_systems: %Schema{
          type: :array,
          items: AscsErsClusterSAPSystem,
          description: "List of managed SAP systems in a single or multi SID cluster"
        },
        sbd_devices: %Schema{
          type: :array,
          items: Cluster.SbdDevice,
          description: "List of SBD devices used in the cluster"
        },
        stopped_resources: %Schema{
          type: :array,
          items: Cluster.ClusterResource,
          description: "List of the stopped resources on this HANA Cluster"
        }
      },
      required: [:sap_systems]
    })
  end

  defmodule Details do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "PacemakerClusterDetails",
      description: "Details of the detected PacemakerCluster",
      nullable: true,
      oneOf: [
        AscsErsClusterDetails,
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