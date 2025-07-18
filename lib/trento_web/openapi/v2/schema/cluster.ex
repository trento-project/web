defmodule TrentoWeb.OpenApi.V2.Schema.Cluster do
  @moduledoc false

  require OpenApiSpex
  require Trento.Clusters.Enums.ClusterType, as: ClusterType
  require Trento.Clusters.Enums.AscsErsClusterRole, as: AscsErsClusterRole
  require Trento.Clusters.Enums.HanaArchitectureType, as: HanaArchitectureType
  require Trento.Clusters.Enums.HanaScenario, as: HanaScenario

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
          managed: %Schema{type: :boolean},
          node: %Schema{type: :string, nullable: true},
          parent: %Schema{
            type: :object,
            additionalProperties: false,
            nullable: true,
            properties: %{
              id: %Schema{type: :string},
              managed: %Schema{type: :boolean, description: "Resource is managed"},
              multi_state: %Schema{
                type: :boolean,
                nullable: true,
                description: """
                Represents the type of the group.
                - true: promotable group
                - false: cloned group
                - null: standard group
                """
              }
            }
          }
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
            items: ClusterResource,
            deprecated: true
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
          hana_scenario: %Schema{
            type: :string,
            description: "HANA scenario type",
            enum: HanaScenario.values()
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
            items: ClusterResource,
            deprecated: true
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
          },
          resources: %Schema{
            description: "A list of cluster resources",
            items: ClusterResource
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
            description: "A list of Cluster resources",
            deprecated: true
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
            description: "List of the stopped resources on this HANA Cluster",
            deprecated: true
          },
          resources: %Schema{
            description: "A list of cluster resources",
            items: ClusterResource
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
          sid: %Schema{
            type: :string,
            description: "SID. Deprecated: use sap_instances instead",
            deprecated: true
          },
          additional_sids: %Schema{
            type: :array,
            items: %Schema{type: :string},
            description:
              "Additionally discovered SIDs, such as ASCS/ERS cluster SIDs. Deprecated: use sap_instances instead",
            deprecated: true
          },
          sap_instances: %Schema{
            description: "Cluster SAP instances with their SID and additional information",
            type: :array,
            items: %Schema{
              type: :object,
              properties: %{
                sid: %Schema{type: :string, description: "SAP instance SID"},
                instance_number: %Schema{type: :string, description: "SAP instance number"}
              },
              additionalProperties: false,
              required: [:sid, :instance_number]
            }
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
