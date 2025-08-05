defmodule TrentoWeb.OpenApi.V1.Schema.Cluster do
  @moduledoc false

  require OpenApiSpex

  alias OpenApiSpex.Schema

  alias TrentoWeb.OpenApi.V1.Schema.{Provider, ResourceHealth, Tags}

  defmodule ClusterResource do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "ClusterResource",
        description:
          "Represents a resource within a cluster, including its type, role, and operational status for management and monitoring.",
        type: :object,
        additionalProperties: false,
        properties: %{
          id: %Schema{type: :string},
          type: %Schema{type: :string},
          role: %Schema{type: :string},
          status: %Schema{type: :string},
          fail_count: %Schema{type: :integer}
        },
        example: %{
          id: "msl_SAPHana_PRD_HDB00",
          type: "ocf::suse:SAPHanaTopology",
          role: "Master",
          status: "Started",
          fail_count: 0
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
        description:
          "Represents a node in a HANA cluster, including its attributes, status, and associated resources for high availability.",
        additionalProperties: false,
        type: :object,
        properties: %{
          name: %Schema{type: :string},
          site: %Schema{type: :string},
          hana_status: %Schema{type: :string},
          attributes: %Schema{
            type: :object,
            description:
              "Attributes describing the configuration and operational state of the cluster node, supporting management and monitoring.",
            additionalProperties: %Schema{type: :string}
          },
          virtual_ip: %Schema{type: :string},
          resources: %Schema{
            description:
              "A list containing resources associated with the HANA cluster node, supporting infrastructure management.",
            type: :array,
            items: ClusterResource
          }
        },
        example: %{
          name: "hana01",
          site: "NUREMBERG",
          hana_status: "Primary",
          attributes: %{
            "hana_prd_op_mode" => "logreplay",
            "hana_prd_srmode" => "sync"
          },
          virtual_ip: "192.168.1.10",
          resources: [
            %{
              id: "rsc_SAPHana_PRD_HDB00",
              type: "ocf::suse:SAPHana",
              role: "Master",
              status: "running",
              fail_count: 0
            }
          ]
        }
      },
      struct?: false
    )
  end

  defmodule SbdDevice do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "SbdDevice",
        description:
          "Represents a SBD device used for fencing and high availability in cluster environments.",
        additionalProperties: false,
        type: :object,
        properties: %{
          device: %Schema{type: :string},
          status: %Schema{type: :string}
        },
        example: %{
          device: "/dev/disk/by-id/scsi-SLIO-ORG_disk_01",
          status: "healthy"
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
        description:
          "Provides detailed information about a HANA Pacemaker Cluster, including replication, health, and resource status.",
        type: :object,
        additionalProperties: false,
        properties: %{
          system_replication_mode: %Schema{
            type: :string,
            description:
              "Indicates the replication mode used by the HANA system, supporting high availability and disaster recovery."
          },
          system_replication_operation_mode: %Schema{
            type: :string,
            description:
              "Shows the operation mode for system replication, providing context for cluster synchronization and failover."
          },
          secondary_sync_state: %Schema{
            type: :string,
            description:
              "Displays the synchronization state of the secondary node in the HANA cluster, supporting monitoring and management."
          },
          sr_health_state: %Schema{
            type: :string,
            description:
              "Indicates the health status of system replication in the HANA cluster, supporting operational decisions."
          },
          fencing_type: %Schema{
            type: :string,
            description:
              "Specifies the type of fencing used in the cluster, supporting high availability and fault tolerance."
          },
          stopped_resources: %Schema{
            description:
              "A list containing resources that are currently stopped in the HANA cluster, supporting troubleshooting and recovery.",
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
        required: [:nodes],
        example: %{
          system_replication_mode: "sync",
          system_replication_operation_mode: "logreplay",
          secondary_sync_state: "SOK",
          sr_health_state: "4",
          fencing_type: "external/sbd",
          stopped_resources: [],
          nodes: [
            %{
              name: "hana01",
              site: "NUREMBERG",
              virtual_ip: "192.168.1.10",
              hana_status: "Primary",
              attributes: %{
                "hana_prd_op_mode" => "logreplay"
              }
            }
          ],
          sbd_devices: [
            %{
              device: "/dev/disk/by-id/scsi-SLIO-ORG_disk_01",
              status: "healthy"
            }
          ]
        }
      },
      struct?: false
    )
  end

  defmodule Details do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "PacemakerClusterDetails",
        description:
          "Provides details about the detected PacemakerCluster, including configuration, health, and operational status.",
        type: :object,
        nullable: true,
        oneOf: [
          HanaClusterDetails
        ],
        example: %{
          system_replication_mode: "sync",
          system_replication_operation_mode: "logreplay",
          secondary_sync_state: "SOK",
          sr_health_state: "4",
          fencing_type: "external/sbd",
          stopped_resources: [],
          nodes: [
            %{
              name: "hana01",
              site: "NUREMBERG",
              hana_status: "Primary"
            }
          ],
          sbd_devices: [
            %{
              device: "/dev/disk/by-id/scsi-SLIO-ORG_disk_01",
              status: "healthy"
            }
          ]
        }
      },
      struct?: false
    )
  end

  defmodule PacemakerCluster do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "PacemakerCluster",
        description:
          "Represents a Pacemaker Cluster discovered on the target infrastructure, including its configuration, health, and associated resources.",
        type: :object,
        additionalProperties: false,
        properties: %{
          id: %Schema{
            type: :string,
            description: "Unique identifier for the cluster, used for tracking and management.",
            format: :uuid
          },
          name: %Schema{
            type: :string,
            description:
              "The name assigned to the cluster, used for identification and organization."
          },
          sid: %Schema{
            type: :string,
            description:
              "The system identifier (SID) for the cluster, used for SAP system management."
          },
          additional_sids: %Schema{
            type: :array,
            items: %Schema{type: :string},
            description:
              "A list of additional SIDs discovered in the cluster, such as ASCS or ERS, supporting SAP landscape management."
          },
          provider: Provider.SupportedProviders,
          type: %Schema{
            type: :string,
            description:
              "Specifies the detected type of the cluster, such as HANA scale-up or scale-out, for classification and management.",
            enum: [:hana_scale_up, :hana_scale_out, :unknown]
          },
          selected_checks: %Schema{
            description:
              "A list containing the IDs of checks selected for execution on this cluster, supporting targeted monitoring and analysis.",
            type: :array,
            items: %Schema{type: :string}
          },
          health: ResourceHealth,
          resources_number: %Schema{
            type: :integer,
            description:
              "Indicates the number of resources associated with the cluster, supporting capacity and infrastructure planning.",
            nullable: true
          },
          hosts_number: %Schema{
            type: :integer,
            description:
              "Shows the number of hosts that are part of the cluster, supporting infrastructure management.",
            nullable: true
          },
          cib_last_written: %Schema{
            type: :string,
            description:
              "The date and time when the cluster's CIB was last written, supporting audit and change tracking.",
            nullable: true
          },
          details: Details,
          tags: Tags,
          inserted_at: %Schema{type: :string, format: :datetime},
          updated_at: %Schema{type: :string, format: :datetime, nullable: true}
        },
        example: %{
          id: "123e4567-e89b-12d3-a456-426614174000",
          name: "hana_cluster",
          sid: "PRD",
          additional_sids: ["ASCS"],
          provider: "azure",
          type: "hana_scale_up",
          selected_checks: ["check_2"],
          health: "passing",
          resources_number: 10,
          hosts_number: 2,
          cib_last_written: "2024-01-15T10:30:00Z",
          details: %{
            system_replication_mode: "sync",
            system_replication_operation_mode: "logreplay",
            secondary_sync_state: "SOK",
            nodes: []
          },
          tags: [
            %{
              value: "production",
              resource_id: "123e4567-e89b-12d3-a456-426614174000",
              resource_type: "cluster"
            }
          ],
          inserted_at: "2024-01-15T09:00:00Z",
          updated_at: "2024-01-15T10:30:00Z"
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
        description:
          "A list containing all Pacemaker Clusters discovered on the target infrastructure, supporting monitoring and management.",
        type: :array,
        items: PacemakerCluster,
        example: [
          %{
            id: "123e4567-e89b-12d3-a456-426614174000",
            name: "hana_cluster",
            sid: "PRD",
            additional_sids: ["ERS", "ASCS"],
            provider: "azure",
            type: "hana_scale_up",
            selected_checks: ["check_1", "check_2"],
            health: "passing",
            resources_number: 10,
            hosts_number: 2,
            cib_last_written: "2024-01-15T10:30:00Z",
            inserted_at: "2024-01-15T09:00:00Z",
            updated_at: "2024-01-15T10:30:00Z"
          }
        ]
      },
      struct?: false
    )
  end
end
