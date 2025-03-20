defmodule Trento.Discovery.Policies.ClusterPolicyTest do
  use ExUnit.Case
  use Trento.DataCase

  import Trento.DiscoveryFixturesHelper

  import Trento.Factory

  require Trento.Enums.Provider, as: Provider

  require Trento.Clusters.Enums.HanaArchitectureType, as: HanaArchitectureType
  require Trento.Clusters.Enums.HanaScenario, as: HanaScenario
  require Trento.Clusters.Enums.SapInstanceResourceType, as: SapInstanceResourceType

  alias Trento.Discovery.Policies.ClusterPolicy

  alias Trento.Clusters.Commands.{DeregisterClusterHost, RegisterClusterHost}

  alias Trento.Clusters.ValueObjects.{
    AscsErsClusterDetails,
    AscsErsClusterNode,
    AscsErsClusterSapSystem,
    ClusterResource,
    ClusterResourceParent,
    HanaClusterDetails,
    HanaClusterNode,
    HanaClusterSite,
    SapInstance,
    SbdDevice
  }

  test "should return the expected commands when a ha_cluster_discovery payload of type hana_scale_up is handled" do
    assert {:ok,
            [
              %RegisterClusterHost{
                cib_last_written: "Fri Oct 18 11:48:22 2019",
                cluster_id: "34a94290-2236-5e4d-8def-05beb32d14d4",
                designated_controller: true,
                details: %HanaClusterDetails{
                  fencing_type: "external/sbd",
                  maintenance_mode: false,
                  nodes: [
                    %HanaClusterNode{
                      attributes: %{
                        "hana_prd_clone_state" => "PROMOTED",
                        "hana_prd_op_mode" => "logreplay",
                        "hana_prd_remoteHost" => "node02",
                        "hana_prd_roles" => "4:P:master1:master:worker:master",
                        "hana_prd_site" => "PRIMARY_SITE_NAME",
                        "hana_prd_srmode" => "sync",
                        "hana_prd_sync_state" => "PRIM",
                        "hana_prd_version" => "2.00.040.00.1553674765",
                        "hana_prd_vhost" => "node01",
                        "lpa_prd_lpt" => "1571392102",
                        "master-rsc_SAPHana_PRD_HDB00" => "150"
                      },
                      hana_status: "Primary",
                      status: "Online",
                      name: "node01",
                      indexserver_actual_role: "master",
                      nameserver_actual_role: "master",
                      resources: [
                        %ClusterResource{
                          fail_count: 0,
                          id: "stonith-sbd",
                          role: "Started",
                          status: "Active",
                          type: "stonith:external/sbd",
                          managed: true,
                          parent: nil
                        },
                        %ClusterResource{
                          fail_count: 2,
                          id: "rsc_ip_PRD_HDB00",
                          role: "Started",
                          status: "Active",
                          type: "ocf::heartbeat:IPaddr2",
                          managed: true,
                          parent: nil
                        },
                        %ClusterResource{
                          fail_count: 1_000_000,
                          id: "rsc_SAPHana_PRD_HDB00",
                          role: "Master",
                          status: "Active",
                          type: "ocf::suse:SAPHana",
                          managed: true,
                          parent: %ClusterResourceParent{
                            id: "msl_SAPHana_PRD_HDB00",
                            managed: true,
                            multi_state: true
                          }
                        },
                        %ClusterResource{
                          fail_count: 0,
                          id: "rsc_SAPHanaTopology_PRD_HDB00",
                          role: "Started",
                          status: "Active",
                          type: "ocf::suse:SAPHanaTopology",
                          managed: true,
                          parent: %ClusterResourceParent{
                            id: "cln_SAPHanaTopology_PRD_HDB00",
                            managed: true,
                            multi_state: false
                          }
                        },
                        %ClusterResource{
                          fail_count: nil,
                          id: "clusterfs",
                          role: "Started",
                          status: "Active",
                          type: "ocf::heartbeat:Filesystem",
                          managed: true,
                          parent: %ClusterResourceParent{
                            id: "c-clusterfs",
                            managed: true,
                            multi_state: false
                          }
                        }
                      ],
                      site: "PRIMARY_SITE_NAME",
                      virtual_ip: "192.168.123.200"
                    },
                    %HanaClusterNode{
                      attributes: %{
                        "hana_prd_clone_state" => "DEMOTED",
                        "hana_prd_op_mode" => "logreplay",
                        "hana_prd_remoteHost" => "node01",
                        "hana_prd_roles" => "4:S:master1:master:worker:master",
                        "hana_prd_site" => "SECONDARY_SITE_NAME",
                        "hana_prd_srmode" => "sync",
                        "hana_prd_sync_state" => "SOK",
                        "hana_prd_version" => "2.00.040.00.1553674765",
                        "hana_prd_vhost" => "node02",
                        "lpa_prd_lpt" => "30",
                        "master-rsc_SAPHana_PRD_HDB00" => "100"
                      },
                      hana_status: "Secondary",
                      status: "Online",
                      name: "node02",
                      indexserver_actual_role: "master",
                      nameserver_actual_role: "master",
                      resources: [
                        %ClusterResource{
                          fail_count: 0,
                          id: "test",
                          role: "Started",
                          status: "Active",
                          type: "ocf::heartbeat:Dummy",
                          managed: true,
                          parent: nil
                        },
                        %ClusterResource{
                          fail_count: 300,
                          id: "rsc_SAPHana_PRD_HDB00",
                          role: "Slave",
                          status: "Active",
                          type: "ocf::suse:SAPHana",
                          managed: true,
                          parent: %ClusterResourceParent{
                            id: "msl_SAPHana_PRD_HDB00",
                            managed: true,
                            multi_state: true
                          }
                        },
                        %ClusterResource{
                          fail_count: 0,
                          id: "rsc_SAPHanaTopology_PRD_HDB00",
                          role: "Started",
                          status: "Active",
                          type: "ocf::suse:SAPHanaTopology",
                          managed: true,
                          parent: %ClusterResourceParent{
                            id: "cln_SAPHanaTopology_PRD_HDB00",
                            managed: true,
                            multi_state: false
                          }
                        },
                        %ClusterResource{
                          fail_count: nil,
                          id: "clusterfs",
                          role: "Started",
                          status: "Active",
                          type: "ocf::heartbeat:Filesystem",
                          managed: true,
                          parent: %ClusterResourceParent{
                            id: "c-clusterfs",
                            managed: true,
                            multi_state: false
                          }
                        }
                      ],
                      site: "SECONDARY_SITE_NAME",
                      virtual_ip: nil
                    }
                  ],
                  sites: [
                    %HanaClusterSite{
                      name: "PRIMARY_SITE_NAME",
                      state: "Primary",
                      sr_health_state: "4"
                    },
                    %HanaClusterSite{
                      name: "SECONDARY_SITE_NAME",
                      state: "Secondary",
                      sr_health_state: "4"
                    }
                  ],
                  sbd_devices: [
                    %SbdDevice{
                      device: "/dev/vdc",
                      status: "healthy"
                    },
                    %SbdDevice{
                      device: "/dev/vdb",
                      status: "healthy"
                    }
                  ],
                  secondary_sync_state: "SOK",
                  sr_health_state: "4",
                  stopped_resources: [
                    %ClusterResource{
                      fail_count: nil,
                      id: "test-stop",
                      role: "Stopped",
                      status: nil,
                      type: "ocf::heartbeat:Dummy",
                      parent: nil
                    },
                    %ClusterResource{
                      fail_count: nil,
                      id: "clusterfs",
                      role: "Stopped",
                      status: nil,
                      type: "ocf::heartbeat:Filesystem",
                      parent: nil
                    },
                    %ClusterResource{
                      fail_count: nil,
                      id: "clusterfs",
                      role: "Stopped",
                      status: nil,
                      type: "ocf::heartbeat:Filesystem",
                      parent: nil
                    }
                  ],
                  system_replication_mode: "sync",
                  system_replication_operation_mode: "logreplay",
                  architecture_type: HanaArchitectureType.classic(),
                  hana_scenario: HanaScenario.performance_optimized()
                },
                host_id: "779cdd70-e9e2-58ca-b18a-bf3eb3f71244",
                name: "hana_cluster",
                sap_instances: [
                  %SapInstance{
                    name: "HDB00",
                    sid: "PRD",
                    instance_number: "00",
                    hostname: nil,
                    resource_type: SapInstanceResourceType.sap_hana_topology()
                  }
                ],
                type: :hana_scale_up,
                hosts_number: 2,
                resources_number: 8,
                discovered_health: :passing,
                provider: Provider.azure()
              }
            ]} ==
             "ha_cluster_discovery_hana_scale_up"
             |> load_discovery_event_fixture()
             |> ClusterPolicy.handle(nil)
  end

  test "should return the expected commands when a ha_cluster_discovery payload of type hana_scale_up with maintenance mode is handled" do
    assert {:ok,
            [
              %RegisterClusterHost{
                cib_last_written: "Fri Oct 18 11:48:22 2019",
                cluster_id: "34a94290-2236-5e4d-8def-05beb32d14d4",
                designated_controller: true,
                details: %HanaClusterDetails{
                  fencing_type: "external/sbd",
                  maintenance_mode: true,
                  nodes: [
                    %HanaClusterNode{
                      attributes: %{
                        "hana_prd_clone_state" => "PROMOTED",
                        "hana_prd_op_mode" => "logreplay",
                        "hana_prd_remoteHost" => "node02",
                        "hana_prd_roles" => "4:P:master1:master:worker:master",
                        "hana_prd_site" => "PRIMARY_SITE_NAME",
                        "hana_prd_srmode" => "sync",
                        "hana_prd_sync_state" => "PRIM",
                        "hana_prd_version" => "2.00.040.00.1553674765",
                        "hana_prd_vhost" => "node01",
                        "lpa_prd_lpt" => "1571392102",
                        "master-rsc_SAPHana_PRD_HDB00" => "150"
                      },
                      hana_status: "Primary",
                      status: "Online",
                      name: "node01",
                      nameserver_actual_role: "master",
                      indexserver_actual_role: "master",
                      resources: [
                        %ClusterResource{
                          fail_count: 0,
                          id: "stonith-sbd",
                          role: "Started",
                          status: "Active",
                          type: "stonith:external/sbd",
                          managed: true,
                          parent: nil
                        },
                        %ClusterResource{
                          fail_count: 2,
                          id: "rsc_ip_PRD_HDB00",
                          role: "Started",
                          status: "Active",
                          type: "ocf::heartbeat:IPaddr2",
                          managed: true,
                          parent: nil
                        },
                        %ClusterResource{
                          fail_count: 1_000_000,
                          id: "rsc_SAPHana_PRD_HDB00",
                          role: "Master",
                          status: "Active",
                          type: "ocf::suse:SAPHana",
                          managed: true,
                          parent: %ClusterResourceParent{
                            id: "msl_SAPHana_PRD_HDB00",
                            managed: true,
                            multi_state: true
                          }
                        },
                        %ClusterResource{
                          fail_count: 0,
                          id: "rsc_SAPHanaTopology_PRD_HDB00",
                          role: "Started",
                          status: "Active",
                          type: "ocf::suse:SAPHanaTopology",
                          managed: true,
                          parent: %ClusterResourceParent{
                            id: "cln_SAPHanaTopology_PRD_HDB00",
                            managed: true,
                            multi_state: false
                          }
                        },
                        %ClusterResource{
                          fail_count: nil,
                          id: "clusterfs",
                          role: "Started",
                          status: "Active",
                          type: "ocf::heartbeat:Filesystem",
                          managed: true,
                          parent: %ClusterResourceParent{
                            id: "c-clusterfs",
                            managed: true,
                            multi_state: false
                          }
                        }
                      ],
                      site: "PRIMARY_SITE_NAME",
                      virtual_ip: "192.168.123.200"
                    },
                    %HanaClusterNode{
                      attributes: %{
                        "hana_prd_clone_state" => "DEMOTED",
                        "hana_prd_op_mode" => "logreplay",
                        "hana_prd_remoteHost" => "node01",
                        "hana_prd_roles" => "4:S:master1:master:worker:master",
                        "hana_prd_site" => "SECONDARY_SITE_NAME",
                        "hana_prd_srmode" => "sync",
                        "hana_prd_sync_state" => "SOK",
                        "hana_prd_version" => "2.00.040.00.1553674765",
                        "hana_prd_vhost" => "node02",
                        "lpa_prd_lpt" => "30",
                        "master-rsc_SAPHana_PRD_HDB00" => "100"
                      },
                      hana_status: "Secondary",
                      status: "Online",
                      name: "node02",
                      indexserver_actual_role: "master",
                      nameserver_actual_role: "master",
                      resources: [
                        %ClusterResource{
                          fail_count: 0,
                          id: "test",
                          role: "Started",
                          status: "Active",
                          type: "ocf::heartbeat:Dummy",
                          managed: true,
                          parent: nil
                        },
                        %ClusterResource{
                          fail_count: 300,
                          id: "rsc_SAPHana_PRD_HDB00",
                          role: "Slave",
                          status: "Active",
                          type: "ocf::suse:SAPHana",
                          managed: true,
                          parent: %ClusterResourceParent{
                            id: "msl_SAPHana_PRD_HDB00",
                            managed: true,
                            multi_state: true
                          }
                        },
                        %ClusterResource{
                          fail_count: 0,
                          id: "rsc_SAPHanaTopology_PRD_HDB00",
                          role: "Started",
                          status: "Active",
                          type: "ocf::suse:SAPHanaTopology",
                          managed: true,
                          parent: %ClusterResourceParent{
                            id: "cln_SAPHanaTopology_PRD_HDB00",
                            managed: true,
                            multi_state: false
                          }
                        },
                        %ClusterResource{
                          fail_count: nil,
                          id: "clusterfs",
                          role: "Started",
                          status: "Active",
                          type: "ocf::heartbeat:Filesystem",
                          managed: true,
                          parent: %ClusterResourceParent{
                            id: "c-clusterfs",
                            managed: true,
                            multi_state: false
                          }
                        }
                      ],
                      site: "SECONDARY_SITE_NAME",
                      virtual_ip: nil
                    }
                  ],
                  sites: [
                    %HanaClusterSite{
                      name: "PRIMARY_SITE_NAME",
                      state: "Primary",
                      sr_health_state: "4"
                    },
                    %HanaClusterSite{
                      name: "SECONDARY_SITE_NAME",
                      state: "Secondary",
                      sr_health_state: "4"
                    }
                  ],
                  sbd_devices: [
                    %SbdDevice{
                      device: "/dev/vdc",
                      status: "healthy"
                    },
                    %SbdDevice{
                      device: "/dev/vdb",
                      status: "healthy"
                    }
                  ],
                  secondary_sync_state: "SOK",
                  sr_health_state: "4",
                  stopped_resources: [
                    %ClusterResource{
                      fail_count: nil,
                      id: "test-stop",
                      role: "Stopped",
                      status: nil,
                      type: "ocf::heartbeat:Dummy",
                      managed: nil,
                      parent: nil
                    },
                    %ClusterResource{
                      fail_count: nil,
                      id: "clusterfs",
                      role: "Stopped",
                      status: nil,
                      type: "ocf::heartbeat:Filesystem",
                      managed: nil,
                      parent: nil
                    },
                    %ClusterResource{
                      fail_count: nil,
                      id: "clusterfs",
                      role: "Stopped",
                      status: nil,
                      type: "ocf::heartbeat:Filesystem",
                      managed: nil,
                      parent: nil
                    }
                  ],
                  system_replication_mode: "sync",
                  system_replication_operation_mode: "logreplay",
                  architecture_type: HanaArchitectureType.classic(),
                  hana_scenario: HanaScenario.performance_optimized()
                },
                host_id: "779cdd70-e9e2-58ca-b18a-bf3eb3f71244",
                name: "hana_cluster",
                sap_instances: [
                  %SapInstance{
                    name: "HDB00",
                    sid: "PRD",
                    instance_number: "00",
                    hostname: nil,
                    resource_type: SapInstanceResourceType.sap_hana_topology()
                  }
                ],
                type: :hana_scale_up,
                hosts_number: 2,
                resources_number: 8,
                discovered_health: :passing,
                provider: Provider.azure()
              }
            ]} ==
             "ha_cluster_discovery_hana_scale_up_maintenance"
             |> load_discovery_event_fixture()
             |> ClusterPolicy.handle(nil)
  end

  test "should return the expected commands when a ha_cluster_discovery payload of type hana_scale_up with cost optimized scenario is handled" do
    assert {:ok,
            [
              %RegisterClusterHost{
                cib_last_written: "Mon Aug 26 14:52:19 2024",
                cluster_id: "ee7ea205-d5cc-5bbd-a345-10cad2aae2d7",
                designated_controller: true,
                details: %HanaClusterDetails{
                  fencing_type: "external/sbd",
                  maintenance_mode: false,
                  hana_scenario: HanaScenario.cost_optimized(),
                  nodes: [
                    %HanaClusterNode{
                      attributes: %{
                        "hana_hdq_clone_state" => "PROMOTED",
                        "hana_hdq_op_mode" => "logreplay",
                        "hana_hdq_remoteHost" => "node02",
                        "hana_hdq_roles" => "4:P:master1:master:worker:master",
                        "hana_hdq_site" => "PRIMARY_SITE_NAME",
                        "hana_hdq_sra" => "-",
                        "hana_hdq_srah" => "-",
                        "hana_hdq_srmode" => "sync",
                        "hana_hdq_sync_state" => "PRIM",
                        "hana_hdq_version" => "2.00.057.00",
                        "hana_hdq_vhost" => "node01",
                        "lpa_hdq_lpt" => "1724683939",
                        "maintenance" => "off",
                        "master-rsc_SAPHana_HDQ_HDB10" => "150"
                      },
                      hana_status: "Primary",
                      status: "Online",
                      name: "node01",
                      nameserver_actual_role: "master",
                      indexserver_actual_role: "master",
                      resources: [
                        %ClusterResource{
                          fail_count: 0,
                          id: "stonith-sbd",
                          role: "Started",
                          status: "Active",
                          type: "stonith:external/sbd",
                          managed: true,
                          parent: nil
                        },
                        %ClusterResource{
                          fail_count: 0,
                          id: "rsc_SAPHana_HDQ_HDB10",
                          managed: true,
                          parent: %ClusterResourceParent{
                            id: "msl_SAPHana_HDQ_HDB10",
                            managed: true,
                            multi_state: true
                          },
                          role: "Master",
                          status: "Active",
                          type: "ocf::suse:SAPHana"
                        },
                        %ClusterResource{
                          fail_count: 0,
                          id: "rsc_SAPHanaTopology_HDQ_HDB10",
                          managed: true,
                          parent: %ClusterResourceParent{
                            id: "cln_SAPHanaTopology_HDQ_HDB10",
                            managed: true,
                            multi_state: false
                          },
                          role: "Started",
                          status: "Active",
                          type: "ocf::suse:SAPHanaTopology"
                        },
                        %ClusterResource{
                          fail_count: 0,
                          id: "rsc_ip_HDQ_HDB10",
                          managed: true,
                          parent: %ClusterResourceParent{
                            id: "g_ip_HDQ_HDB10",
                            managed: nil,
                            multi_state: nil
                          },
                          role: "Started",
                          status: "Active",
                          type: "ocf::heartbeat:IPaddr2"
                        },
                        %ClusterResource{
                          fail_count: 0,
                          id: "rsc_socat_HDQ_HDB10",
                          managed: true,
                          parent: %ClusterResourceParent{
                            id: "g_ip_HDQ_HDB10",
                            managed: nil,
                            multi_state: nil
                          },
                          role: "Started",
                          status: "Active",
                          type: "ocf::heartbeat:azure-lb"
                        }
                      ],
                      site: "PRIMARY_SITE_NAME",
                      virtual_ip: "192.168.100.122"
                    },
                    %HanaClusterNode{
                      attributes: %{
                        "hana_hdq_clone_state" => "DEMOTED",
                        "hana_hdq_op_mode" => "logreplay",
                        "hana_hdq_remoteHost" => "node01",
                        "hana_hdq_roles" => "4:S:master1:master:worker:master",
                        "hana_hdq_site" => "SECONDARY_SITE_NAME",
                        "hana_hdq_srah" => "-",
                        "hana_hdq_srmode" => "sync",
                        "hana_hdq_sync_state" => "SOK",
                        "hana_hdq_version" => "2.00.057.00",
                        "hana_hdq_vhost" => "node02",
                        "lpa_hdq_lpt" => "30",
                        "master-rsc_SAPHana_HDQ_HDB10" => "100"
                      },
                      hana_status: "Secondary",
                      status: "Online",
                      name: "node02",
                      indexserver_actual_role: "master",
                      nameserver_actual_role: "master",
                      resources: [
                        %ClusterResource{
                          fail_count: 0,
                          id: "rsc_SAP_QAS_HDB20",
                          role: "Started",
                          status: "Active",
                          type: "ocf::heartbeat:SAPInstance",
                          managed: true,
                          parent: nil
                        },
                        %ClusterResource{
                          fail_count: 0,
                          id: "rsc_SAPHana_HDQ_HDB10",
                          role: "Slave",
                          status: "Active",
                          type: "ocf::suse:SAPHana",
                          managed: true,
                          parent: %ClusterResourceParent{
                            id: "msl_SAPHana_HDQ_HDB10",
                            managed: true,
                            multi_state: true
                          }
                        },
                        %ClusterResource{
                          fail_count: 0,
                          id: "rsc_SAPHanaTopology_HDQ_HDB10",
                          role: "Started",
                          status: "Active",
                          type: "ocf::suse:SAPHanaTopology",
                          managed: true,
                          parent: %ClusterResourceParent{
                            id: "cln_SAPHanaTopology_HDQ_HDB10",
                            managed: true,
                            multi_state: false
                          }
                        }
                      ],
                      site: "SECONDARY_SITE_NAME",
                      virtual_ip: nil
                    }
                  ],
                  sites: [
                    %HanaClusterSite{
                      name: "PRIMARY_SITE_NAME",
                      state: "Primary",
                      sr_health_state: "4"
                    },
                    %HanaClusterSite{
                      name: "SECONDARY_SITE_NAME",
                      state: "Secondary",
                      sr_health_state: "4"
                    }
                  ],
                  sbd_devices: [
                    %Trento.Clusters.ValueObjects.SbdDevice{device: "/dev/sdj", status: "healthy"}
                  ],
                  secondary_sync_state: "SOK",
                  sr_health_state: "4",
                  stopped_resources: [],
                  system_replication_mode: "sync",
                  system_replication_operation_mode: "logreplay",
                  architecture_type: HanaArchitectureType.classic()
                },
                host_id: "2372b24f-3d7a-5d01-9b1a-a2c4c95c53d4",
                name: "hana_cluster",
                sap_instances: [
                  %SapInstance{
                    name: "HDB10",
                    sid: "HDQ",
                    instance_number: "10",
                    hostname: nil,
                    resource_type: SapInstanceResourceType.sap_hana_topology()
                  },
                  %SapInstance{
                    name: "HDB20",
                    sid: "QAS",
                    instance_number: "20",
                    hostname: "node02",
                    resource_type: SapInstanceResourceType.sap_instance()
                  }
                ],
                type: :hana_scale_up,
                hosts_number: 2,
                resources_number: 8,
                discovered_health: :passing,
                provider: Provider.azure()
              }
            ]} ==
             "ha_cluster_discovery_hana_scale_up_cost_opt"
             |> load_discovery_event_fixture()
             |> ClusterPolicy.handle(nil)
  end

  test "should return the expected commands when a ha_cluster_discovery payload of type ascs_ers is handled" do
    assert {:ok,
            [
              %RegisterClusterHost{
                cib_last_written: "Tue Jan 11 13:43:06 2022",
                cluster_id: "0eac831a-aa66-5f45-89a4-007fbd2c5714",
                designated_controller: false,
                details: %AscsErsClusterDetails{
                  fencing_type: "external/sbd",
                  maintenance_mode: false,
                  sap_systems: [
                    %AscsErsClusterSapSystem{
                      sid: "NWP",
                      filesystem_resource_based: true,
                      distributed: true,
                      nodes: [
                        %AscsErsClusterNode{
                          name: "vmnwprd01",
                          roles: [:ascs],
                          virtual_ips: ["10.80.1.25"],
                          filesystems: ["/usr/sap/NWP/ASCS00"],
                          status: "Online",
                          attributes: %{},
                          resources: [
                            %ClusterResource{
                              id: "rsc_ip_NWP_ASCS00",
                              type: "ocf::heartbeat:IPaddr2",
                              role: "Started",
                              status: "Active",
                              fail_count: 0,
                              managed: true,
                              parent: %ClusterResourceParent{
                                id: "grp_NWP_ASCS00",
                                managed: nil,
                                multi_state: nil
                              }
                            },
                            %ClusterResource{
                              id: "rsc_fs_NWP_ASCS00",
                              type: "ocf::heartbeat:Filesystem",
                              role: "Started",
                              status: "Active",
                              fail_count: 0,
                              managed: true,
                              parent: %ClusterResourceParent{
                                id: "grp_NWP_ASCS00",
                                managed: nil,
                                multi_state: nil
                              }
                            },
                            %ClusterResource{
                              id: "rsc_sap_NWP_ASCS00",
                              type: "ocf::heartbeat:SAPInstance",
                              role: "Started",
                              status: "Active",
                              fail_count: 0,
                              managed: true,
                              parent: %ClusterResourceParent{
                                id: "grp_NWP_ASCS00",
                                managed: nil,
                                multi_state: nil
                              }
                            },
                            %ClusterResource{
                              id: "rsc_socat_NWP_ASCS00",
                              type: "ocf::heartbeat:azure-lb",
                              role: "Started",
                              status: "Active",
                              fail_count: 0,
                              managed: true,
                              parent: %ClusterResourceParent{
                                id: "grp_NWP_ASCS00",
                                managed: nil,
                                multi_state: nil
                              }
                            }
                          ]
                        },
                        %AscsErsClusterNode{
                          name: "vmnwprd02",
                          roles: [:ers],
                          virtual_ips: ["10.80.1.26"],
                          filesystems: ["/usr/sap/NWP/ERS10"],
                          status: "Online",
                          attributes: %{"runs_ers_NWP" => "1"},
                          resources: [
                            %ClusterResource{
                              id: "rsc_ip_NWP_ERS10",
                              type: "ocf::heartbeat:IPaddr2",
                              role: "Started",
                              status: "Active",
                              fail_count: 0,
                              managed: true,
                              parent: %ClusterResourceParent{
                                id: "grp_NWP_ERS10",
                                managed: nil,
                                multi_state: nil
                              }
                            },
                            %ClusterResource{
                              id: "rsc_fs_NWP_ERS10",
                              type: "ocf::heartbeat:Filesystem",
                              role: "Started",
                              status: "Active",
                              fail_count: 0,
                              managed: true,
                              parent: %ClusterResourceParent{
                                id: "grp_NWP_ERS10",
                                managed: nil,
                                multi_state: nil
                              }
                            },
                            %ClusterResource{
                              id: "rsc_sap_NWP_ERS10",
                              type: "ocf::heartbeat:SAPInstance",
                              role: "Started",
                              status: "Active",
                              fail_count: 0,
                              managed: true,
                              parent: %ClusterResourceParent{
                                id: "grp_NWP_ERS10",
                                managed: nil,
                                multi_state: nil
                              }
                            },
                            %ClusterResource{
                              id: "rsc_socat_NWP_ERS10",
                              type: "ocf::heartbeat:azure-lb",
                              role: "Started",
                              status: "Active",
                              fail_count: 0,
                              managed: true,
                              parent: %ClusterResourceParent{
                                id: "grp_NWP_ERS10",
                                managed: nil,
                                multi_state: nil
                              }
                            }
                          ]
                        }
                      ]
                    }
                  ],
                  stopped_resources: [],
                  sbd_devices: [
                    %SbdDevice{
                      device:
                        "/dev/disk/by-id/scsi-SLIO-ORG_IBLOCK_e34218cd-0d9a-4b21-b6d5-a313980baa82",
                      status: "healthy"
                    }
                  ]
                },
                host_id: "4b30a6af-4b52-5bda-bccb-f2248a12c992",
                name: "netweaver_cluster",
                sap_instances: [
                  %SapInstance{
                    name: "ASCS00",
                    sid: "NWP",
                    instance_number: "00",
                    hostname: "sapnwpas",
                    resource_type: SapInstanceResourceType.sap_instance()
                  },
                  %SapInstance{
                    name: "ERS10",
                    sid: "NWP",
                    instance_number: "10",
                    hostname: "sapnwper",
                    resource_type: SapInstanceResourceType.sap_instance()
                  }
                ],
                type: :ascs_ers,
                hosts_number: 2,
                resources_number: 9,
                discovered_health: :passing,
                provider: Provider.azure()
              }
            ]} ==
             "ha_cluster_discovery_ascs_ers"
             |> load_discovery_event_fixture()
             |> ClusterPolicy.handle(nil)
  end

  test "should return the expected commands when a ha_cluster_discovery payload of type ascs_ers with maintenance enabled is handled" do
    assert {:ok,
            [
              %RegisterClusterHost{
                cib_last_written: "Tue Jan 11 13:43:06 2022",
                cluster_id: "0eac831a-aa66-5f45-89a4-007fbd2c5714",
                designated_controller: false,
                details: %AscsErsClusterDetails{
                  fencing_type: "external/sbd",
                  maintenance_mode: true,
                  sap_systems: [
                    %AscsErsClusterSapSystem{
                      sid: "NWP",
                      filesystem_resource_based: true,
                      distributed: true,
                      nodes: [
                        %AscsErsClusterNode{
                          name: "vmnwprd01",
                          roles: [:ascs],
                          virtual_ips: ["10.80.1.25"],
                          filesystems: ["/usr/sap/NWP/ASCS00"],
                          status: "Online",
                          attributes: %{},
                          resources: [
                            %ClusterResource{
                              id: "rsc_ip_NWP_ASCS00",
                              type: "ocf::heartbeat:IPaddr2",
                              role: "Started",
                              status: "Active",
                              fail_count: 0,
                              managed: true,
                              parent: %ClusterResourceParent{
                                id: "grp_NWP_ASCS00",
                                managed: nil,
                                multi_state: nil
                              }
                            },
                            %ClusterResource{
                              id: "rsc_fs_NWP_ASCS00",
                              type: "ocf::heartbeat:Filesystem",
                              role: "Started",
                              status: "Active",
                              fail_count: 0,
                              managed: true,
                              parent: %ClusterResourceParent{
                                id: "grp_NWP_ASCS00",
                                managed: nil,
                                multi_state: nil
                              }
                            },
                            %ClusterResource{
                              id: "rsc_sap_NWP_ASCS00",
                              type: "ocf::heartbeat:SAPInstance",
                              role: "Started",
                              status: "Active",
                              fail_count: 0,
                              managed: true,
                              parent: %ClusterResourceParent{
                                id: "grp_NWP_ASCS00",
                                managed: nil,
                                multi_state: nil
                              }
                            },
                            %ClusterResource{
                              id: "rsc_socat_NWP_ASCS00",
                              type: "ocf::heartbeat:azure-lb",
                              role: "Started",
                              status: "Active",
                              fail_count: 0,
                              managed: true,
                              parent: %ClusterResourceParent{
                                id: "grp_NWP_ASCS00",
                                managed: nil,
                                multi_state: nil
                              }
                            }
                          ]
                        },
                        %AscsErsClusterNode{
                          name: "vmnwprd02",
                          roles: [:ers],
                          virtual_ips: ["10.80.1.26"],
                          filesystems: ["/usr/sap/NWP/ERS10"],
                          status: "Online",
                          attributes: %{"runs_ers_NWP" => "1"},
                          resources: [
                            %ClusterResource{
                              id: "rsc_ip_NWP_ERS10",
                              type: "ocf::heartbeat:IPaddr2",
                              role: "Started",
                              status: "Active",
                              fail_count: 0,
                              managed: true,
                              parent: %ClusterResourceParent{
                                id: "grp_NWP_ERS10",
                                managed: nil,
                                multi_state: nil
                              }
                            },
                            %ClusterResource{
                              id: "rsc_fs_NWP_ERS10",
                              type: "ocf::heartbeat:Filesystem",
                              role: "Started",
                              status: "Active",
                              fail_count: 0,
                              managed: true,
                              parent: %ClusterResourceParent{
                                id: "grp_NWP_ERS10",
                                managed: nil,
                                multi_state: nil
                              }
                            },
                            %ClusterResource{
                              id: "rsc_sap_NWP_ERS10",
                              type: "ocf::heartbeat:SAPInstance",
                              role: "Started",
                              status: "Active",
                              fail_count: 0,
                              managed: true,
                              parent: %ClusterResourceParent{
                                id: "grp_NWP_ERS10",
                                managed: nil,
                                multi_state: nil
                              }
                            },
                            %ClusterResource{
                              id: "rsc_socat_NWP_ERS10",
                              type: "ocf::heartbeat:azure-lb",
                              role: "Started",
                              status: "Active",
                              fail_count: 0,
                              managed: true,
                              parent: %ClusterResourceParent{
                                id: "grp_NWP_ERS10",
                                managed: nil,
                                multi_state: nil
                              }
                            }
                          ]
                        }
                      ]
                    }
                  ],
                  stopped_resources: [],
                  sbd_devices: [
                    %SbdDevice{
                      device:
                        "/dev/disk/by-id/scsi-SLIO-ORG_IBLOCK_e34218cd-0d9a-4b21-b6d5-a313980baa82",
                      status: "healthy"
                    }
                  ]
                },
                host_id: "4b30a6af-4b52-5bda-bccb-f2248a12c992",
                name: "netweaver_cluster",
                sap_instances: [
                  %SapInstance{
                    name: "ASCS00",
                    sid: "NWP",
                    instance_number: "00",
                    hostname: "sapnwpas",
                    resource_type: SapInstanceResourceType.sap_instance()
                  },
                  %SapInstance{
                    name: "ERS10",
                    sid: "NWP",
                    instance_number: "10",
                    hostname: "sapnwper",
                    resource_type: SapInstanceResourceType.sap_instance()
                  }
                ],
                type: :ascs_ers,
                hosts_number: 2,
                resources_number: 9,
                discovered_health: :passing,
                provider: Provider.azure()
              }
            ]} ==
             "ha_cluster_discovery_ascs_ers_maintenance"
             |> load_discovery_event_fixture()
             |> ClusterPolicy.handle(nil)
  end

  test "should return the expected commands when a ha_cluster_discovery payload of type ascs_ers with resources running in the same node is handled" do
    assert {:ok,
            [
              %RegisterClusterHost{
                details: %AscsErsClusterDetails{
                  maintenance_mode: false,
                  sap_systems: [
                    %AscsErsClusterSapSystem{
                      sid: "NWP",
                      filesystem_resource_based: true,
                      distributed: false,
                      nodes: [
                        %AscsErsClusterNode{
                          name: "vmnwprd01",
                          roles: [:ascs, :ers],
                          virtual_ips: ["10.80.1.25", "10.80.1.26"],
                          filesystems: ["/usr/sap/NWP/ASCS00", "/usr/sap/NWP/ERS10"],
                          status: "Online"
                        },
                        %AscsErsClusterNode{
                          name: "vmnwprd02",
                          roles: [],
                          virtual_ips: [],
                          filesystems: [],
                          status: "Online"
                        }
                      ]
                    }
                  ]
                }
              }
            ]} =
             "ha_cluster_discovery_ascs_ers"
             |> load_discovery_event_fixture()
             |> update_in(
               ["payload", "Crmmon", "Groups"],
               &Enum.map(&1, fn group ->
                 update_in(
                   group,
                   ["Resources"],
                   fn resources ->
                     Enum.map(resources, fn resource ->
                       put_in(resource, ["Node", "Name"], "vmnwprd01")
                     end)
                   end
                 )
               end)
             )
             |> ClusterPolicy.handle(nil)
  end

  test "should return the expected commands when a ha_cluster_discovery payload of type ascs_ers with invalid data is handled" do
    assert {:ok,
            [
              %RegisterClusterHost{
                cib_last_written: "Tue Jan 11 13:43:06 2022",
                cluster_id: "0eac831a-aa66-5f45-89a4-007fbd2c5714",
                designated_controller: false,
                details: nil,
                host_id: "4b30a6af-4b52-5bda-bccb-f2248a12c992",
                name: "netweaver_cluster",
                sap_instances: [
                  %SapInstance{
                    name: "ASCS00",
                    sid: "NWP",
                    instance_number: "00",
                    hostname: "sapnwpas",
                    resource_type: SapInstanceResourceType.sap_instance()
                  }
                ],
                type: :unknown,
                hosts_number: 2,
                resources_number: 5,
                discovered_health: :unknown,
                provider: Provider.azure()
              }
            ]} ==
             "ha_cluster_discovery_ascs_ers_invalid"
             |> load_discovery_event_fixture()
             |> ClusterPolicy.handle(nil)
  end

  test "should return the expected commands when a ha_cluster_discovery payload of type ascs_ers with multi sid setup is handled" do
    assert {:ok,
            [
              %RegisterClusterHost{
                cib_last_written: "Tue Jan 11 13:43:06 2022",
                cluster_id: "0eac831a-aa66-5f45-89a4-007fbd2c5714",
                designated_controller: false,
                details: %AscsErsClusterDetails{
                  fencing_type: "external/sbd",
                  maintenance_mode: false,
                  sap_systems: [
                    %AscsErsClusterSapSystem{
                      sid: "NWP",
                      filesystem_resource_based: true,
                      distributed: true,
                      nodes: [
                        %AscsErsClusterNode{
                          name: "vmnwprd01",
                          roles: [:ascs],
                          virtual_ips: ["10.80.1.25"],
                          filesystems: ["/usr/sap/NWP/ASCS00"],
                          status: "Online",
                          attributes: %{},
                          resources: [
                            %ClusterResource{
                              id: "rsc_ip_NWP_ASCS00",
                              type: "ocf::heartbeat:IPaddr2",
                              role: "Started",
                              status: "Active",
                              fail_count: 0,
                              managed: true,
                              parent: %ClusterResourceParent{
                                id: "grp_NWP_ASCS00",
                                managed: nil,
                                multi_state: nil
                              }
                            },
                            %ClusterResource{
                              id: "rsc_fs_NWP_ASCS00",
                              type: "ocf::heartbeat:Filesystem",
                              role: "Started",
                              status: "Active",
                              fail_count: 0,
                              managed: true,
                              parent: %ClusterResourceParent{
                                id: "grp_NWP_ASCS00",
                                managed: nil,
                                multi_state: nil
                              }
                            },
                            %ClusterResource{
                              id: "rsc_sap_NWP_ASCS00",
                              type: "ocf::heartbeat:SAPInstance",
                              role: "Started",
                              status: "Active",
                              fail_count: 0,
                              managed: true,
                              parent: %ClusterResourceParent{
                                id: "grp_NWP_ASCS00",
                                managed: nil,
                                multi_state: nil
                              }
                            },
                            %ClusterResource{
                              id: "rsc_socat_NWP_ASCS00",
                              type: "ocf::heartbeat:azure-lb",
                              role: "Started",
                              status: "Active",
                              fail_count: 0,
                              managed: true,
                              parent: %ClusterResourceParent{
                                id: "grp_NWP_ASCS00",
                                managed: nil,
                                multi_state: nil
                              }
                            }
                          ]
                        },
                        %AscsErsClusterNode{
                          name: "vmnwprd02",
                          roles: [:ers],
                          virtual_ips: ["10.80.1.26"],
                          filesystems: ["/usr/sap/NWP/ERS10"],
                          status: "Online",
                          attributes: %{"runs_ers_NWD" => "1", "runs_ers_NWP" => "1"},
                          resources: [
                            %ClusterResource{
                              id: "rsc_ip_NWP_ERS10",
                              type: "ocf::heartbeat:IPaddr2",
                              role: "Started",
                              status: "Active",
                              fail_count: 0,
                              managed: true,
                              parent: %ClusterResourceParent{
                                id: "grp_NWP_ERS10",
                                managed: nil,
                                multi_state: nil
                              }
                            },
                            %ClusterResource{
                              id: "rsc_fs_NWP_ERS10",
                              type: "ocf::heartbeat:Filesystem",
                              role: "Started",
                              status: "Active",
                              fail_count: 0,
                              managed: true,
                              parent: %ClusterResourceParent{
                                id: "grp_NWP_ERS10",
                                managed: nil,
                                multi_state: nil
                              }
                            },
                            %ClusterResource{
                              id: "rsc_sap_NWP_ERS10",
                              type: "ocf::heartbeat:SAPInstance",
                              role: "Started",
                              status: "Active",
                              fail_count: 0,
                              managed: true,
                              parent: %ClusterResourceParent{
                                id: "grp_NWP_ERS10",
                                managed: nil,
                                multi_state: nil
                              }
                            },
                            %ClusterResource{
                              id: "rsc_socat_NWP_ERS10",
                              type: "ocf::heartbeat:azure-lb",
                              role: "Started",
                              status: "Active",
                              fail_count: 0,
                              managed: true,
                              parent: %ClusterResourceParent{
                                id: "grp_NWP_ERS10",
                                managed: nil,
                                multi_state: nil
                              }
                            }
                          ]
                        }
                      ]
                    },
                    %AscsErsClusterSapSystem{
                      sid: "NWD",
                      filesystem_resource_based: true,
                      distributed: true,
                      nodes: [
                        %AscsErsClusterNode{
                          name: "vmnwprd01",
                          roles: [:ascs],
                          virtual_ips: ["10.80.2.25"],
                          filesystems: ["/usr/sap/NWD/ASCS01"],
                          status: "Online",
                          attributes: %{},
                          resources: [
                            %ClusterResource{
                              id: "rsc_ip_NWD_ASCS01",
                              type: "ocf::heartbeat:IPaddr2",
                              role: "Started",
                              status: "Active",
                              fail_count: 0,
                              managed: true,
                              parent: %ClusterResourceParent{
                                id: "grp_NWD_ASCS01",
                                managed: nil,
                                multi_state: nil
                              }
                            },
                            %ClusterResource{
                              id: "rsc_fs_NWD_ASCS01",
                              type: "ocf::heartbeat:Filesystem",
                              role: "Started",
                              status: "Active",
                              fail_count: 0,
                              managed: true,
                              parent: %ClusterResourceParent{
                                id: "grp_NWD_ASCS01",
                                managed: nil,
                                multi_state: nil
                              }
                            },
                            %ClusterResource{
                              id: "rsc_sap_NWD_ASCS01",
                              type: "ocf::heartbeat:SAPInstance",
                              role: "Started",
                              status: "Active",
                              fail_count: 0,
                              managed: true,
                              parent: %ClusterResourceParent{
                                id: "grp_NWD_ASCS01",
                                managed: nil,
                                multi_state: nil
                              }
                            },
                            %ClusterResource{
                              id: "rsc_socat_NWD_ASCS01",
                              type: "ocf::heartbeat:azure-lb",
                              role: "Started",
                              status: "Active",
                              fail_count: 0,
                              managed: true,
                              parent: %ClusterResourceParent{
                                id: "grp_NWD_ASCS01",
                                managed: nil,
                                multi_state: nil
                              }
                            }
                          ]
                        },
                        %AscsErsClusterNode{
                          name: "vmnwprd02",
                          roles: [:ers],
                          virtual_ips: ["10.80.2.26"],
                          filesystems: ["/usr/sap/NWD/ERS11"],
                          status: "Online",
                          attributes: %{"runs_ers_NWD" => "1", "runs_ers_NWP" => "1"},
                          resources: [
                            %ClusterResource{
                              id: "rsc_ip_NWD_ERS11",
                              type: "ocf::heartbeat:IPaddr2",
                              role: "Started",
                              status: "Active",
                              fail_count: 0,
                              managed: true,
                              parent: %ClusterResourceParent{
                                id: "grp_NWD_ERS11",
                                managed: nil,
                                multi_state: nil
                              }
                            },
                            %ClusterResource{
                              id: "rsc_fs_NWD_ERS11",
                              type: "ocf::heartbeat:Filesystem",
                              role: "Started",
                              status: "Active",
                              fail_count: 0,
                              managed: true,
                              parent: %ClusterResourceParent{
                                id: "grp_NWD_ERS11",
                                managed: nil,
                                multi_state: nil
                              }
                            },
                            %ClusterResource{
                              id: "rsc_sap_NWD_ERS11",
                              type: "ocf::heartbeat:SAPInstance",
                              role: "Started",
                              status: "Active",
                              fail_count: 0,
                              managed: true,
                              parent: %ClusterResourceParent{
                                id: "grp_NWD_ERS11",
                                managed: nil,
                                multi_state: nil
                              }
                            },
                            %ClusterResource{
                              id: "rsc_socat_NWD_ERS11",
                              type: "ocf::heartbeat:azure-lb",
                              role: "Started",
                              status: "Active",
                              fail_count: 0,
                              managed: true,
                              parent: %ClusterResourceParent{
                                id: "grp_NWD_ERS11",
                                managed: nil,
                                multi_state: nil
                              }
                            }
                          ]
                        }
                      ]
                    }
                  ],
                  stopped_resources: [],
                  sbd_devices: [
                    %SbdDevice{
                      device:
                        "/dev/disk/by-id/scsi-SLIO-ORG_IBLOCK_e34218cd-0d9a-4b21-b6d5-a313980baa82",
                      status: "healthy"
                    }
                  ]
                },
                host_id: "4b30a6af-4b52-5bda-bccb-f2248a12c992",
                name: "netweaver_cluster",
                sap_instances: [
                  %SapInstance{
                    name: "ASCS00",
                    sid: "NWP",
                    instance_number: "00",
                    hostname: "sapnwpas",
                    resource_type: SapInstanceResourceType.sap_instance()
                  },
                  %SapInstance{
                    name: "ERS10",
                    sid: "NWP",
                    instance_number: "10",
                    hostname: "sapnwper",
                    resource_type: SapInstanceResourceType.sap_instance()
                  },
                  %SapInstance{
                    name: "ASCS01",
                    sid: "NWD",
                    instance_number: "01",
                    hostname: "sapnwpas",
                    resource_type: SapInstanceResourceType.sap_instance()
                  },
                  %SapInstance{
                    name: "ERS11",
                    sid: "NWD",
                    instance_number: "11",
                    hostname: "sapnwper",
                    resource_type: SapInstanceResourceType.sap_instance()
                  }
                ],
                type: :ascs_ers,
                hosts_number: 2,
                resources_number: 17,
                discovered_health: :passing,
                provider: Provider.azure()
              }
            ]} ==
             "ha_cluster_discovery_ascs_ers_multi_sid"
             |> load_discovery_event_fixture()
             |> ClusterPolicy.handle(nil)
  end

  test "should set the filesystem_resource_based to false if no Filesystem resources are found" do
    group_1 = %{
      "Id" => "Group1",
      "Primitives" => [
        build(:cib_resource, %{
          "Id" => "rsc_sap_NWP_ASCS00",
          "Type" => "SAPInstance",
          "InstanceAttributes" => [
            %{"Id" => "Id1", "Name" => "InstanceName", "Value" => "NWP_ASCS00_sapnwpas"}
          ]
        })
      ]
    }

    group_2 = %{
      "Id" => "Group2",
      "Primitives" => [
        build(:cib_resource, %{
          "Id" => "rsc_sap_NWP_ERS10",
          "Type" => "SAPInstance",
          "InstanceAttributes" => [
            %{"Id" => "Id2", "Name" => "InstanceName", "Value" => "NWP_ERS10_sapnwpas"}
          ]
        })
      ]
    }

    assert {:ok,
            [
              %RegisterClusterHost{
                details: %AscsErsClusterDetails{
                  maintenance_mode: false,
                  sap_systems: [
                    %AscsErsClusterSapSystem{
                      sid: "NWP",
                      filesystem_resource_based: false,
                      distributed: true
                    }
                  ]
                }
              }
            ]} =
             "ha_cluster_discovery_ascs_ers"
             |> load_discovery_event_fixture()
             |> put_in(["payload", "Cib", "Configuration", "Resources", "Groups"], [
               group_1,
               group_2
             ])
             |> ClusterPolicy.handle(nil)
  end

  describe "ascs/ers clusters health" do
    test "should set the health to critical when one of the nodes is unclean" do
      assert {:ok,
              [
                %RegisterClusterHost{
                  details: %AscsErsClusterDetails{
                    sap_systems: [
                      %AscsErsClusterSapSystem{
                        sid: "NWP",
                        distributed: false
                      }
                    ]
                  },
                  discovered_health: :critical
                }
              ]} =
               "ha_cluster_discovery_ascs_ers"
               |> load_discovery_event_fixture()
               |> put_in(["payload", "Crmmon", "Nodes"], [
                 %{"Id" => "1", "Unclean" => true, "Online" => false, "Name" => "vmnwprd01"},
                 %{"Id" => "2", "Unclean" => false, "Online" => true, "Name" => "vmnwprd02"}
               ])
               |> ClusterPolicy.handle(nil)
    end

    test "should set the health to critical when the SAPInstance resource is Stopped" do
      group_1_resources =
        build_list(1, :crm_resource, %{
          "Id" => "rsc_sap_NWP_ASCS00",
          "Agent" => "ocf::heartbeat:SAPInstance",
          "Role" => "Started",
          "Node" => build(:crm_resource_node, %{"Name" => "vmnwpd01"})
        })

      group_2_resources =
        build_list(1, :crm_resource, %{
          "Id" => "rsc_sap_NWP_ERS10",
          "Agent" => "ocf::heartbeat:SAPInstance",
          "Role" => "Stopped",
          "Node" => build(:crm_resource_node, %{"Name" => "vmnwpd02"})
        })

      assert {:ok,
              [
                %RegisterClusterHost{
                  details: %AscsErsClusterDetails{
                    sap_systems: [
                      %AscsErsClusterSapSystem{
                        sid: "NWP",
                        distributed: false
                      }
                    ]
                  },
                  discovered_health: :critical
                }
              ]} =
               "ha_cluster_discovery_ascs_ers"
               |> load_discovery_event_fixture()
               |> put_in(["payload", "Crmmon", "Groups"], [
                 %{"Id" => UUID.uuid4(), "Resources" => group_1_resources},
                 %{"Id" => UUID.uuid4(), "Resources" => group_2_resources}
               ])
               |> ClusterPolicy.handle(nil)
    end

    test "should set the health to critical when the SAPInstance resource is running the same node" do
      group_1_resources =
        build_list(1, :crm_resource, %{
          "Id" => "rsc_sap_NWP_ASCS00",
          "Agent" => "ocf::heartbeat:SAPInstance",
          "Node" => build(:crm_resource_node, %{"Name" => "vmnwpd01"})
        })

      group_2_resources =
        build_list(1, :crm_resource, %{
          "Id" => "rsc_sap_NWP_ERS10",
          "Agent" => "ocf::heartbeat:SAPInstance",
          "Node" => build(:crm_resource_node, %{"Name" => "vmnwpd01"})
        })

      assert {:ok,
              [
                %RegisterClusterHost{
                  details: %AscsErsClusterDetails{
                    sap_systems: [
                      %AscsErsClusterSapSystem{
                        sid: "NWP",
                        distributed: false
                      }
                    ]
                  },
                  discovered_health: :critical
                }
              ]} =
               "ha_cluster_discovery_ascs_ers"
               |> load_discovery_event_fixture()
               |> put_in(["payload", "Crmmon", "Groups"], [
                 %{"Id" => UUID.uuid4(), "Resources" => group_1_resources},
                 %{"Id" => UUID.uuid4(), "Resources" => group_2_resources}
               ])
               |> ClusterPolicy.handle(nil)
    end

    test "should set the health to critical when the SAPInstance is on failed state" do
      group_1_resources =
        build_list(1, :crm_resource, %{
          "Id" => "rsc_sap_NWP_ASCS00",
          "Agent" => "ocf::heartbeat:SAPInstance",
          "Failed" => true,
          "Node" => build(:crm_resource_node, %{"Name" => "vmnwpd01"})
        })

      group_2_resources =
        build_list(1, :crm_resource, %{
          "Id" => "rsc_sap_NWP_ERS10",
          "Agent" => "ocf::heartbeat:SAPInstance",
          "Failed" => false,
          "Node" => build(:crm_resource_node, %{"Name" => "vmnwpd01"})
        })

      assert {:ok,
              [
                %RegisterClusterHost{
                  details: %AscsErsClusterDetails{
                    sap_systems: [
                      %AscsErsClusterSapSystem{
                        sid: "NWP",
                        distributed: false
                      }
                    ]
                  },
                  discovered_health: :critical
                }
              ]} =
               "ha_cluster_discovery_ascs_ers"
               |> load_discovery_event_fixture()
               |> put_in(["payload", "Crmmon", "Groups"], [
                 %{"Id" => UUID.uuid4(), "Resources" => group_1_resources},
                 %{"Id" => UUID.uuid4(), "Resources" => group_2_resources}
               ])
               |> ClusterPolicy.handle(nil)
    end
  end

  test "should return the expected commands when a ha_cluster_discovery payload with aws provider" do
    assert {:ok,
            [
              %RegisterClusterHost{
                cib_last_written: "Wed Apr 27 07:42:23 2022",
                cluster_id: "3e83b9d1-00e8-544d-9e29-7a66d9ed7c1e",
                designated_controller: true,
                details: %HanaClusterDetails{
                  maintenance_mode: false,
                  fencing_type: "external/ec2",
                  nodes: [
                    %HanaClusterNode{
                      attributes: %{
                        "hana_prd_clone_state" => "PROMOTED",
                        "hana_prd_op_mode" => "logreplay",
                        "hana_prd_remoteHost" => "vmhana02",
                        "hana_prd_roles" => "4:P:master1:master:worker:master",
                        "hana_prd_site" => "Site1",
                        "hana_prd_srmode" => "sync",
                        "hana_prd_sync_state" => "PRIM",
                        "hana_prd_version" => "2.00.052.00.1599235305",
                        "hana_prd_vhost" => "vmhana01",
                        "lpa_prd_lpt" => "1651045343",
                        "master-rsc_SAPHana_PRD_HDB00" => "150"
                      },
                      hana_status: "Primary",
                      status: "Online",
                      name: "vmhana01",
                      indexserver_actual_role: "master",
                      nameserver_actual_role: "master",
                      resources: [
                        %ClusterResource{
                          fail_count: 0,
                          id: "rsc_aws_stonith_PRD_HDB00",
                          managed: true,
                          parent: nil,
                          role: "Started",
                          status: "Active",
                          type: "stonith:external/ec2"
                        },
                        %ClusterResource{
                          fail_count: 0,
                          id: "rsc_ip_PRD_HDB00",
                          managed: true,
                          parent: nil,
                          role: "Started",
                          status: "Active",
                          type: "ocf::suse:aws-vpc-move-ip"
                        },
                        %ClusterResource{
                          fail_count: 0,
                          id: "rsc_exporter_PRD_HDB00",
                          managed: true,
                          parent: nil,
                          role: "Started",
                          status: "Active",
                          type: "systemd:prometheus-hanadb_exporter@PRD_HDB00"
                        },
                        %ClusterResource{
                          fail_count: 0,
                          id: "rsc_SAPHana_PRD_HDB00",
                          managed: true,
                          parent: %ClusterResourceParent{
                            id: "msl_SAPHana_PRD_HDB00",
                            managed: true,
                            multi_state: true
                          },
                          role: "Master",
                          status: "Active",
                          type: "ocf::suse:SAPHana"
                        },
                        %ClusterResource{
                          fail_count: 0,
                          id: "rsc_SAPHanaTopology_PRD_HDB00",
                          managed: true,
                          parent: %ClusterResourceParent{
                            id: "cln_SAPHanaTopology_PRD_HDB00",
                            managed: true,
                            multi_state: false
                          },
                          role: "Started",
                          status: "Active",
                          type: "ocf::suse:SAPHanaTopology"
                        }
                      ],
                      site: "Site1",
                      virtual_ip: "192.168.1.10"
                    },
                    %HanaClusterNode{
                      attributes: %{
                        "hana_prd_clone_state" => "DEMOTED",
                        "hana_prd_op_mode" => "logreplay",
                        "hana_prd_remoteHost" => "vmhana01",
                        "hana_prd_roles" => "4:S:master1:master:worker:master",
                        "hana_prd_site" => "Site2",
                        "hana_prd_srmode" => "sync",
                        "hana_prd_sync_state" => "SOK",
                        "hana_prd_version" => "2.00.052.00.1599235305",
                        "hana_prd_vhost" => "vmhana02",
                        "lpa_prd_lpt" => "30",
                        "master-rsc_SAPHana_PRD_HDB00" => "100"
                      },
                      hana_status: "Secondary",
                      status: "Online",
                      name: "vmhana02",
                      indexserver_actual_role: "master",
                      nameserver_actual_role: "master",
                      resources: [
                        %ClusterResource{
                          fail_count: 0,
                          id: "rsc_SAPHana_PRD_HDB00",
                          managed: true,
                          parent: %ClusterResourceParent{
                            id: "msl_SAPHana_PRD_HDB00",
                            managed: true,
                            multi_state: true
                          },
                          role: "Slave",
                          status: "Active",
                          type: "ocf::suse:SAPHana"
                        },
                        %ClusterResource{
                          fail_count: 0,
                          id: "rsc_SAPHanaTopology_PRD_HDB00",
                          managed: true,
                          parent: %ClusterResourceParent{
                            id: "cln_SAPHanaTopology_PRD_HDB00",
                            managed: true,
                            multi_state: false
                          },
                          role: "Started",
                          status: "Active",
                          type: "ocf::suse:SAPHanaTopology"
                        }
                      ],
                      site: "Site2",
                      virtual_ip: nil
                    }
                  ],
                  sites: [
                    %HanaClusterSite{name: "Site1", state: "Primary", sr_health_state: "4"},
                    %HanaClusterSite{name: "Site2", state: "Secondary", sr_health_state: "4"}
                  ],
                  sbd_devices: [],
                  secondary_sync_state: "SOK",
                  sr_health_state: "4",
                  stopped_resources: [],
                  system_replication_mode: "sync",
                  system_replication_operation_mode: "logreplay",
                  architecture_type: HanaArchitectureType.classic(),
                  hana_scenario: HanaScenario.performance_optimized()
                },
                discovered_health: :passing,
                host_id: "a3279fd0-0443-1234-9354-2d7909fd6bc6",
                hosts_number: 2,
                name: "hana_cluster",
                provider: Provider.aws(),
                resources_number: 7,
                sap_instances: [
                  %SapInstance{
                    name: "HDB00",
                    sid: "PRD",
                    instance_number: "00",
                    hostname: nil,
                    resource_type: SapInstanceResourceType.sap_hana_topology()
                  }
                ],
                type: :hana_scale_up
              }
            ]} ==
             "ha_cluster_discovery_aws"
             |> load_discovery_event_fixture()
             |> ClusterPolicy.handle(nil)
  end

  test "should return the expected commands when a ha_cluster_discovery payload with gcp provider" do
    assert {:ok,
            [
              %RegisterClusterHost{
                cib_last_written: "Wed Apr 27 07:02:35 2022",
                cluster_id: "61b4f40d-5e1e-5b58-bdc1-7b855dd7ede2",
                designated_controller: true,
                details: %HanaClusterDetails{
                  fencing_type: "fence_gce",
                  maintenance_mode: false,
                  nodes: [
                    %HanaClusterNode{
                      attributes: %{
                        "hana_prd_clone_state" => "UNDEFINED",
                        "hana_prd_op_mode" => "logreplay",
                        "hana_prd_remoteHost" => "vmhana02",
                        "hana_prd_roles" => "1:P:master1::worker:",
                        "hana_prd_site" => "Site1",
                        "hana_prd_srmode" => "sync",
                        "hana_prd_sync_state" => "SFAIL",
                        "hana_prd_version" => "2.00.057.00.1629894416",
                        "hana_prd_vhost" => "vmhana01",
                        "lpa_prd_lpt" => "1650871168",
                        "master-rsc_SAPHana_PRD_HDB00" => "-9000"
                      },
                      hana_status: "Failed",
                      status: "Online",
                      name: "vmhana01",
                      indexserver_actual_role: nil,
                      nameserver_actual_role: nil,
                      resources: [
                        %ClusterResource{
                          fail_count: 0,
                          id: "rsc_SAPHanaTopology_PRD_HDB00",
                          role: "Started",
                          status: "Active",
                          type: "ocf::suse:SAPHanaTopology",
                          managed: true,
                          parent: %ClusterResourceParent{
                            id: "cln_SAPHanaTopology_PRD_HDB00",
                            managed: true,
                            multi_state: false
                          }
                        },
                        %ClusterResource{
                          fail_count: 0,
                          id: "rsc_ip_PRD_HDB00",
                          role: "Started",
                          status: "Active",
                          type: "ocf::heartbeat:IPaddr2",
                          managed: true,
                          parent: %ClusterResourceParent{
                            id: "g_ip_PRD_HDB00",
                            managed: nil,
                            multi_state: nil
                          }
                        },
                        %ClusterResource{
                          fail_count: 0,
                          id: "rsc_socat_PRD_HDB00",
                          role: "Started",
                          status: "Active",
                          type: "ocf::heartbeat:anything",
                          managed: true,
                          parent: %ClusterResourceParent{
                            id: "g_ip_PRD_HDB00",
                            managed: nil,
                            multi_state: nil
                          }
                        }
                      ],
                      site: "Site1",
                      virtual_ip: "10.0.0.12"
                    },
                    %HanaClusterNode{
                      attributes: %{
                        "hana_prd_clone_state" => "DEMOTED",
                        "hana_prd_op_mode" => "logreplay",
                        "hana_prd_remoteHost" => "vmhana01",
                        "hana_prd_roles" => "4:P:master1:master:worker:master",
                        "hana_prd_site" => "Site2",
                        "hana_prd_srmode" => "sync",
                        "hana_prd_sync_state" => "PRIM",
                        "hana_prd_version" => "2.00.057.00.1629894416",
                        "hana_prd_vhost" => "vmhana02",
                        "lpa_prd_lpt" => "30",
                        "master-rsc_SAPHana_PRD_HDB00" => "-INFINITY"
                      },
                      hana_status: "Primary",
                      status: "Online",
                      name: "vmhana02",
                      indexserver_actual_role: "master",
                      nameserver_actual_role: "master",
                      resources: [
                        %ClusterResource{
                          fail_count: 0,
                          id: "rsc_SAPHana_PRD_HDB00",
                          role: "Slave",
                          status: "Active",
                          type: "ocf::suse:SAPHana",
                          managed: true,
                          parent: %ClusterResourceParent{
                            id: "msl_SAPHana_PRD_HDB00",
                            managed: true,
                            multi_state: true
                          }
                        },
                        %ClusterResource{
                          fail_count: 0,
                          id: "rsc_SAPHanaTopology_PRD_HDB00",
                          role: "Started",
                          status: "Active",
                          type: "ocf::suse:SAPHanaTopology",
                          managed: true,
                          parent: %ClusterResourceParent{
                            id: "cln_SAPHanaTopology_PRD_HDB00",
                            managed: true,
                            multi_state: false
                          }
                        }
                      ],
                      site: "Site2",
                      virtual_ip: nil
                    }
                  ],
                  sites: [
                    %HanaClusterSite{
                      name: "Site1",
                      state: "Failed",
                      sr_health_state: "1"
                    },
                    %HanaClusterSite{
                      name: "Site2",
                      state: "Primary",
                      sr_health_state: "4"
                    }
                  ],
                  sbd_devices: [],
                  secondary_sync_state: "SFAIL",
                  sr_health_state: "1",
                  stopped_resources: [
                    %ClusterResource{
                      fail_count: nil,
                      id: "rsc_gcp_stonith_PRD_HDB00_vmhana01",
                      role: "Stopped",
                      status: nil,
                      type: "stonith:fence_gce",
                      managed: nil,
                      parent: nil
                    },
                    %ClusterResource{
                      fail_count: nil,
                      id: "rsc_exporter_PRD_HDB00",
                      role: "Stopped",
                      status: nil,
                      type: "systemd:prometheus-hanadb_exporter@PRD_HDB00",
                      managed: nil,
                      parent: nil
                    },
                    %ClusterResource{
                      fail_count: nil,
                      id: "rsc_gcp_stonith_PRD_HDB00_vmhana02",
                      role: "Stopped",
                      status: nil,
                      type: "stonith:fence_gce",
                      managed: nil,
                      parent: nil
                    },
                    %ClusterResource{
                      fail_count: nil,
                      id: "rsc_SAPHana_PRD_HDB00",
                      role: "Stopped",
                      status: nil,
                      type: "ocf::suse:SAPHana",
                      managed: nil,
                      parent: nil
                    }
                  ],
                  system_replication_mode: "sync",
                  system_replication_operation_mode: "logreplay",
                  architecture_type: HanaArchitectureType.classic(),
                  hana_scenario: HanaScenario.performance_optimized()
                },
                discovered_health: :critical,
                host_id: "1dc79771-0a96-1234-b5b6-cd4d0aef6acc",
                hosts_number: 2,
                name: "hana_cluster",
                provider: Provider.gcp(),
                resources_number: 9,
                sap_instances: [
                  %SapInstance{
                    name: "HDB00",
                    sid: "PRD",
                    instance_number: "00",
                    hostname: nil,
                    resource_type: SapInstanceResourceType.sap_hana_topology()
                  }
                ],
                type: :hana_scale_up
              }
            ]} ==
             "ha_cluster_discovery_gcp"
             |> load_discovery_event_fixture()
             |> ClusterPolicy.handle(nil)
  end

  test "should return the expected commands when a ha_cluster_discovery payload does not have a Name field" do
    assert {:ok,
            [
              %RegisterClusterHost{
                cib_last_written: "Fri Oct 18 11:48:22 2019",
                cluster_id: "34a94290-2236-5e4d-8def-05beb32d14d4",
                designated_controller: true,
                details: %HanaClusterDetails{
                  maintenance_mode: false,
                  fencing_type: "external/sbd",
                  nodes: [
                    %HanaClusterNode{
                      attributes: %{
                        "hana_prd_clone_state" => "PROMOTED",
                        "hana_prd_op_mode" => "logreplay",
                        "hana_prd_remoteHost" => "node02",
                        "hana_prd_roles" => "4:P:master1:master:worker:master",
                        "hana_prd_site" => "PRIMARY_SITE_NAME",
                        "hana_prd_srmode" => "sync",
                        "hana_prd_sync_state" => "PRIM",
                        "hana_prd_version" => "2.00.040.00.1553674765",
                        "hana_prd_vhost" => "node01",
                        "lpa_prd_lpt" => "1571392102",
                        "master-rsc_SAPHana_PRD_HDB00" => "150"
                      },
                      hana_status: "Primary",
                      status: "Online",
                      indexserver_actual_role: "master",
                      nameserver_actual_role: "master",
                      name: "node01",
                      resources: [
                        %ClusterResource{
                          fail_count: 0,
                          id: "stonith-sbd",
                          role: "Started",
                          status: "Active",
                          type: "stonith:external/sbd",
                          managed: true,
                          parent: nil
                        },
                        %ClusterResource{
                          fail_count: 2,
                          id: "rsc_ip_PRD_HDB00",
                          role: "Started",
                          status: "Active",
                          type: "ocf::heartbeat:IPaddr2",
                          managed: true,
                          parent: nil
                        },
                        %ClusterResource{
                          fail_count: 1_000_000,
                          id: "rsc_SAPHana_PRD_HDB00",
                          role: "Master",
                          status: "Active",
                          type: "ocf::suse:SAPHana",
                          managed: true,
                          parent: %ClusterResourceParent{
                            id: "msl_SAPHana_PRD_HDB00",
                            managed: true,
                            multi_state: true
                          }
                        },
                        %ClusterResource{
                          fail_count: 0,
                          id: "rsc_SAPHanaTopology_PRD_HDB00",
                          role: "Started",
                          status: "Active",
                          type: "ocf::suse:SAPHanaTopology",
                          managed: true,
                          parent: %ClusterResourceParent{
                            id: "cln_SAPHanaTopology_PRD_HDB00",
                            managed: true,
                            multi_state: false
                          }
                        },
                        %ClusterResource{
                          fail_count: nil,
                          id: "clusterfs",
                          role: "Started",
                          status: "Active",
                          type: "ocf::heartbeat:Filesystem",
                          managed: true,
                          parent: %ClusterResourceParent{
                            id: "c-clusterfs",
                            managed: true,
                            multi_state: false
                          }
                        }
                      ],
                      site: "PRIMARY_SITE_NAME",
                      virtual_ip: "192.168.123.200"
                    },
                    %HanaClusterNode{
                      attributes: %{
                        "hana_prd_clone_state" => "DEMOTED",
                        "hana_prd_op_mode" => "logreplay",
                        "hana_prd_remoteHost" => "node01",
                        "hana_prd_roles" => "4:S:master1:master:worker:master",
                        "hana_prd_site" => "SECONDARY_SITE_NAME",
                        "hana_prd_srmode" => "sync",
                        "hana_prd_sync_state" => "SOK",
                        "hana_prd_version" => "2.00.040.00.1553674765",
                        "hana_prd_vhost" => "node02",
                        "lpa_prd_lpt" => "30",
                        "master-rsc_SAPHana_PRD_HDB00" => "100"
                      },
                      indexserver_actual_role: "master",
                      nameserver_actual_role: "master",
                      hana_status: "Secondary",
                      status: "Online",
                      name: "node02",
                      resources: [
                        %ClusterResource{
                          fail_count: 0,
                          id: "test",
                          role: "Started",
                          status: "Active",
                          type: "ocf::heartbeat:Dummy",
                          managed: true,
                          parent: nil
                        },
                        %ClusterResource{
                          fail_count: 300,
                          id: "rsc_SAPHana_PRD_HDB00",
                          role: "Slave",
                          status: "Active",
                          type: "ocf::suse:SAPHana",
                          managed: true,
                          parent: %ClusterResourceParent{
                            id: "msl_SAPHana_PRD_HDB00",
                            managed: true,
                            multi_state: true
                          }
                        },
                        %ClusterResource{
                          fail_count: 0,
                          id: "rsc_SAPHanaTopology_PRD_HDB00",
                          role: "Started",
                          status: "Active",
                          type: "ocf::suse:SAPHanaTopology",
                          managed: true,
                          parent: %ClusterResourceParent{
                            id: "cln_SAPHanaTopology_PRD_HDB00",
                            managed: true,
                            multi_state: false
                          }
                        },
                        %ClusterResource{
                          fail_count: nil,
                          id: "clusterfs",
                          role: "Started",
                          status: "Active",
                          type: "ocf::heartbeat:Filesystem",
                          managed: true,
                          parent: %ClusterResourceParent{
                            id: "c-clusterfs",
                            managed: true,
                            multi_state: false
                          }
                        }
                      ],
                      site: "SECONDARY_SITE_NAME",
                      virtual_ip: nil
                    }
                  ],
                  sites: [
                    %HanaClusterSite{
                      name: "PRIMARY_SITE_NAME",
                      state: "Primary",
                      sr_health_state: "4"
                    },
                    %HanaClusterSite{
                      name: "SECONDARY_SITE_NAME",
                      state: "Secondary",
                      sr_health_state: "4"
                    }
                  ],
                  sbd_devices: [
                    %SbdDevice{
                      device: "/dev/vdc",
                      status: "healthy"
                    },
                    %SbdDevice{
                      device: "/dev/vdb",
                      status: "healthy"
                    }
                  ],
                  secondary_sync_state: "SOK",
                  sr_health_state: "4",
                  stopped_resources: [
                    %ClusterResource{
                      fail_count: nil,
                      id: "test-stop",
                      role: "Stopped",
                      status: nil,
                      type: "ocf::heartbeat:Dummy",
                      managed: nil,
                      parent: nil
                    },
                    %ClusterResource{
                      fail_count: nil,
                      id: "clusterfs",
                      role: "Stopped",
                      status: nil,
                      type: "ocf::heartbeat:Filesystem",
                      managed: nil,
                      parent: nil
                    },
                    %ClusterResource{
                      fail_count: nil,
                      id: "clusterfs",
                      role: "Stopped",
                      status: nil,
                      type: "ocf::heartbeat:Filesystem",
                      managed: nil,
                      parent: nil
                    }
                  ],
                  system_replication_mode: "sync",
                  system_replication_operation_mode: "logreplay",
                  architecture_type: HanaArchitectureType.classic(),
                  hana_scenario: HanaScenario.performance_optimized()
                },
                host_id: "779cdd70-e9e2-58ca-b18a-bf3eb3f71244",
                name: nil,
                sap_instances: [
                  %SapInstance{
                    name: "HDB00",
                    sid: "PRD",
                    instance_number: "00",
                    hostname: nil,
                    resource_type: SapInstanceResourceType.sap_hana_topology()
                  }
                ],
                type: :hana_scale_up,
                hosts_number: 2,
                resources_number: 8,
                discovered_health: :passing,
                provider: Provider.azure()
              }
            ]} ==
             "ha_cluster_discovery_unnamed"
             |> load_discovery_event_fixture()
             |> ClusterPolicy.handle(nil)
  end

  test "should return the expected commands when a ha_cluster_discovery with diskless SBD is received" do
    assert {:ok,
            [
              %RegisterClusterHost{
                cib_last_written: "Fri Oct 18 11:48:22 2019",
                cluster_id: "34a94290-2236-5e4d-8def-05beb32d14d4",
                designated_controller: true,
                details: %HanaClusterDetails{
                  fencing_type: "Diskless SBD",
                  hana_scenario: HanaScenario.performance_optimized(),
                  maintenance_mode: false,
                  nodes: [
                    %HanaClusterNode{
                      attributes: %{
                        "hana_prd_clone_state" => "PROMOTED",
                        "hana_prd_op_mode" => "logreplay",
                        "hana_prd_remoteHost" => "node02",
                        "hana_prd_roles" => "4:P:master1:master:worker:master",
                        "hana_prd_site" => "PRIMARY_SITE_NAME",
                        "hana_prd_srmode" => "sync",
                        "hana_prd_sync_state" => "PRIM",
                        "hana_prd_version" => "2.00.040.00.1553674765",
                        "hana_prd_vhost" => "node01",
                        "lpa_prd_lpt" => "1571392102",
                        "master-rsc_SAPHana_PRD_HDB00" => "150"
                      },
                      hana_status: "Primary",
                      status: "Online",
                      indexserver_actual_role: "master",
                      name: "node01",
                      nameserver_actual_role: "master",
                      resources: [
                        %ClusterResource{
                          fail_count: 2,
                          id: "rsc_ip_PRD_HDB00",
                          role: "Started",
                          status: "Active",
                          type: "ocf::heartbeat:IPaddr2",
                          managed: true,
                          parent: nil
                        },
                        %ClusterResource{
                          fail_count: 1_000_000,
                          id: "rsc_SAPHana_PRD_HDB00",
                          role: "Master",
                          status: "Active",
                          type: "ocf::suse:SAPHana",
                          managed: true,
                          parent: %ClusterResourceParent{
                            id: "msl_SAPHana_PRD_HDB00",
                            managed: true,
                            multi_state: true
                          }
                        },
                        %ClusterResource{
                          fail_count: 0,
                          id: "rsc_SAPHanaTopology_PRD_HDB00",
                          role: "Started",
                          status: "Active",
                          type: "ocf::suse:SAPHanaTopology",
                          managed: true,
                          parent: %ClusterResourceParent{
                            id: "cln_SAPHanaTopology_PRD_HDB00",
                            managed: true,
                            multi_state: false
                          }
                        }
                      ],
                      site: "PRIMARY_SITE_NAME",
                      virtual_ip: "192.168.123.200"
                    },
                    %HanaClusterNode{
                      attributes: %{
                        "hana_prd_clone_state" => "DEMOTED",
                        "hana_prd_op_mode" => "logreplay",
                        "hana_prd_remoteHost" => "node01",
                        "hana_prd_roles" => "4:S:master1:master:worker:master",
                        "hana_prd_site" => "SECONDARY_SITE_NAME",
                        "hana_prd_srmode" => "sync",
                        "hana_prd_sync_state" => "SOK",
                        "hana_prd_version" => "2.00.040.00.1553674765",
                        "hana_prd_vhost" => "node02",
                        "lpa_prd_lpt" => "30",
                        "master-rsc_SAPHana_PRD_HDB00" => "100"
                      },
                      hana_status: "Secondary",
                      status: "Online",
                      indexserver_actual_role: "master",
                      name: "node02",
                      nameserver_actual_role: "master",
                      resources: [
                        %ClusterResource{
                          fail_count: 300,
                          id: "rsc_SAPHana_PRD_HDB00",
                          role: "Slave",
                          status: "Active",
                          type: "ocf::suse:SAPHana",
                          managed: true,
                          parent: %ClusterResourceParent{
                            id: "msl_SAPHana_PRD_HDB00",
                            managed: true,
                            multi_state: true
                          }
                        },
                        %ClusterResource{
                          fail_count: 0,
                          id: "rsc_SAPHanaTopology_PRD_HDB00",
                          role: "Started",
                          status: "Active",
                          type: "ocf::suse:SAPHanaTopology",
                          managed: true,
                          parent: %ClusterResourceParent{
                            id: "cln_SAPHanaTopology_PRD_HDB00",
                            managed: true,
                            multi_state: false
                          }
                        }
                      ],
                      site: "SECONDARY_SITE_NAME",
                      virtual_ip: nil
                    }
                  ],
                  sites: [
                    %HanaClusterSite{
                      name: "PRIMARY_SITE_NAME",
                      state: "Primary",
                      sr_health_state: "4"
                    },
                    %HanaClusterSite{
                      name: "SECONDARY_SITE_NAME",
                      state: "Secondary",
                      sr_health_state: "4"
                    }
                  ],
                  sbd_devices: [],
                  secondary_sync_state: "SOK",
                  sr_health_state: "4",
                  stopped_resources: [],
                  system_replication_mode: "sync",
                  system_replication_operation_mode: "logreplay",
                  architecture_type: HanaArchitectureType.classic()
                },
                host_id: "779cdd70-e9e2-58ca-b18a-bf3eb3f71244",
                name: "hana_cluster",
                sap_instances: [
                  %SapInstance{
                    name: "HDB00",
                    sid: "PRD",
                    instance_number: "00",
                    hostname: nil,
                    resource_type: SapInstanceResourceType.sap_hana_topology()
                  }
                ],
                type: :hana_scale_up,
                hosts_number: 2,
                resources_number: 8,
                discovered_health: :passing,
                provider: Provider.azure()
              }
            ]} ==
             "ha_cluster_discovery_hana_scale_up_diskless_sbd"
             |> load_discovery_event_fixture()
             |> ClusterPolicy.handle(nil)
  end

  test "should return the expected commands when a ha_cluster_discovery with different node statuses is received" do
    assert {:ok,
            [
              %RegisterClusterHost{
                details: %HanaClusterDetails{
                  nodes: [
                    %{status: "Offline"},
                    %{status: "Unclean"},
                    %{status: "Standby"},
                    %{status: "Maintenance"},
                    %{status: "Shutdown"},
                    %{status: "Pending"},
                    %{status: "Standby on fail"},
                    %{status: "Online"}
                  ]
                }
              }
            ]} =
             "ha_cluster_discovery_hana_scale_up_node_status"
             |> load_discovery_event_fixture()
             |> ClusterPolicy.handle(nil)
  end

  describe "HANA scale out" do
    test "should return the expected commands when a ha_cluster_discovery payload with hana scale out is handled" do
      assert {:ok,
              [
                %RegisterClusterHost{
                  cluster_id: "751fb16d-62e3-5411-aa33-0100012453c7",
                  host_id: "286808a7-01bf-420d-af50-10846a7d7868",
                  name: "hana_cluster",
                  type: :hana_scale_out,
                  sap_instances: [
                    %SapInstance{
                      name: "HDB00",
                      sid: "PRD",
                      instance_number: "00",
                      hostname: nil,
                      resource_type: SapInstanceResourceType.sap_hana_topology()
                    }
                  ],
                  provider: :kvm,
                  designated_controller: true,
                  resources_number: 15,
                  hosts_number: 6,
                  discovered_health: :passing,
                  cib_last_written: "Thu Feb 23 15:59:56 2023",
                  details: %HanaClusterDetails{
                    architecture_type: HanaArchitectureType.classic(),
                    hana_scenario: HanaScenario.performance_optimized(),
                    system_replication_mode: "syncmem",
                    system_replication_operation_mode: "delta_datashipping",
                    secondary_sync_state: "SOK",
                    sr_health_state: "4",
                    fencing_type: "external/sbd",
                    maintenance_mode: false,
                    stopped_resources: [],
                    nodes: [
                      %HanaClusterNode{
                        name: "vmhana01",
                        site: "Site1",
                        hana_status: "Primary",
                        status: "Online",
                        attributes: %{
                          "hana_prd_clone_state" => "PROMOTED",
                          "hana_prd_gra" => "2.0",
                          "hana_prd_roles" => "master1:master:worker:master",
                          "hana_prd_site" => "Site1",
                          "master-rsc_SAPHanaController_PRD_HDB00" => "150"
                        },
                        indexserver_actual_role: "master",
                        nameserver_actual_role: "master",
                        virtual_ip: "192.168.152.16",
                        resources: [
                          %ClusterResource{
                            id: "stonith-sbd",
                            type: "stonith:external/sbd",
                            role: "Started",
                            status: "Active",
                            fail_count: 0,
                            managed: true,
                            parent: nil
                          },
                          %ClusterResource{
                            id: "rsc_ip_PRD_HDB00",
                            type: "ocf::heartbeat:IPaddr2",
                            role: "Started",
                            status: "Active",
                            fail_count: 0,
                            managed: true,
                            parent: nil
                          },
                          %ClusterResource{
                            id: "rsc_exporter_PRD_HDB00",
                            type: "systemd:prometheus-hanadb_exporter@PRD_HDB00",
                            role: "Started",
                            status: "Active",
                            fail_count: 0,
                            managed: true,
                            parent: nil
                          },
                          %ClusterResource{
                            id: "rsc_SAPHanaController_PRD_HDB00",
                            type: "ocf::suse:SAPHanaController",
                            role: "Master",
                            status: "Active",
                            fail_count: 0,
                            managed: true,
                            parent: %ClusterResourceParent{
                              id: "msl_SAPHanaController_PRD_HDB00",
                              managed: true,
                              multi_state: true
                            }
                          },
                          %ClusterResource{
                            id: "rsc_SAPHanaTopology_PRD_HDB00",
                            type: "ocf::suse:SAPHanaTopology",
                            role: "Started",
                            status: "Active",
                            fail_count: 0,
                            managed: true,
                            parent: %ClusterResourceParent{
                              id: "cln_SAPHanaTopology_PRD_HDB00",
                              managed: true,
                              multi_state: false
                            }
                          }
                        ]
                      },
                      %HanaClusterNode{
                        name: "vmhana02",
                        site: "Site2",
                        hana_status: "Secondary",
                        status: "Online",
                        attributes: %{
                          "hana_prd_clone_state" => "DEMOTED",
                          "hana_prd_gra" => "2.0",
                          "hana_prd_roles" => "master1:master:worker:master",
                          "hana_prd_site" => "Site2",
                          "master-rsc_SAPHanaController_PRD_HDB00" => "100"
                        },
                        indexserver_actual_role: "master",
                        nameserver_actual_role: "master",
                        virtual_ip: nil,
                        resources: [
                          %ClusterResource{
                            id: "rsc_SAPHanaController_PRD_HDB00",
                            type: "ocf::suse:SAPHanaController",
                            role: "Slave",
                            status: "Active",
                            fail_count: 0,
                            managed: true,
                            parent: %ClusterResourceParent{
                              id: "msl_SAPHanaController_PRD_HDB00",
                              managed: true,
                              multi_state: true
                            }
                          },
                          %ClusterResource{
                            id: "rsc_SAPHanaTopology_PRD_HDB00",
                            type: "ocf::suse:SAPHanaTopology",
                            role: "Started",
                            status: "Active",
                            fail_count: 0,
                            managed: true,
                            parent: %ClusterResourceParent{
                              id: "cln_SAPHanaTopology_PRD_HDB00",
                              managed: true,
                              multi_state: false
                            }
                          }
                        ]
                      },
                      %HanaClusterNode{
                        name: "vmhana03",
                        site: "Site1",
                        hana_status: "Primary",
                        status: "Online",
                        attributes: %{
                          "hana_prd_clone_state" => "DEMOTED",
                          "hana_prd_gra" => "2.0",
                          "hana_prd_roles" => "master3:slave:standby:standby",
                          "hana_prd_site" => "Site1",
                          "master-rsc_SAPHanaController_PRD_HDB00" => "140"
                        },
                        indexserver_actual_role: "standby",
                        nameserver_actual_role: "slave",
                        virtual_ip: nil,
                        resources: [
                          %ClusterResource{
                            id: "rsc_SAPHanaController_PRD_HDB00",
                            type: "ocf::suse:SAPHanaController",
                            role: "Slave",
                            status: "Active",
                            fail_count: 0,
                            managed: true,
                            parent: %ClusterResourceParent{
                              id: "msl_SAPHanaController_PRD_HDB00",
                              managed: true,
                              multi_state: true
                            }
                          },
                          %ClusterResource{
                            id: "rsc_SAPHanaTopology_PRD_HDB00",
                            type: "ocf::suse:SAPHanaTopology",
                            role: "Started",
                            status: "Active",
                            fail_count: 0,
                            managed: true,
                            parent: %ClusterResourceParent{
                              id: "cln_SAPHanaTopology_PRD_HDB00",
                              managed: true,
                              multi_state: false
                            }
                          }
                        ]
                      },
                      %HanaClusterNode{
                        name: "vmhana04",
                        site: "Site2",
                        hana_status: "Secondary",
                        status: "Online",
                        attributes: %{
                          "hana_prd_clone_state" => "DEMOTED",
                          "hana_prd_gra" => "2.0",
                          "hana_prd_roles" => "master2:slave:standby:standby",
                          "hana_prd_site" => "Site2",
                          "master-rsc_SAPHanaController_PRD_HDB00" => "80"
                        },
                        indexserver_actual_role: "standby",
                        nameserver_actual_role: "slave",
                        virtual_ip: nil,
                        resources: [
                          %ClusterResource{
                            id: "rsc_SAPHanaController_PRD_HDB00",
                            type: "ocf::suse:SAPHanaController",
                            role: "Slave",
                            status: "Active",
                            fail_count: 0,
                            managed: true,
                            parent: %ClusterResourceParent{
                              id: "msl_SAPHanaController_PRD_HDB00",
                              managed: true,
                              multi_state: true
                            }
                          },
                          %ClusterResource{
                            id: "rsc_SAPHanaTopology_PRD_HDB00",
                            type: "ocf::suse:SAPHanaTopology",
                            role: "Started",
                            status: "Active",
                            fail_count: 0,
                            managed: true,
                            parent: %ClusterResourceParent{
                              id: "cln_SAPHanaTopology_PRD_HDB00",
                              managed: true,
                              multi_state: false
                            }
                          }
                        ]
                      },
                      %HanaClusterNode{
                        name: "vmhana05",
                        site: "Site1",
                        hana_status: "Primary",
                        status: "Online",
                        attributes: %{
                          "hana_prd_clone_state" => "DEMOTED",
                          "hana_prd_gra" => "2.0",
                          "hana_prd_roles" => "master2:slave:worker:slave",
                          "hana_prd_site" => "Site1",
                          "master-rsc_SAPHanaController_PRD_HDB00" => "140"
                        },
                        indexserver_actual_role: "slave",
                        nameserver_actual_role: "slave",
                        virtual_ip: nil,
                        resources: [
                          %ClusterResource{
                            id: "rsc_SAPHanaController_PRD_HDB00",
                            type: "ocf::suse:SAPHanaController",
                            role: "Slave",
                            status: "Active",
                            fail_count: 0,
                            managed: true,
                            parent: %ClusterResourceParent{
                              id: "msl_SAPHanaController_PRD_HDB00",
                              managed: true,
                              multi_state: true
                            }
                          },
                          %ClusterResource{
                            id: "rsc_SAPHanaTopology_PRD_HDB00",
                            type: "ocf::suse:SAPHanaTopology",
                            role: "Started",
                            status: "Active",
                            fail_count: 0,
                            managed: true,
                            parent: %ClusterResourceParent{
                              id: "cln_SAPHanaTopology_PRD_HDB00",
                              managed: true,
                              multi_state: false
                            }
                          }
                        ]
                      },
                      %HanaClusterNode{
                        name: "vmhana06",
                        site: "Site2",
                        hana_status: "Secondary",
                        status: "Online",
                        attributes: %{
                          "hana_prd_clone_state" => "DEMOTED",
                          "hana_prd_gra" => "2.0",
                          "hana_prd_roles" => "master3:slave:worker:slave",
                          "hana_prd_site" => "Site2",
                          "master-rsc_SAPHanaController_PRD_HDB00" => "80"
                        },
                        indexserver_actual_role: "slave",
                        nameserver_actual_role: "slave",
                        virtual_ip: nil,
                        resources: [
                          %ClusterResource{
                            id: "rsc_SAPHanaController_PRD_HDB00",
                            type: "ocf::suse:SAPHanaController",
                            role: "Slave",
                            status: "Active",
                            fail_count: 0,
                            managed: true,
                            parent: %ClusterResourceParent{
                              id: "msl_SAPHanaController_PRD_HDB00",
                              managed: true,
                              multi_state: true
                            }
                          },
                          %ClusterResource{
                            id: "rsc_SAPHanaTopology_PRD_HDB00",
                            type: "ocf::suse:SAPHanaTopology",
                            role: "Started",
                            status: "Active",
                            fail_count: 0,
                            managed: true,
                            parent: %ClusterResourceParent{
                              id: "cln_SAPHanaTopology_PRD_HDB00",
                              managed: true,
                              multi_state: false
                            }
                          }
                        ]
                      }
                    ],
                    sites: [
                      %HanaClusterSite{name: "Site1", state: "Primary", sr_health_state: "4"},
                      %HanaClusterSite{name: "Site2", state: "Secondary", sr_health_state: "4"}
                    ],
                    sbd_devices: [
                      %SbdDevice{
                        device: "/dev/vdb",
                        status: "healthy"
                      }
                    ]
                  }
                }
              ]} ==
               "ha_cluster_discovery_hana_scale_out"
               |> load_discovery_event_fixture()
               |> ClusterPolicy.handle(nil)
    end

    test "should return the expected commands when a ha_cluster_discovery payload with hana scale out with multi target hook is handled" do
      assert {:ok,
              [
                %RegisterClusterHost{
                  cluster_id: "f343beb7-f474-57d9-bec6-60215e5a4fbc",
                  host_id: "9abb22d6-716a-4321-bb1e-175f179e7bb6",
                  name: "hana_cluster",
                  type: :hana_scale_out,
                  sap_instances: [
                    %SapInstance{
                      name: "HDB00",
                      sid: "PRD",
                      instance_number: "00",
                      hostname: nil,
                      resource_type: SapInstanceResourceType.sap_hana_topology()
                    }
                  ],
                  provider: :azure,
                  designated_controller: false,
                  resources_number: 13,
                  hosts_number: 5,
                  discovered_health: :passing,
                  cib_last_written: "Tue Jan 23 12:49:07 2024",
                  details: %HanaClusterDetails{
                    architecture_type: HanaArchitectureType.classic(),
                    hana_scenario: HanaScenario.performance_optimized(),
                    system_replication_mode: "sync",
                    system_replication_operation_mode: "logreplay",
                    secondary_sync_state: "SOK",
                    sr_health_state: "4",
                    fencing_type: "external/sbd",
                    maintenance_mode: false,
                    stopped_resources: [
                      %ClusterResource{
                        id: "rsc_SAPHanaTop_PRD_HDB00",
                        type: "ocf::suse:SAPHanaTopology",
                        role: "Stopped",
                        status: nil,
                        fail_count: nil,
                        managed: nil,
                        parent: nil
                      },
                      %ClusterResource{
                        id: "rsc_SAPHanaCon_PRD_HDB00",
                        type: "ocf::suse:SAPHanaController",
                        role: "Stopped",
                        status: nil,
                        fail_count: nil,
                        managed: nil,
                        parent: nil
                      }
                    ],
                    nodes: [
                      %HanaClusterNode{
                        name: "vmhana11",
                        site: "Site1",
                        hana_status: "Secondary",
                        status: "Online",
                        attributes: %{
                          "hana_prd_clone_state" => "DEMOTED",
                          "hana_prd_gra" => "2.0",
                          "hana_prd_gsh" => "2.2",
                          "hana_prd_roles" => "master1:master:worker:master",
                          "hana_prd_site" => "Site1",
                          "master-rsc_SAPHanaCon_PRD_HDB00" => "100"
                        },
                        indexserver_actual_role: "master",
                        nameserver_actual_role: "master",
                        virtual_ip: nil,
                        resources: [
                          %ClusterResource{
                            id: "rsc_SAPHanaTop_PRD_HDB00",
                            type: "ocf::suse:SAPHanaTopology",
                            role: "Started",
                            status: "Active",
                            fail_count: 0,
                            managed: true,
                            parent: %ClusterResourceParent{
                              id: "cln_SAPHanaTop_PRD_HDB00",
                              managed: true,
                              multi_state: false
                            }
                          },
                          %ClusterResource{
                            id: "rsc_SAPHanaCon_PRD_HDB00",
                            type: "ocf::suse:SAPHanaController",
                            role: "Slave",
                            status: "Active",
                            fail_count: 0,
                            managed: true,
                            parent: %ClusterResourceParent{
                              id: "msl_SAPHanaCon_PRD_HDB00",
                              managed: true,
                              multi_state: true
                            }
                          }
                        ]
                      },
                      %HanaClusterNode{
                        name: "vmhana12",
                        site: "Site1",
                        hana_status: "Secondary",
                        status: "Online",
                        attributes: %{
                          "hana_prd_clone_state" => "DEMOTED",
                          "hana_prd_gra" => "2.0",
                          "hana_prd_gsh" => "2.2",
                          "hana_prd_roles" => "slave:slave:worker:slave",
                          "hana_prd_site" => "Site1",
                          "master-rsc_SAPHanaCon_PRD_HDB00" => "-12200"
                        },
                        virtual_ip: nil,
                        indexserver_actual_role: "slave",
                        nameserver_actual_role: "slave",
                        resources: [
                          %ClusterResource{
                            id: "rsc_SAPHanaTop_PRD_HDB00",
                            type: "ocf::suse:SAPHanaTopology",
                            role: "Started",
                            status: "Active",
                            fail_count: 0,
                            managed: true,
                            parent: %ClusterResourceParent{
                              id: "cln_SAPHanaTop_PRD_HDB00",
                              managed: true,
                              multi_state: false
                            }
                          },
                          %ClusterResource{
                            id: "rsc_SAPHanaCon_PRD_HDB00",
                            type: "ocf::suse:SAPHanaController",
                            role: "Slave",
                            status: "Active",
                            fail_count: 0,
                            managed: true,
                            parent: %ClusterResourceParent{
                              id: "msl_SAPHanaCon_PRD_HDB00",
                              managed: true,
                              multi_state: true
                            }
                          }
                        ]
                      },
                      %HanaClusterNode{
                        name: "vmhana21",
                        site: "Site2",
                        hana_status: "Primary",
                        status: "Online",
                        attributes: %{
                          "hana_prd_clone_state" => "PROMOTED",
                          "hana_prd_gra" => "2.0",
                          "hana_prd_gsh" => "2.2",
                          "hana_prd_roles" => "master1:master:worker:master",
                          "hana_prd_site" => "Site2",
                          "master-rsc_SAPHanaCon_PRD_HDB00" => "150"
                        },
                        indexserver_actual_role: "master",
                        nameserver_actual_role: "master",
                        virtual_ip: "10.0.0.10",
                        resources: [
                          %ClusterResource{
                            id: "rsc_SAPHanaTop_PRD_HDB00",
                            type: "ocf::suse:SAPHanaTopology",
                            role: "Started",
                            status: "Active",
                            fail_count: 0,
                            managed: true,
                            parent: %ClusterResourceParent{
                              id: "cln_SAPHanaTop_PRD_HDB00",
                              managed: true,
                              multi_state: false
                            }
                          },
                          %ClusterResource{
                            id: "rsc_SAPHanaCon_PRD_HDB00",
                            type: "ocf::suse:SAPHanaController",
                            role: "Master",
                            status: "Active",
                            fail_count: 0,
                            managed: true,
                            parent: %ClusterResourceParent{
                              id: "msl_SAPHanaCon_PRD_HDB00",
                              managed: true,
                              multi_state: true
                            }
                          },
                          %ClusterResource{
                            id: "rsc_ip_PRD_HDB00",
                            type: "ocf::heartbeat:IPaddr2",
                            role: "Started",
                            status: "Active",
                            fail_count: 0,
                            managed: true,
                            parent: %ClusterResourceParent{
                              id: "g_ip_PRD_HDB00",
                              managed: nil,
                              multi_state: nil
                            }
                          },
                          %ClusterResource{
                            id: "rsc_nc_PRD_HDB00",
                            type: "ocf::heartbeat:azure-lb",
                            role: "Started",
                            status: "Active",
                            fail_count: 0,
                            managed: true,
                            parent: %ClusterResourceParent{
                              id: "g_ip_PRD_HDB00",
                              managed: nil,
                              multi_state: nil
                            }
                          }
                        ]
                      },
                      %HanaClusterNode{
                        name: "vmhana22",
                        site: "Site2",
                        hana_status: "Primary",
                        status: "Online",
                        attributes: %{
                          "hana_prd_clone_state" => "DEMOTED",
                          "hana_prd_gra" => "2.0",
                          "hana_prd_gsh" => "2.2",
                          "hana_prd_roles" => "slave:slave:worker:slave",
                          "hana_prd_site" => "Site2",
                          "master-rsc_SAPHanaCon_PRD_HDB00" => "-10000"
                        },
                        indexserver_actual_role: "slave",
                        nameserver_actual_role: "slave",
                        virtual_ip: nil,
                        resources: [
                          %ClusterResource{
                            id: "rsc_SAPHanaTop_PRD_HDB00",
                            type: "ocf::suse:SAPHanaTopology",
                            role: "Started",
                            status: "Active",
                            fail_count: 0,
                            managed: true,
                            parent: %ClusterResourceParent{
                              id: "cln_SAPHanaTop_PRD_HDB00",
                              managed: true,
                              multi_state: false
                            }
                          },
                          %ClusterResource{
                            id: "rsc_SAPHanaCon_PRD_HDB00",
                            type: "ocf::suse:SAPHanaController",
                            role: "Slave",
                            status: "Active",
                            fail_count: 0,
                            managed: true,
                            parent: %ClusterResourceParent{
                              id: "msl_SAPHanaCon_PRD_HDB00",
                              managed: true,
                              multi_state: true
                            }
                          }
                        ]
                      },
                      %HanaClusterNode{
                        name: "vmhanamm",
                        site: nil,
                        hana_status: "Unknown",
                        status: "Online",
                        attributes: %{},
                        virtual_ip: nil,
                        resources: [
                          %ClusterResource{
                            id: "stonith-sbd",
                            type: "stonith:external/sbd",
                            role: "Started",
                            status: "Active",
                            fail_count: 0,
                            managed: true,
                            parent: nil
                          }
                        ]
                      }
                    ],
                    sites: [
                      %HanaClusterSite{name: "Site2", state: "Primary", sr_health_state: "4"},
                      %HanaClusterSite{name: "Site1", state: "Secondary", sr_health_state: "4"}
                    ],
                    sbd_devices: [
                      %SbdDevice{
                        device:
                          "/dev/disk/by-id/scsi-1LIO-ORG_sbdnfs:01144514-24f0-4386-83c2-321e6b1af8b0",
                        status: "healthy"
                      }
                    ]
                  }
                }
              ]} ==
               "ha_cluster_discovery_hana_scale_out_multitarget"
               |> load_discovery_event_fixture()
               |> ClusterPolicy.handle(nil)
    end

    test "should return the expected commands when a ha_cluster_discovery payload with hana scale out with maintenance mode enabled is handled" do
      assert {:ok,
              [
                %RegisterClusterHost{
                  cluster_id: "751fb16d-62e3-5411-aa33-0100012453c7",
                  host_id: "286808a7-01bf-420d-af50-10846a7d7868",
                  name: "hana_cluster",
                  type: :hana_scale_out,
                  sap_instances: [
                    %SapInstance{
                      name: "HDB00",
                      sid: "PRD",
                      instance_number: "00",
                      hostname: nil,
                      resource_type: SapInstanceResourceType.sap_hana_topology()
                    }
                  ],
                  provider: :kvm,
                  designated_controller: true,
                  resources_number: 15,
                  hosts_number: 6,
                  discovered_health: :passing,
                  cib_last_written: "Thu Feb 23 15:59:56 2023",
                  details: %HanaClusterDetails{
                    architecture_type: HanaArchitectureType.classic(),
                    hana_scenario: HanaScenario.performance_optimized(),
                    system_replication_mode: "syncmem",
                    system_replication_operation_mode: "delta_datashipping",
                    secondary_sync_state: "SOK",
                    sr_health_state: "4",
                    fencing_type: "external/sbd",
                    maintenance_mode: true,
                    stopped_resources: [],
                    nodes: [
                      %HanaClusterNode{
                        name: "vmhana01",
                        site: "Site1",
                        hana_status: "Primary",
                        status: "Online",
                        attributes: %{
                          "hana_prd_clone_state" => "PROMOTED",
                          "hana_prd_gra" => "2.0",
                          "hana_prd_roles" => "master1:master:worker:master",
                          "hana_prd_site" => "Site1",
                          "master-rsc_SAPHanaController_PRD_HDB00" => "150"
                        },
                        indexserver_actual_role: "master",
                        nameserver_actual_role: "master",
                        virtual_ip: "192.168.152.16",
                        resources: [
                          %ClusterResource{
                            id: "stonith-sbd",
                            type: "stonith:external/sbd",
                            role: "Started",
                            status: "Active",
                            fail_count: 0,
                            managed: true,
                            parent: nil
                          },
                          %ClusterResource{
                            id: "rsc_ip_PRD_HDB00",
                            type: "ocf::heartbeat:IPaddr2",
                            role: "Started",
                            status: "Active",
                            fail_count: 0,
                            managed: true,
                            parent: nil
                          },
                          %ClusterResource{
                            id: "rsc_exporter_PRD_HDB00",
                            type: "systemd:prometheus-hanadb_exporter@PRD_HDB00",
                            role: "Started",
                            status: "Active",
                            fail_count: 0,
                            managed: true,
                            parent: nil
                          },
                          %ClusterResource{
                            id: "rsc_SAPHanaController_PRD_HDB00",
                            type: "ocf::suse:SAPHanaController",
                            role: "Master",
                            status: "Active",
                            fail_count: 0,
                            managed: true,
                            parent: %ClusterResourceParent{
                              id: "msl_SAPHanaController_PRD_HDB00",
                              managed: true,
                              multi_state: true
                            }
                          },
                          %ClusterResource{
                            id: "rsc_SAPHanaTopology_PRD_HDB00",
                            type: "ocf::suse:SAPHanaTopology",
                            role: "Started",
                            status: "Active",
                            fail_count: 0,
                            managed: true,
                            parent: %ClusterResourceParent{
                              id: "cln_SAPHanaTopology_PRD_HDB00",
                              managed: true,
                              multi_state: false
                            }
                          }
                        ]
                      },
                      %HanaClusterNode{
                        name: "vmhana02",
                        site: "Site2",
                        hana_status: "Secondary",
                        status: "Online",
                        attributes: %{
                          "hana_prd_clone_state" => "DEMOTED",
                          "hana_prd_gra" => "2.0",
                          "hana_prd_roles" => "master1:master:worker:master",
                          "hana_prd_site" => "Site2",
                          "master-rsc_SAPHanaController_PRD_HDB00" => "100"
                        },
                        indexserver_actual_role: "master",
                        nameserver_actual_role: "master",
                        virtual_ip: nil,
                        resources: [
                          %ClusterResource{
                            id: "rsc_SAPHanaController_PRD_HDB00",
                            type: "ocf::suse:SAPHanaController",
                            role: "Slave",
                            status: "Active",
                            fail_count: 0,
                            managed: true,
                            parent: %ClusterResourceParent{
                              id: "msl_SAPHanaController_PRD_HDB00",
                              managed: true,
                              multi_state: true
                            }
                          },
                          %ClusterResource{
                            id: "rsc_SAPHanaTopology_PRD_HDB00",
                            type: "ocf::suse:SAPHanaTopology",
                            role: "Started",
                            status: "Active",
                            fail_count: 0,
                            managed: true,
                            parent: %ClusterResourceParent{
                              id: "cln_SAPHanaTopology_PRD_HDB00",
                              managed: true,
                              multi_state: false
                            }
                          }
                        ]
                      },
                      %HanaClusterNode{
                        name: "vmhana03",
                        site: "Site1",
                        hana_status: "Primary",
                        status: "Online",
                        attributes: %{
                          "hana_prd_clone_state" => "DEMOTED",
                          "hana_prd_gra" => "2.0",
                          "hana_prd_roles" => "master3:slave:standby:standby",
                          "hana_prd_site" => "Site1",
                          "master-rsc_SAPHanaController_PRD_HDB00" => "140"
                        },
                        indexserver_actual_role: "standby",
                        nameserver_actual_role: "slave",
                        virtual_ip: nil,
                        resources: [
                          %ClusterResource{
                            id: "rsc_SAPHanaController_PRD_HDB00",
                            type: "ocf::suse:SAPHanaController",
                            role: "Slave",
                            status: "Active",
                            fail_count: 0,
                            managed: true,
                            parent: %ClusterResourceParent{
                              id: "msl_SAPHanaController_PRD_HDB00",
                              managed: true,
                              multi_state: true
                            }
                          },
                          %ClusterResource{
                            id: "rsc_SAPHanaTopology_PRD_HDB00",
                            type: "ocf::suse:SAPHanaTopology",
                            role: "Started",
                            status: "Active",
                            fail_count: 0,
                            managed: true,
                            parent: %ClusterResourceParent{
                              id: "cln_SAPHanaTopology_PRD_HDB00",
                              managed: true,
                              multi_state: false
                            }
                          }
                        ]
                      },
                      %HanaClusterNode{
                        name: "vmhana04",
                        site: "Site2",
                        hana_status: "Secondary",
                        status: "Online",
                        attributes: %{
                          "hana_prd_clone_state" => "DEMOTED",
                          "hana_prd_gra" => "2.0",
                          "hana_prd_roles" => "master2:slave:standby:standby",
                          "hana_prd_site" => "Site2",
                          "master-rsc_SAPHanaController_PRD_HDB00" => "80"
                        },
                        indexserver_actual_role: "standby",
                        nameserver_actual_role: "slave",
                        virtual_ip: nil,
                        resources: [
                          %ClusterResource{
                            id: "rsc_SAPHanaController_PRD_HDB00",
                            type: "ocf::suse:SAPHanaController",
                            role: "Slave",
                            status: "Active",
                            fail_count: 0,
                            managed: true,
                            parent: %ClusterResourceParent{
                              id: "msl_SAPHanaController_PRD_HDB00",
                              managed: true,
                              multi_state: true
                            }
                          },
                          %ClusterResource{
                            id: "rsc_SAPHanaTopology_PRD_HDB00",
                            type: "ocf::suse:SAPHanaTopology",
                            role: "Started",
                            status: "Active",
                            fail_count: 0,
                            managed: true,
                            parent: %ClusterResourceParent{
                              id: "cln_SAPHanaTopology_PRD_HDB00",
                              managed: true,
                              multi_state: false
                            }
                          }
                        ]
                      },
                      %HanaClusterNode{
                        name: "vmhana05",
                        site: "Site1",
                        hana_status: "Primary",
                        status: "Online",
                        attributes: %{
                          "hana_prd_clone_state" => "DEMOTED",
                          "hana_prd_gra" => "2.0",
                          "hana_prd_roles" => "master2:slave:worker:slave",
                          "hana_prd_site" => "Site1",
                          "master-rsc_SAPHanaController_PRD_HDB00" => "140"
                        },
                        indexserver_actual_role: "slave",
                        nameserver_actual_role: "slave",
                        virtual_ip: nil,
                        resources: [
                          %ClusterResource{
                            id: "rsc_SAPHanaController_PRD_HDB00",
                            type: "ocf::suse:SAPHanaController",
                            role: "Slave",
                            status: "Active",
                            fail_count: 0,
                            managed: true,
                            parent: %ClusterResourceParent{
                              id: "msl_SAPHanaController_PRD_HDB00",
                              managed: true,
                              multi_state: true
                            }
                          },
                          %ClusterResource{
                            id: "rsc_SAPHanaTopology_PRD_HDB00",
                            type: "ocf::suse:SAPHanaTopology",
                            role: "Started",
                            status: "Active",
                            fail_count: 0,
                            managed: true,
                            parent: %ClusterResourceParent{
                              id: "cln_SAPHanaTopology_PRD_HDB00",
                              managed: true,
                              multi_state: false
                            }
                          }
                        ]
                      },
                      %HanaClusterNode{
                        name: "vmhana06",
                        site: "Site2",
                        hana_status: "Secondary",
                        status: "Online",
                        attributes: %{
                          "hana_prd_clone_state" => "DEMOTED",
                          "hana_prd_gra" => "2.0",
                          "hana_prd_roles" => "master3:slave:worker:slave",
                          "hana_prd_site" => "Site2",
                          "master-rsc_SAPHanaController_PRD_HDB00" => "80"
                        },
                        indexserver_actual_role: "slave",
                        nameserver_actual_role: "slave",
                        virtual_ip: nil,
                        resources: [
                          %ClusterResource{
                            id: "rsc_SAPHanaController_PRD_HDB00",
                            type: "ocf::suse:SAPHanaController",
                            role: "Slave",
                            status: "Active",
                            fail_count: 0,
                            managed: true,
                            parent: %ClusterResourceParent{
                              id: "msl_SAPHanaController_PRD_HDB00",
                              managed: true,
                              multi_state: true
                            }
                          },
                          %ClusterResource{
                            id: "rsc_SAPHanaTopology_PRD_HDB00",
                            type: "ocf::suse:SAPHanaTopology",
                            role: "Started",
                            status: "Active",
                            fail_count: 0,
                            managed: true,
                            parent: %ClusterResourceParent{
                              id: "cln_SAPHanaTopology_PRD_HDB00",
                              managed: true,
                              multi_state: false
                            }
                          }
                        ]
                      }
                    ],
                    sites: [
                      %HanaClusterSite{name: "Site1", state: "Primary", sr_health_state: "4"},
                      %HanaClusterSite{name: "Site2", state: "Secondary", sr_health_state: "4"}
                    ],
                    sbd_devices: [
                      %SbdDevice{
                        device: "/dev/vdb",
                        status: "healthy"
                      }
                    ]
                  }
                }
              ]} ==
               "ha_cluster_discovery_hana_scale_out_maintenance"
               |> load_discovery_event_fixture()
               |> ClusterPolicy.handle(nil)
    end

    test "should return the expected commands when a ha_cluster_discovery payload without srHooks is received" do
      assert {:ok,
              [
                %RegisterClusterHost{
                  cib_last_written: "Mon Apr 22 15:55:13 2024",
                  cluster_id: "9ee907e0-0edc-50f8-9b4d-e26d0bc3810a",
                  designated_controller: true,
                  details: %HanaClusterDetails{
                    fencing_type: "Diskless SBD",
                    maintenance_mode: false,
                    nodes: [
                      %HanaClusterNode{
                        attributes: %{},
                        hana_status: "Unknown",
                        indexserver_actual_role: nil,
                        name: "hana-s-mm",
                        nameserver_actual_role: nil,
                        resources: [],
                        site: nil,
                        status: "Online",
                        virtual_ip: nil
                      },
                      %HanaClusterNode{
                        attributes: %{
                          "hana_prd_clone_state" => "PROMOTED",
                          "hana_prd_gra" => "2.0",
                          "hana_prd_roles" => "master1:master:worker:master",
                          "hana_prd_site" => "HANA_S1",
                          "master-rsc_SAPHana_PRD_HDB01" => "150"
                        },
                        hana_status: "Primary",
                        indexserver_actual_role: "master",
                        name: "hana-s1-db1",
                        nameserver_actual_role: "master",
                        resources: [
                          %ClusterResource{
                            fail_count: 0,
                            id: "fs_PRD_HDB01_fscheck",
                            managed: true,
                            parent: %ClusterResourceParent{
                              id: "cln_fs_PRD_HDB01_fscheck",
                              managed: true,
                              multi_state: false
                            },
                            role: "Started",
                            status: "Active",
                            type: "ocf::heartbeat:Filesystem"
                          },
                          %ClusterResource{
                            fail_count: 0,
                            id: "rsc_SAPHanaTopology_PRD_HDB01",
                            managed: true,
                            parent: %ClusterResourceParent{
                              id: "cln_SAPHanaTopology_PRD_HDB01",
                              managed: true,
                              multi_state: false
                            },
                            role: "Started",
                            status: "Active",
                            type: "ocf::suse:SAPHanaTopology"
                          },
                          %ClusterResource{
                            id: "rsc_SAPHana_PRD_HDB01",
                            type: "ocf::suse:SAPHanaController",
                            role: "Master",
                            status: "Active",
                            fail_count: 0,
                            managed: true,
                            parent: %ClusterResourceParent{
                              id: "msl_SAPHana_PRD_HDB01",
                              managed: true,
                              multi_state: true
                            }
                          },
                          %ClusterResource{
                            id: "rsc_ip_PRD_HDB01",
                            type: "ocf::heartbeat:IPaddr2",
                            role: "Started",
                            status: "Active",
                            fail_count: 0,
                            managed: true,
                            parent: %ClusterResourceParent{
                              id: "g_ip_PRD_HDB01",
                              managed: nil,
                              multi_state: nil
                            }
                          },
                          %ClusterResource{
                            id: "rsc_nc_PRD_HDB01",
                            type: "ocf::heartbeat:azure-lb",
                            role: "Started",
                            status: "Active",
                            fail_count: 0,
                            managed: true,
                            parent: %ClusterResourceParent{
                              id: "g_ip_PRD_HDB01",
                              managed: nil,
                              multi_state: nil
                            }
                          }
                        ],
                        site: "HANA_S1",
                        status: "Online",
                        virtual_ip: "10.23.0.30"
                      },
                      %HanaClusterNode{
                        attributes: %{
                          "hana_prd_clone_state" => "DEMOTED",
                          "hana_prd_gra" => "2.0",
                          "hana_prd_roles" => "slave:slave:worker:slave",
                          "hana_prd_site" => "HANA_S1",
                          "master-rsc_SAPHana_PRD_HDB01" => "-10000"
                        },
                        hana_status: "Primary",
                        indexserver_actual_role: "slave",
                        name: "hana-s1-db2",
                        nameserver_actual_role: "slave",
                        resources: [
                          %ClusterResource{
                            fail_count: 0,
                            id: "fs_PRD_HDB01_fscheck",
                            managed: true,
                            parent: %ClusterResourceParent{
                              id: "cln_fs_PRD_HDB01_fscheck",
                              managed: true,
                              multi_state: false
                            },
                            role: "Started",
                            status: "Active",
                            type: "ocf::heartbeat:Filesystem"
                          },
                          %ClusterResource{
                            fail_count: 0,
                            id: "rsc_SAPHanaTopology_PRD_HDB01",
                            managed: true,
                            parent: %ClusterResourceParent{
                              id: "cln_SAPHanaTopology_PRD_HDB01",
                              managed: true,
                              multi_state: false
                            },
                            role: "Started",
                            status: "Active",
                            type: "ocf::suse:SAPHanaTopology"
                          },
                          %ClusterResource{
                            id: "rsc_SAPHana_PRD_HDB01",
                            type: "ocf::suse:SAPHanaController",
                            role: "Slave",
                            status: "Active",
                            fail_count: 0,
                            managed: true,
                            parent: %ClusterResourceParent{
                              id: "msl_SAPHana_PRD_HDB01",
                              managed: true,
                              multi_state: true
                            }
                          }
                        ],
                        site: "HANA_S1",
                        status: "Online",
                        virtual_ip: nil
                      },
                      %HanaClusterNode{
                        attributes: %{
                          "hana_prd_clone_state" => "DEMOTED",
                          "hana_prd_gra" => "2.0",
                          "hana_prd_roles" => "master1:master:worker:master",
                          "hana_prd_site" => "HANA_S2",
                          "master-rsc_SAPHana_PRD_HDB01" => "100"
                        },
                        hana_status: "Secondary",
                        indexserver_actual_role: "master",
                        name: "hana-s2-db1",
                        nameserver_actual_role: "master",
                        resources: [
                          %ClusterResource{
                            fail_count: 0,
                            id: "fs_PRD_HDB01_fscheck",
                            managed: true,
                            parent: %ClusterResourceParent{
                              id: "cln_fs_PRD_HDB01_fscheck",
                              managed: true,
                              multi_state: false
                            },
                            role: "Started",
                            status: "Active",
                            type: "ocf::heartbeat:Filesystem"
                          },
                          %ClusterResource{
                            fail_count: 0,
                            id: "rsc_SAPHanaTopology_PRD_HDB01",
                            managed: true,
                            parent: %ClusterResourceParent{
                              id: "cln_SAPHanaTopology_PRD_HDB01",
                              managed: true,
                              multi_state: false
                            },
                            role: "Started",
                            status: "Active",
                            type: "ocf::suse:SAPHanaTopology"
                          },
                          %ClusterResource{
                            id: "rsc_SAPHana_PRD_HDB01",
                            type: "ocf::suse:SAPHanaController",
                            role: "Slave",
                            status: "Active",
                            fail_count: 0,
                            managed: true,
                            parent: %ClusterResourceParent{
                              id: "msl_SAPHana_PRD_HDB01",
                              managed: true,
                              multi_state: true
                            }
                          }
                        ],
                        site: "HANA_S2",
                        status: "Online",
                        virtual_ip: nil
                      },
                      %HanaClusterNode{
                        attributes: %{
                          "hana_prd_clone_state" => "DEMOTED",
                          "hana_prd_gra" => "2.0",
                          "hana_prd_roles" => "slave:slave:worker:slave",
                          "hana_prd_site" => "HANA_S2",
                          "master-rsc_SAPHana_PRD_HDB01" => "-12200"
                        },
                        hana_status: "Secondary",
                        indexserver_actual_role: "slave",
                        name: "hana-s2-db2",
                        nameserver_actual_role: "slave",
                        resources: [
                          %ClusterResource{
                            fail_count: 0,
                            id: "fs_PRD_HDB01_fscheck",
                            managed: true,
                            parent: %ClusterResourceParent{
                              id: "cln_fs_PRD_HDB01_fscheck",
                              managed: true,
                              multi_state: false
                            },
                            role: "Started",
                            status: "Active",
                            type: "ocf::heartbeat:Filesystem"
                          },
                          %ClusterResource{
                            fail_count: 0,
                            id: "rsc_SAPHanaTopology_PRD_HDB01",
                            managed: true,
                            parent: %ClusterResourceParent{
                              id: "cln_SAPHanaTopology_PRD_HDB01",
                              managed: true,
                              multi_state: false
                            },
                            role: "Started",
                            status: "Active",
                            type: "ocf::suse:SAPHanaTopology"
                          },
                          %ClusterResource{
                            id: "rsc_SAPHana_PRD_HDB01",
                            type: "ocf::suse:SAPHanaController",
                            role: "Slave",
                            status: "Active",
                            fail_count: 0,
                            managed: true,
                            parent: %ClusterResourceParent{
                              id: "msl_SAPHana_PRD_HDB01",
                              managed: true,
                              multi_state: true
                            }
                          }
                        ],
                        site: "HANA_S2",
                        status: "Online",
                        virtual_ip: nil
                      }
                    ],
                    sbd_devices: [],
                    secondary_sync_state: "SOK",
                    sites: [
                      %HanaClusterSite{
                        name: "HANA_S1",
                        sr_health_state: "4",
                        state: "Primary"
                      },
                      %HanaClusterSite{
                        name: "HANA_S2",
                        sr_health_state: "4",
                        state: "Secondary"
                      }
                    ],
                    sr_health_state: "4",
                    stopped_resources: [
                      %ClusterResource{
                        id: "fs_PRD_HDB01_fscheck",
                        type: "ocf::heartbeat:Filesystem",
                        role: "Stopped",
                        status: nil,
                        fail_count: nil,
                        managed: nil,
                        parent: nil
                      },
                      %ClusterResource{
                        id: "rsc_SAPHanaTopology_PRD_HDB01",
                        type: "ocf::suse:SAPHanaTopology",
                        role: "Stopped",
                        status: nil,
                        fail_count: nil,
                        managed: nil,
                        parent: nil
                      },
                      %ClusterResource{
                        id: "rsc_SAPHana_PRD_HDB01",
                        type: "ocf::suse:SAPHanaController",
                        role: "Stopped",
                        status: nil,
                        fail_count: nil,
                        managed: nil,
                        parent: nil
                      }
                    ],
                    system_replication_mode: "sync",
                    system_replication_operation_mode: "logreplay",
                    architecture_type: HanaArchitectureType.classic(),
                    hana_scenario: HanaScenario.performance_optimized()
                  },
                  discovered_health: :passing,
                  host_id: "6eabc497-6067-4de9-b583-e4c63334ff64",
                  hosts_number: 5,
                  name: "hacluster",
                  provider: :azure,
                  resources_number: 17,
                  sap_instances: [
                    %SapInstance{
                      name: "HDB04",
                      sid: "PRD",
                      instance_number: "04",
                      hostname: nil,
                      resource_type: SapInstanceResourceType.sap_hana_topology()
                    }
                  ],
                  type: :hana_scale_out
                }
              ]} ==
               "hana_cluster_discovery_hana_scale_out_no_srhooks"
               |> load_discovery_event_fixture()
               |> ClusterPolicy.handle(nil)
    end
  end

  describe "Angi architecture" do
    test "should return the expected commands when a ha_cluster_discovery payload with Angi scale up is received" do
      assert {
               :ok,
               [
                 %RegisterClusterHost{
                   cib_last_written: "Mon Jun 10 13:03:57 2024",
                   cluster_id: "34a94290-2236-5e4d-8def-05beb32d14d4",
                   designated_controller: true,
                   details: %HanaClusterDetails{
                     architecture_type: HanaArchitectureType.angi(),
                     hana_scenario: HanaScenario.performance_optimized(),
                     fencing_type: "external/sbd",
                     maintenance_mode: false,
                     nodes: [
                       %HanaClusterNode{
                         attributes: %{
                           "hana_hn9_clone_state" => "PROMOTED",
                           "hana_hn9_roles" => "master1:master:worker:master",
                           "hana_hn9_site" => "WDF",
                           "hana_hn9_srah" => "-",
                           "hana_hn9_version" => "2.00.073.00",
                           "hana_hn9_vhost" => "vmhana01",
                           "master-rsc_SAPHanaCon_HN9_HDB09" => "150"
                         },
                         hana_status: "Primary",
                         indexserver_actual_role: "master",
                         name: "vmhana01",
                         nameserver_actual_role: "master",
                         resources: [
                           %ClusterResource{
                             id: "stonith-sbd",
                             type: "stonith:external/sbd",
                             role: "Started",
                             status: "Active",
                             fail_count: 0,
                             managed: true,
                             parent: nil
                           },
                           %ClusterResource{
                             id: "rsc_ip_HN9_HDB09",
                             type: "ocf::heartbeat:IPaddr2",
                             role: "Started",
                             status: "Active",
                             fail_count: 0,
                             managed: true,
                             parent: nil
                           },
                           %ClusterResource{
                             id: "rsc_SAPHanaTop_HN9_HDB09",
                             type: "ocf::suse:SAPHanaTopology",
                             role: "Started",
                             status: "Active",
                             fail_count: 0,
                             managed: true,
                             parent: %ClusterResourceParent{
                               id: "cln_SAPHanaTop_HN9_HDB09",
                               managed: true,
                               multi_state: false
                             }
                           },
                           %ClusterResource{
                             id: "rsc_SAPHanaCon_HN9_HDB09",
                             type: "ocf::suse:SAPHanaController",
                             role: "Master",
                             status: "Active",
                             fail_count: 0,
                             managed: true,
                             parent: %ClusterResourceParent{
                               id: "mst_SAPHanacon_HN9_HDB09",
                               managed: true,
                               multi_state: true
                             }
                           }
                         ],
                         site: "WDF",
                         status: "Online",
                         virtual_ip: "10.70.1.13"
                       },
                       %HanaClusterNode{
                         attributes: %{
                           "hana_hn9_clone_state" => "DEMOTED",
                           "hana_hn9_roles" => "master1:master:worker:master",
                           "hana_hn9_site" => "ROT",
                           "hana_hn9_srah" => "-",
                           "hana_hn9_version" => "2.00.073.00",
                           "hana_hn9_vhost" => "vmhana02",
                           "master-rsc_SAPHanaCon_HN9_HDB09" => "100"
                         },
                         hana_status: "Secondary",
                         indexserver_actual_role: "master",
                         name: "vmhana02",
                         nameserver_actual_role: "master",
                         resources: [
                           %ClusterResource{
                             fail_count: 0,
                             id: "rsc_SAPHanaTop_HN9_HDB09",
                             managed: true,
                             parent: %ClusterResourceParent{
                               id: "cln_SAPHanaTop_HN9_HDB09",
                               managed: true,
                               multi_state: false
                             },
                             role: "Started",
                             status: "Active",
                             type: "ocf::suse:SAPHanaTopology"
                           },
                           %ClusterResource{
                             fail_count: 0,
                             id: "rsc_SAPHanaCon_HN9_HDB09",
                             managed: true,
                             parent: %ClusterResourceParent{
                               id: "mst_SAPHanacon_HN9_HDB09",
                               managed: true,
                               multi_state: true
                             },
                             role: "Slave",
                             status: "Active",
                             type: "ocf::suse:SAPHanaController"
                           }
                         ],
                         site: "ROT",
                         status: "Online",
                         virtual_ip: nil
                       }
                     ],
                     sbd_devices: [%SbdDevice{device: "/dev/vdb", status: "healthy"}],
                     secondary_sync_state: "SOK",
                     sites: [
                       %HanaClusterSite{name: "WDF", sr_health_state: "4", state: "Primary"},
                       %HanaClusterSite{name: "ROT", sr_health_state: "4", state: "Secondary"}
                     ],
                     sr_health_state: "4",
                     stopped_resources: [],
                     system_replication_mode: "sync",
                     system_replication_operation_mode: "logreplay"
                   },
                   discovered_health: :passing,
                   host_id: "779cdd70-e9e2-58ca-b18a-bf3eb3f71244",
                   hosts_number: 2,
                   name: "hana_cluster",
                   provider: :azure,
                   resources_number: 6,
                   sap_instances: [
                     %SapInstance{
                       name: "HDB09",
                       sid: "HN9",
                       instance_number: "09",
                       hostname: nil,
                       resource_type: SapInstanceResourceType.sap_hana_topology()
                     }
                   ],
                   type: :hana_scale_up
                 }
               ]
             } ==
               "ha_cluster_discovery_angi_hana_scale_up"
               |> load_discovery_event_fixture()
               |> ClusterPolicy.handle(nil)
    end

    test "should return the expected commands when a ha_cluster_discovery payload with Angi scale up with failover is received" do
      assert {
               :ok,
               [
                 %RegisterClusterHost{
                   cib_last_written: "Mon Jun 10 13:06:54 2024",
                   cluster_id: "34a94290-2236-5e4d-8def-05beb32d14d4",
                   designated_controller: true,
                   details: %HanaClusterDetails{
                     architecture_type: HanaArchitectureType.angi(),
                     hana_scenario: HanaScenario.performance_optimized(),
                     fencing_type: "external/sbd",
                     maintenance_mode: false,
                     nodes: [
                       %HanaClusterNode{
                         attributes: %{
                           "hana_hn9_clone_state" => "UNDEFINED",
                           "hana_hn9_roles" => "master1::worker:",
                           "hana_hn9_site" => "WDF",
                           "hana_hn9_srah" => "-",
                           "hana_hn9_version" => "2.00.073.00",
                           "hana_hn9_vhost" => "vmhana01",
                           "master-rsc_SAPHanaCon_HN9_HDB09" => "-9000"
                         },
                         hana_status: "Failed",
                         indexserver_actual_role: nil,
                         name: "vmhana01",
                         nameserver_actual_role: nil,
                         resources: [
                           %ClusterResource{
                             fail_count: 0,
                             id: "stonith-sbd",
                             managed: true,
                             parent: nil,
                             role: "Started",
                             status: "Active",
                             type: "stonith:external/sbd"
                           },
                           %ClusterResource{
                             fail_count: 0,
                             id: "rsc_SAPHanaTop_HN9_HDB09",
                             managed: true,
                             parent: %ClusterResourceParent{
                               id: "cln_SAPHanaTop_HN9_HDB09",
                               managed: true,
                               multi_state: false
                             },
                             role: "Started",
                             status: "Active",
                             type: "ocf::suse:SAPHanaTopology"
                           }
                         ],
                         site: "WDF",
                         status: "Online",
                         virtual_ip: nil
                       },
                       %HanaClusterNode{
                         attributes: %{
                           "hana_hn9_clone_state" => "PROMOTED",
                           "hana_hn9_roles" => "master1:master:worker:master",
                           "hana_hn9_site" => "ROT",
                           "hana_hn9_srah" => "-",
                           "hana_hn9_version" => "2.00.073.00",
                           "hana_hn9_vhost" => "vmhana02",
                           "master-rsc_SAPHanaCon_HN9_HDB09" => "150",
                           "hana_hn9_sra" => "-"
                         },
                         hana_status: "Primary",
                         indexserver_actual_role: "master",
                         name: "vmhana02",
                         nameserver_actual_role: "master",
                         resources: [
                           %ClusterResource{
                             id: "rsc_ip_HN9_HDB09",
                             type: "ocf::heartbeat:IPaddr2",
                             role: "Started",
                             status: "Active",
                             fail_count: 0,
                             managed: true,
                             parent: nil
                           },
                           %ClusterResource{
                             fail_count: 0,
                             id: "rsc_SAPHanaTop_HN9_HDB09",
                             managed: true,
                             parent: %ClusterResourceParent{
                               id: "cln_SAPHanaTop_HN9_HDB09",
                               managed: true,
                               multi_state: false
                             },
                             role: "Started",
                             status: "Active",
                             type: "ocf::suse:SAPHanaTopology"
                           },
                           %ClusterResource{
                             id: "rsc_SAPHanaCon_HN9_HDB09",
                             type: "ocf::suse:SAPHanaController",
                             role: "Master",
                             status: "Active",
                             fail_count: 0,
                             managed: true,
                             parent: %ClusterResourceParent{
                               id: "mst_SAPHanacon_HN9_HDB09",
                               managed: true,
                               multi_state: true
                             }
                           }
                         ],
                         site: "ROT",
                         status: "Online",
                         virtual_ip: "10.70.1.13"
                       }
                     ],
                     sbd_devices: [%SbdDevice{device: "/dev/vdb", status: "healthy"}],
                     secondary_sync_state: "SFAIL",
                     sites: [
                       %HanaClusterSite{name: "ROT", sr_health_state: "4", state: "Primary"},
                       %HanaClusterSite{name: "WDF", sr_health_state: "1", state: "Failed"}
                     ],
                     sr_health_state: "Unknown",
                     stopped_resources: [
                       %ClusterResource{
                         id: "rsc_SAPHanaCon_HN9_HDB09",
                         type: "ocf::suse:SAPHanaController",
                         role: "Stopped",
                         status: nil,
                         fail_count: nil,
                         managed: nil,
                         parent: nil
                       }
                     ],
                     system_replication_mode: "sync",
                     system_replication_operation_mode: "logreplay"
                   },
                   discovered_health: :critical,
                   host_id: "779cdd70-e9e2-58ca-b18a-bf3eb3f71244",
                   hosts_number: 2,
                   name: "hana_cluster",
                   provider: :azure,
                   resources_number: 6,
                   sap_instances: [
                     %SapInstance{
                       name: "HDB09",
                       sid: "HN9",
                       instance_number: "09",
                       hostname: nil,
                       resource_type: SapInstanceResourceType.sap_hana_topology()
                     }
                   ],
                   type: :hana_scale_up
                 }
               ]
             } ==
               "ha_cluster_discovery_angi_hana_scale_up_failover"
               |> load_discovery_event_fixture()
               |> ClusterPolicy.handle(nil)
    end
  end

  describe "HANA and ASCS/ERS cluster" do
    test "should discover a cluster with HANA and ASCS/ERS types" do
      assert {
               :ok,
               [
                 %RegisterClusterHost{
                   cib_last_written: "Fri Oct 18 11:48:22 2019",
                   cluster_id: "34a94290-2236-5e4d-8def-05beb32d14d4",
                   designated_controller: true,
                   details: nil,
                   discovered_health: :unknown,
                   host_id: "779cdd70-e9e2-58ca-b18a-bf3eb3f71244",
                   hosts_number: 2,
                   name: "hana_cluster",
                   provider: :azure,
                   resources_number: 14,
                   sap_instances: [
                     %SapInstance{
                       name: "HDB00",
                       sid: "PRD",
                       instance_number: "00",
                       hostname: nil,
                       resource_type: SapInstanceResourceType.sap_hana_topology()
                     },
                     %SapInstance{
                       name: "ASCS00",
                       sid: "NWP",
                       instance_number: "00",
                       hostname: "sapnwpas",
                       resource_type: SapInstanceResourceType.sap_instance()
                     },
                     %SapInstance{
                       name: "ERS10",
                       sid: "NWP",
                       instance_number: "10",
                       hostname: "sapnwper",
                       resource_type: SapInstanceResourceType.sap_instance()
                     }
                   ],
                   type: :hana_ascs_ers
                 }
               ]
             } ==
               "ha_cluster_discovery_hana_ascs_ers"
               |> load_discovery_event_fixture()
               |> ClusterPolicy.handle(nil)
    end
  end

  describe "delta deregistration" do
    test "should deregister the host from the current cluster and register to the new one" do
      current_cluster_id = UUID.uuid4()

      {:ok,
       [
         %DeregisterClusterHost{cluster_id: ^current_cluster_id},
         %RegisterClusterHost{cluster_id: "34a94290-2236-5e4d-8def-05beb32d14d4"}
       ]} =
        "ha_cluster_discovery_hana_scale_up"
        |> load_discovery_event_fixture()
        |> ClusterPolicy.handle(current_cluster_id)
    end

    test "should deregister the host from the current cluster" do
      current_cluster_id = UUID.uuid4()

      {:ok,
       [
         %DeregisterClusterHost{cluster_id: ^current_cluster_id}
       ]} =
        "ha_cluster_discovery_unclustered"
        |> load_discovery_event_fixture()
        |> ClusterPolicy.handle(current_cluster_id)
    end

    test "should not deregister the host if the cluster does not change" do
      current_cluster_id = "34a94290-2236-5e4d-8def-05beb32d14d4"

      assert {:ok,
              [
                %RegisterClusterHost{cluster_id: ^current_cluster_id}
              ]} =
               "ha_cluster_discovery_hana_scale_up"
               |> load_discovery_event_fixture()
               |> ClusterPolicy.handle(current_cluster_id)
    end
  end
end
