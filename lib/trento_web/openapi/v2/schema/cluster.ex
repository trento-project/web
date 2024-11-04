defmodule TrentoWeb.OpenApi.V2.Schema.Cluster do
  @moduledoc false

  require OpenApiSpex
  require Trento.Clusters.Enums.ClusterType, as: ClusterType
  require Trento.Clusters.Enums.HanaScenario, as: HanaScenario
  require Trento.Clusters.Enums.AscsErsClusterRole, as: AscsErsClusterRole
  require Trento.Clusters.Enums.HanaArchitectureType, as: HanaArchitectureType

  alias OpenApiSpex.Schema

  alias TrentoWeb.OpenApi.V1.Schema.{Cluster, Provider, ResourceHealth, Tags}

  defmodule ClusterResource do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "ClusterResource",
        description: "A Cluster Resource",
        type: :object,
        additionalProperties: false,
        properties: %{
          id: %Schema{type: :string},
          type: %Schema{type: :string},
          role: %Schema{type: :string},
          status: %Schema{type: :string},
          fail_count: %Schema{type: :integer},
          managed: %Schema{type: :boolean}
        }
      },
      struct?: false
    )
  end

  defmodule HanaClusterNode do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "HanaClusterNode",
        description: "A HANA Cluster Node",
        type: :object,
        additionalProperties: false,
        properties: %{
          name: %Schema{type: :string},
          site: %Schema{type: :string},
          indexserver_actual_role: %Schema{type: :string, nullable: true},
          nameserver_actual_role: %Schema{type: :string, nullable: true},
          hana_status: %Schema{type: :string, deprecated: true},
          status: %Schema{type: :string},
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
      },
      struct?: false
    )
  end

  defmodule HanaClusterSite do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "HanaClusterSite",
        description: "A HANA Cluster Site",
        type: :object,
        additionalProperties: false,
        properties: %{
          name: %Schema{type: :string, description: "Site name"},
          state: %Schema{type: :string, description: "Site state"},
          sr_health_state: %Schema{type: :string, description: "Site SR Health state"}
        }
      },
      struct?: false
    )
  end

  defmodule HanaClusterDetails do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "HanaClusterDetails",
        description: "Details of a HANA Pacemaker Cluster",
        type: :object,
        additionalProperties: false,
        properties: %{
          architecture_type: %Schema{
            type: :string,
            description: "HANA architecture type.",
            enum: HanaArchitectureType.values()
          },
          system_replication_mode: %Schema{type: :string, description: "System Replication Mode"},
          system_replication_operation_mode: %Schema{
            type: :string,
            description: "System Replication Operation Mode"
          },
          secondary_sync_state: %Schema{type: :string, description: "Secondary Sync State"},
          sr_health_state: %Schema{
            type: :string,
            description: "SR health state",
            deprecated: true
          },
          fencing_type: %Schema{type: :string, description: "Fencing Type"},
          maintenance_mode: %Schema{
            type: :boolean,
            description: "Maintenance mode enabled"
          },
          stopped_resources: %Schema{
            description: "A list of the stopped resources on this HANA Cluster",
            type: :array,
            items: ClusterResource
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
      },
      struct?: false
    )
  end

  defmodule AscsErsClusterNode do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "AscsErsClusterNode",
        description: "ASCS/ERS Cluster Node",
        type: :object,
        additionalProperties: false,
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
          status: %Schema{
            type: :string,
            description: "Node status"
          },
          resources: %Schema{
            type: :array,
            items: ClusterResource,
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
      },
      struct?: false
    )
  end

  defmodule AscsErsClusterSAPSystem do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "AscsErsClusterSAPSystem",
        description: "SAP system managed by a ASCS/ERS cluster",
        type: :object,
        additionalProperties: false,
        required: [:sid],
        properties: %{
          sid: %Schema{type: :string, description: "SID"},
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
      },
      struct?: false
    )
  end

  defmodule AscsErsClusterDetails do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "AscsErsClusterDetails",
        description: "Details of a ASCS/ERS Pacemaker Cluster",
        type: :object,
        additionalProperties: false,
        properties: %{
          fencing_type: %Schema{
            type: :string,
            description: "Fencing type"
          },
          maintenance_mode: %Schema{
            type: :boolean,
            description: "Maintenance mode enabled"
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
            items: ClusterResource,
            description: "List of the stopped resources on this HANA Cluster"
          }
        },
        required: [:sap_systems]
      },
      struct?: false
    )
  end

  defmodule Details do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "PacemakerClusterDetails",
        description: "Details of the detected PacemakerCluster",
        nullable: true,
        oneOf: [
          AscsErsClusterDetails,
          HanaClusterDetails
        ]
      },
      struct?: false
    )
  end

  defmodule PacemakerCluster do
    @moduledoc false

    OpenApiSpex.schema(
      %{
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
            enum: ClusterType.values()
          },
          hana_scenario: %Schema{
            type: :string,
            description: "Detected type of the hana scenario",
            enum: HanaScenario.values()
          },
          selected_checks: %Schema{
            title: "SelectedChecks",
            description: "A list of check ids selected for an execution on this cluster",
            type: :array,
            items: %Schema{type: :string}
          },
          health: ResourceHealth,
          resources_number: %Schema{
            type: :integer,
            description: "Resource number",
            nullable: true
          },
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
      },
      struct?: false
    )
  end

  defmodule PacemakerClustersCollection do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "PacemakerClustersCollection",
        description: "A list of the discovered Pacemaker Clusters",
        type: :array,
        items: PacemakerCluster
      },
      struct?: false
    )
  end
end
