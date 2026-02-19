defmodule TrentoWeb.OpenApi.V2.Schema.Cluster do
  @moduledoc false

  require OpenApiSpex
  require Trento.Clusters.Enums.ClusterType, as: ClusterType
  require Trento.Clusters.Enums.ClusterState, as: ClusterState
  require Trento.Clusters.Enums.AscsErsClusterRole, as: AscsErsClusterRole
  require Trento.Clusters.Enums.HanaArchitectureType, as: HanaArchitectureType
  require Trento.Clusters.Enums.HanaScenario, as: HanaScenario

  alias OpenApiSpex.Schema

  alias TrentoWeb.OpenApi.V1.Schema.{Cluster, Provider, ResourceHealth, Tags}

  defmodule ClusterResource do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "ClusterResourceV2",
        description:
          "A comprehensive object representing a cluster resource, including identification, type, role, status, and parent information for infrastructure management.",
        type: :object,
        additionalProperties: false,
        properties: %{
          id: %Schema{type: :string, example: "ocf:heartbeat:IPaddr2"},
          type: %Schema{type: :string, example: "ocf"},
          role: %Schema{type: :string, example: "Started"},
          status: %Schema{type: :string, example: "running"},
          fail_count: %Schema{type: :integer, example: 0},
          managed: %Schema{type: :boolean, example: true},
          node: %Schema{type: :string, nullable: true, example: "node-01"},
          parent: %Schema{
            type: :object,
            additionalProperties: false,
            nullable: true,
            properties: %{
              id: %Schema{type: :string, example: "cluster-ip-group"},
              managed: %Schema{
                type: :boolean,
                description:
                  "Indicates whether the resource is managed by the cluster infrastructure, supporting automated management and monitoring.",
                example: true
              },
              multi_state: %Schema{
                type: :boolean,
                nullable: true,
                description: """
                Represents the type of the group.
                - true: promotable group
                - false: cloned group
                - null: standard group
                """,
                example: false
              }
            }
          }
        },
        example: %{
          id: "ocf:heartbeat:IPaddr2",
          role: "Started",
          type: "ocf",
          status: "running",
          fail_count: 0,
          managed: true,
          node: "node-01",
          parent: %{
            id: "cluster-ip-group",
            managed: true,
            multi_state: false
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
        title: "HanaClusterNodeV2",
        description:
          "A comprehensive object representing a HANA cluster node, including name, site, roles, status, attributes, and resources for infrastructure monitoring and management.",
        type: :object,
        additionalProperties: false,
        properties: %{
          name: %Schema{type: :string, example: "hana01"},
          site: %Schema{type: :string, example: "NUREMBERG"},
          indexserver_actual_role: %Schema{type: :string, nullable: true, example: "master"},
          nameserver_actual_role: %Schema{type: :string, nullable: true, example: "master"},
          hana_status: %Schema{type: :string, deprecated: true, example: "Primary"},
          status: %Schema{type: :string, example: "online"},
          attributes: %Schema{
            type: :object,
            description:
              "A set of attributes describing the configuration and state of the HANA cluster node, supporting monitoring and management.",
            additionalProperties: %Schema{type: :string}
          },
          virtual_ip: %Schema{type: :string, example: "192.168.1.10"},
          resources: %Schema{
            description:
              "A list of cluster resources associated with this HANA cluster node, supporting infrastructure management.",
            type: :array,
            items: ClusterResource,
            deprecated: true,
            example: [
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
        example: %{
          name: "hana01",
          site: "NUREMBERG",
          indexserver_actual_role: "master",
          nameserver_actual_role: "master",
          hana_status: "Primary",
          status: "online",
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

  defmodule HanaClusterSite do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "HanaClusterSiteV2",
        description:
          "A comprehensive object representing a HANA cluster site, including name, state, and system replication health state for infrastructure monitoring and management.",
        type: :object,
        additionalProperties: false,
        properties: %{
          name: %Schema{
            type: :string,
            description:
              "The name of the HANA cluster site, supporting identification and management.",
            example: "NUREMBERG"
          },
          state: %Schema{
            type: :string,
            description:
              "The operational state of the HANA cluster site, supporting monitoring and alerting.",
            example: "Primary"
          },
          sr_health_state: %Schema{
            type: :string,
            description:
              "The system replication health state of the HANA cluster site, supporting infrastructure health tracking.",
            example: "4"
          }
        },
        example: %{
          name: "NUREMBERG",
          state: "Primary",
          sr_health_state: "4"
        }
      },
      struct?: false
    )
  end

  defmodule HanaClusterDetails do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "HanaClusterDetailsV2",
        description:
          "A comprehensive object representing the details of a HANA Pacemaker cluster, including architecture, scenario, replication, health, nodes, sites, devices, and resources for infrastructure monitoring and management.",
        type: :object,
        additionalProperties: false,
        properties: %{
          architecture_type: %Schema{
            type: :string,
            description:
              "The architecture type of the HANA cluster, supporting infrastructure classification and management.",
            enum: HanaArchitectureType.values()
          },
          hana_scenario: %Schema{
            type: :string,
            description:
              "The scenario type of the HANA cluster, supporting infrastructure classification and management.",
            enum: HanaScenario.values()
          },
          system_replication_mode: %Schema{
            type: :string,
            description:
              "The system replication mode of the HANA cluster, supporting data protection and availability.",
            example: "sync"
          },
          system_replication_operation_mode: %Schema{
            type: :string,
            description:
              "The system replication operation mode of the HANA cluster, supporting data protection and availability.",
            example: "logreplay"
          },
          secondary_sync_state: %Schema{
            type: :string,
            description:
              "The secondary sync state of the HANA cluster, supporting data protection and availability.",
            example: "SOK"
          },
          sr_health_state: %Schema{
            type: :string,
            description:
              "The system replication health state of the HANA cluster, supporting infrastructure health tracking.",
            deprecated: true,
            example: "4"
          },
          fencing_type: %Schema{
            type: :string,
            description:
              "The fencing type used in the HANA cluster, supporting infrastructure protection and management.",
            example: "external/sbd"
          },
          maintenance_mode: %Schema{
            type: :boolean,
            description:
              "Indicates whether maintenance mode is enabled for the HANA cluster, supporting infrastructure management and troubleshooting.",
            example: false
          },
          stopped_resources: %Schema{
            description:
              "A list of the stopped resources on this HANA cluster, supporting infrastructure monitoring and management.",
            type: :array,
            items: ClusterResource,
            deprecated: true,
            example: []
          },
          nodes: %Schema{
            type: :array,
            items: HanaClusterNode,
            example: [
              %{
                name: "hana01",
                site: "NUREMBERG",
                hana_status: "Primary"
              }
            ]
          },
          sites: %Schema{
            description:
              "A list of HANA cluster sites, supporting infrastructure monitoring and management.",
            type: :array,
            items: HanaClusterSite,
            example: [
              %{
                name: "NUREMBERG",
                state: "Primary",
                sr_health_state: "4"
              }
            ]
          },
          sbd_devices: %Schema{
            type: :array,
            items: Cluster.SbdDevice,
            example: [
              %{
                device: "/dev/disk/by-id/scsi-SLIO-ORG_disk_01",
                status: "healthy"
              }
            ]
          },
          resources: %Schema{
            description:
              "A list of cluster resources associated with this HANA cluster, supporting infrastructure management.",
            type: :array,
            items: ClusterResource,
            example: [
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
        required: [:nodes],
        example: %{
          architecture_type: "classic",
          hana_scenario: "performance_optimized",
          system_replication_mode: "sync",
          system_replication_operation_mode: "logreplay",
          secondary_sync_state: "SOK",
          sr_health_state: "4",
          fencing_type: "external/sbd",
          maintenance_mode: false,
          stopped_resources: [],
          nodes: [
            %{
              name: "hana01",
              site: "NUREMBERG",
              hana_status: "Primary",
              attributes: %{
                "hana_prd_op_mode" => "logreplay"
              }
            }
          ],
          sites: [
            %{
              name: "NUREMBERG",
              state: "Primary",
              sr_health_state: "4"
            }
          ],
          sbd_devices: [
            %{
              device: "/dev/disk/by-id/scsi-SLIO-ORG_disk_01",
              status: "healthy"
            }
          ],
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

  defmodule AscsErsClusterNode do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "AscsErsClusterNodeV2",
        description:
          "A comprehensive object representing an ASCS/ERS cluster node, including name, status, attributes, filesystems, roles, virtual IPs, and resources for infrastructure monitoring and management.",
        type: :object,
        additionalProperties: false,
        properties: %{
          attributes: %Schema{
            type: :object,
            description:
              "A set of attributes describing the configuration and state of the ASCS/ERS cluster node, supporting monitoring and management.",
            additionalProperties: %Schema{type: :string}
          },
          filesystems: %Schema{
            type: :array,
            items: %Schema{type: :string},
            description:
              "A list of filesystems managed in this ASCS/ERS cluster node, supporting infrastructure management.",
            example: ["/sapmnt/HA1", "/usr/sap/HA1/ASCS00"]
          },
          name: %Schema{
            type: :string,
            description:
              "The name of the ASCS/ERS cluster node, supporting identification and management.",
            example: "node01"
          },
          status: %Schema{
            type: :string,
            description:
              "The operational status of the ASCS/ERS cluster node, supporting monitoring and alerting.",
            example: "online"
          },
          resources: %Schema{
            type: :array,
            items: ClusterResource,
            description:
              "A list of cluster resources associated with this ASCS/ERS cluster node, supporting infrastructure management.",
            deprecated: true,
            example: [
              %{
                id: "rsc_SAPInstance_HA1_ASCS00",
                type: "ocf::heartbeat:SAPInstance",
                role: "Started",
                status: "Started",
                fail_count: 0
              }
            ]
          },
          roles: %Schema{
            type: :array,
            items: %Schema{type: :string, enum: AscsErsClusterRole.values()},
            description:
              "A list of roles managed in this ASCS/ERS cluster node, supporting infrastructure management.",
            example: ["ascs"]
          },
          virtual_ips: %Schema{
            type: :array,
            items: %Schema{type: :string},
            description:
              "A list of virtual IPs managed in this ASCS/ERS cluster node, supporting infrastructure management.",
            example: ["192.168.1.10"]
          }
        },
        example: %{
          name: "node01",
          status: "online",
          attributes: %{
            "ascs_group" => "grp_HA1_ASCS00"
          },
          filesystems: ["/sapmnt/HA1", "/usr/sap/HA1/ASCS00"],
          roles: ["ascs"],
          virtual_ips: ["192.168.1.10"],
          resources: [
            %{
              id: "rsc_SAPInstance_HA1_ASCS00",
              type: "ocf::heartbeat:SAPInstance",
              role: "Started",
              status: "Started",
              fail_count: 0
            }
          ]
        }
      },
      struct?: false
    )
  end

  defmodule AscsErsClusterSAPSystem do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "AscsErsClusterSAPSystemV2",
        description:
          "A comprehensive object representing an SAP system managed by an ASCS/ERS cluster, including SID, distribution, filesystems, and nodes for infrastructure monitoring and management.",
        type: :object,
        additionalProperties: false,
        required: [:sid],
        properties: %{
          sid: %Schema{
            type: :string,
            description:
              "The SAP system identifier (SID) managed by the ASCS/ERS cluster, supporting system identification.",
            example: "HA1"
          },
          distributed: %Schema{
            type: :boolean,
            description:
              "Indicates whether ASCS and ERS instances are distributed and running in different nodes, supporting infrastructure management.",
            example: false
          },
          filesystem_resource_based: %Schema{
            type: :boolean,
            description:
              "Indicates whether ASCS and ERS filesystems are handled by the cluster with the Filesystem resource agent, supporting infrastructure management.",
            example: true
          },
          nodes: %Schema{
            type: :array,
            items: AscsErsClusterNode,
            description:
              "A list of ASCS/ERS nodes for this SAP system, supporting infrastructure management.",
            example: [
              %{
                name: "node01",
                roles: ["ascs"],
                virtual_ips: ["192.168.1.10"],
                filesystems: ["/sapmnt/HA1", "/usr/sap/HA1/ASCS00"]
              }
            ]
          }
        },
        example: %{
          sid: "HA1",
          distributed: false,
          filesystem_resource_based: true,
          nodes: [
            %{
              name: "node01",
              roles: ["ascs"],
              virtual_ips: ["192.168.1.10"],
              filesystems: ["/sapmnt/HA1", "/usr/sap/HA1/ASCS00"]
            }
          ]
        }
      },
      struct?: false
    )
  end

  defmodule AscsErsClusterDetails do
    @moduledoc false

    OpenApiSpex.schema(
      %{
        title: "AscsErsClusterDetailsV2",
        description:
          "A comprehensive object representing the details of an ASCS/ERS Pacemaker cluster, including fencing, maintenance, managed SAP systems, devices, stopped resources, and resources for infrastructure monitoring and management.",
        type: :object,
        additionalProperties: false,
        properties: %{
          fencing_type: %Schema{
            type: :string,
            description:
              "The fencing type used in the ASCS/ERS cluster, supporting infrastructure protection and management.",
            example: "external/sbd"
          },
          maintenance_mode: %Schema{
            type: :boolean,
            description:
              "Indicates whether maintenance mode is enabled for the ASCS/ERS cluster, supporting infrastructure management and troubleshooting.",
            example: false
          },
          sap_systems: %Schema{
            type: :array,
            items: AscsErsClusterSAPSystem,
            description:
              "A list of managed SAP systems in a single or multi SID ASCS/ERS cluster, supporting infrastructure management.",
            example: [
              %{
                sid: "HA1",
                filesystem_resource_based: true,
                distributed: false,
                nodes: [
                  %{
                    name: "node01",
                    roles: ["ascs"],
                    virtual_ips: ["192.168.1.10"],
                    filesystems: ["/sapmnt/HA1", "/usr/sap/HA1/ASCS00"]
                  }
                ]
              }
            ]
          },
          sbd_devices: %Schema{
            type: :array,
            items: Cluster.SbdDevice,
            description:
              "A list of SBD devices used in the ASCS/ERS cluster, supporting infrastructure management.",
            example: [
              %{
                device: "/dev/disk/by-id/scsi-SLIO-ORG_disk_01",
                status: "healthy"
              }
            ]
          },
          stopped_resources: %Schema{
            type: :array,
            items: ClusterResource,
            description:
              "A list of the stopped resources on this ASCS/ERS cluster, supporting infrastructure monitoring and management.",
            deprecated: true,
            example: []
          },
          resources: %Schema{
            description:
              "A list of cluster resources associated with this ASCS/ERS cluster, supporting infrastructure management.",
            type: :array,
            items: ClusterResource,
            example: [
              %{
                id: "rsc_SAPInstance_HA1_ASCS00",
                type: "ocf::heartbeat:SAPInstance",
                role: "Started",
                status: "Started",
                fail_count: 0
              }
            ]
          }
        },
        required: [:sap_systems],
        example: %{
          fencing_type: "external/sbd",
          maintenance_mode: false,
          sap_systems: [
            %{
              sid: "HA1",
              filesystem_resource_based: true,
              distributed: false,
              nodes: [
                %{
                  name: "node01",
                  roles: ["ascs"],
                  virtual_ips: ["192.168.1.10"],
                  filesystems: ["/sapmnt/HA1", "/usr/sap/HA1/ASCS00"]
                }
              ]
            }
          ],
          sbd_devices: [
            %{
              device: "/dev/disk/by-id/scsi-SLIO-ORG_disk_01",
              status: "healthy"
            }
          ],
          stopped_resources: [],
          resources: [
            %{
              id: "rsc_SAPInstance_HA1_ASCS00",
              type: "ocf::heartbeat:SAPInstance",
              role: "Started",
              status: "Started",
              fail_count: 0
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
        title: "PacemakerClusterDetailsV2",
        description:
          "A comprehensive object representing the details of the detected Pacemaker cluster, including ASCS/ERS and HANA cluster details for infrastructure monitoring and management.",
        type: :object,
        nullable: true,
        oneOf: [
          AscsErsClusterDetails,
          HanaClusterDetails
        ],
        example: %{
          system_replication_mode: "sync",
          system_replication_operation_mode: "logreplay",
          secondary_sync_state: "SOK",
          nodes: [
            %{
              name: "hana01",
              site: "NUREMBERG",
              hana_status: "Primary"
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
        title: "PacemakerClusterV2",
        description:
          "A comprehensive object representing a discovered Pacemaker cluster on the target infrastructure, including identification, type, provider, health, resources, hosts, details, and tags for infrastructure monitoring and management.",
        type: :object,
        additionalProperties: false,
        properties: %{
          id: %Schema{
            type: :string,
            description: "Cluster ID.",
            format: :uuid,
            example: "123e4567-e89b-12d3-a456-426614174000"
          },
          name: %Schema{
            type: :string,
            description:
              "The name of the Pacemaker cluster, supporting identification and management.",
            example: "hana_cluster"
          },
          sid: %Schema{
            type: :string,
            description:
              "The SAP system identifier (SID) for the Pacemaker cluster. Deprecated: use sap_instances instead.",
            deprecated: true,
            example: "PRD"
          },
          additional_sids: %Schema{
            type: :array,
            items: %Schema{type: :string},
            description:
              "A list of additionally discovered SIDs, such as ASCS/ERS cluster SIDs. Deprecated: use sap_instances instead.",
            deprecated: true,
            example: ["ASCS"]
          },
          sap_instances: %Schema{
            description:
              "A list of SAP instances in the Pacemaker cluster, including their SID and additional information for infrastructure management.",
            type: :array,
            items: %Schema{
              type: :object,
              properties: %{
                sid: %Schema{
                  type: :string,
                  description:
                    "The SAP instance identifier (SID) in the Pacemaker cluster, supporting system identification.",
                  example: "PRD"
                },
                instance_number: %Schema{
                  type: :string,
                  description:
                    "The SAP instance number in the Pacemaker cluster, supporting system identification.",
                  example: "00"
                }
              },
              additionalProperties: false,
              required: [:sid, :instance_number]
            },
            example: [
              %{
                sid: "PRD",
                instance_number: "00"
              }
            ]
          },
          provider: Provider.SupportedProviders,
          type: %Schema{
            type: :string,
            description:
              "The detected type of the Pacemaker cluster, supporting infrastructure classification and management.",
            enum: ClusterType.values()
          },
          selected_checks: %Schema{
            description:
              "A list of check IDs selected for an execution on this Pacemaker cluster, supporting monitoring and management.",
            type: :array,
            items: %Schema{type: :string},
            example: ["check_2"]
          },
          health: ResourceHealth,
          resources_number: %Schema{
            type: :integer,
            description:
              "The number of resources in the Pacemaker cluster, supporting infrastructure monitoring and management.",
            nullable: true,
            example: 10
          },
          hosts_number: %Schema{
            type: :integer,
            description:
              "The number of hosts in the Pacemaker cluster, supporting infrastructure monitoring and management.",
            nullable: true,
            example: 2
          },
          cib_last_written: %Schema{
            type: :string,
            description:
              "The date and time when the CIB was last written for the Pacemaker cluster, supporting audit and monitoring.",
            nullable: true,
            example: "2024-01-15T10:30:00Z"
          },
          state: %Schema{
            type: :string,
            description:
              "The current state of the Pacemaker cluster. " <>
                "Find additional information here: https://github.com/ClusterLabs/pacemaker/blob/9f014f6e85ca2757da570542c16df089d9d09c3c/daemons/controld/controld_fsa.h#L23. " <>
                "Value is set to 'stopped' when all hosts in the cluster go offline and 'unknown' if the value could not be obtained.",
            nullable: true,
            enum: ClusterState.values(),
            example: "S_IDLE"
          },
          details: Details,
          tags: Tags,
          inserted_at: %Schema{
            type: :string,
            format: :datetime,
            example: "2024-01-15T09:00:00Z"
          },
          updated_at: %Schema{
            type: :string,
            format: :datetime,
            nullable: true,
            example: "2024-01-15T10:30:00Z"
          }
        },
        example: %{
          id: "123e4567-e89b-12d3-a456-426614174000",
          name: "hana_cluster",
          sid: "PRD",
          additional_sids: ["ASCS"],
          sap_instances: [
            %{
              sid: "PRD",
              instance_number: "00"
            }
          ],
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
          state: "S_IDLE",
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
        title: "PacemakerClustersCollectionV2",
        description:
          "A comprehensive array representing a list of discovered Pacemaker clusters, each including identification, type, provider, health, resources, hosts, details, and tags for infrastructure monitoring and management.",
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
            state: "S_IDLE",
            inserted_at: "2024-01-15T09:00:00Z",
            updated_at: "2024-01-15T10:30:00Z"
          }
        ]
      },
      struct?: false
    )
  end
end
