defmodule Trento.Integration.Discovery.ClusterPolicyTest do
  use ExUnit.Case
  use Trento.DataCase

  import Trento.Integration.DiscoveryFixturesHelper

  require Trento.Domain.Enums.Provider, as: Provider

  alias Trento.Integration.Discovery.ClusterPolicy

  alias Trento.Domain.Commands.RegisterClusterHost

  alias Trento.Domain.{
    ClusterNode,
    ClusterResource,
    HanaClusterDetails,
    SbdDevice
  }

  test "should return the expected commands when a ha_cluster_discovery payload of type hana_scale_up is handled" do
    assert {:ok,
            %RegisterClusterHost{
              cib_last_written: "Fri Oct 18 11:48:22 2019",
              cluster_id: "34a94290-2236-5e4d-8def-05beb32d14d4",
              designated_controller: true,
              details: %HanaClusterDetails{
                fencing_type: "external/sbd",
                nodes: [
                  %ClusterNode{
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
                    name: "node01",
                    resources: [
                      %ClusterResource{
                        fail_count: 0,
                        id: "stonith-sbd",
                        role: "Started",
                        status: "Active",
                        type: "stonith:external/sbd"
                      },
                      %ClusterResource{
                        fail_count: 2,
                        id: "rsc_ip_PRD_HDB00",
                        role: "Started",
                        status: "Active",
                        type: "ocf::heartbeat:IPaddr2"
                      },
                      %ClusterResource{
                        fail_count: 1_000_000,
                        id: "rsc_SAPHana_PRD_HDB00",
                        role: "Master",
                        status: "Active",
                        type: "ocf::suse:SAPHana"
                      },
                      %ClusterResource{
                        fail_count: 0,
                        id: "rsc_SAPHanaTopology_PRD_HDB00",
                        role: "Started",
                        status: "Active",
                        type: "ocf::suse:SAPHanaTopology"
                      },
                      %ClusterResource{
                        fail_count: nil,
                        id: "clusterfs",
                        role: "Started",
                        status: "Active",
                        type: "ocf::heartbeat:Filesystem"
                      },
                      %ClusterResource{
                        fail_count: nil,
                        id: "rsc_ip_HA1_ASCS00",
                        role: "Started",
                        status: "Active",
                        type: "ocf::heartbeat:IPaddr2"
                      },
                      %ClusterResource{
                        fail_count: nil,
                        id: "rsc_fs_HA1_ASCS00",
                        role: "Started",
                        status: "Active",
                        type: "ocf::heartbeat:Filesystem"
                      },
                      %ClusterResource{
                        fail_count: nil,
                        id: "rsc_sap_HA1_ASCS00",
                        role: "Started",
                        status: "Active",
                        type: "ocf::heartbeat:SAPInstance"
                      }
                    ],
                    site: "PRIMARY_SITE_NAME",
                    virtual_ip: "192.168.123.200"
                  },
                  %ClusterNode{
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
                    name: "node02",
                    resources: [
                      %ClusterResource{
                        fail_count: 0,
                        id: "test",
                        role: "Started",
                        status: "Active",
                        type: "ocf::heartbeat:Dummy"
                      },
                      %ClusterResource{
                        fail_count: 300,
                        id: "rsc_SAPHana_PRD_HDB00",
                        role: "Slave",
                        status: "Active",
                        type: "ocf::suse:SAPHana"
                      },
                      %ClusterResource{
                        fail_count: 0,
                        id: "rsc_SAPHanaTopology_PRD_HDB00",
                        role: "Started",
                        status: "Active",
                        type: "ocf::suse:SAPHanaTopology"
                      },
                      %ClusterResource{
                        fail_count: nil,
                        id: "clusterfs",
                        role: "Started",
                        status: "Active",
                        type: "ocf::heartbeat:Filesystem"
                      },
                      %ClusterResource{
                        fail_count: nil,
                        id: "rsc_ip_HA1_ERS10",
                        role: "Started",
                        status: "Active",
                        type: "ocf::heartbeat:IPaddr2"
                      },
                      %ClusterResource{
                        fail_count: nil,
                        id: "rsc_fs_HA1_ERS10",
                        role: "Started",
                        status: "Active",
                        type: "ocf::heartbeat:Filesystem"
                      },
                      %ClusterResource{
                        fail_count: nil,
                        id: "rsc_sap_HA1_ERS10",
                        role: "Started",
                        status: "Active",
                        type: "ocf::heartbeat:SAPInstance"
                      }
                    ],
                    site: "SECONDARY_SITE_NAME",
                    virtual_ip: nil
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
                    type: "ocf::heartbeat:Dummy"
                  },
                  %ClusterResource{
                    fail_count: nil,
                    id: "clusterfs",
                    role: "Stopped",
                    status: nil,
                    type: "ocf::heartbeat:Filesystem"
                  },
                  %ClusterResource{
                    fail_count: nil,
                    id: "clusterfs",
                    role: "Stopped",
                    status: nil,
                    type: "ocf::heartbeat:Filesystem"
                  }
                ],
                system_replication_mode: "sync",
                system_replication_operation_mode: "logreplay"
              },
              host_id: "779cdd70-e9e2-58ca-b18a-bf3eb3f71244",
              name: "hana_cluster",
              sid: "PRD",
              type: :hana_scale_up,
              hosts_number: 2,
              resources_number: 8,
              discovered_health: :passing,
              provider: Provider.azure()
            }} ==
             "ha_cluster_discovery_hana_scale_up"
             |> load_discovery_event_fixture()
             |> ClusterPolicy.handle()
  end

  test "should return the expected commands when a ha_cluster_discovery payload of type ascs_ers is handled" do
    assert {:ok,
            %RegisterClusterHost{
              cib_last_written: "Tue Jan 11 13:43:06 2022",
              cluster_id: "0eac831a-aa66-5f45-89a4-007fbd2c5714",
              designated_controller: false,
              details: nil,
              host_id: "4b30a6af-4b52-5bda-bccb-f2248a12c992",
              name: "netweaver_cluster",
              sid: nil,
              type: :ascs_ers,
              hosts_number: 2,
              resources_number: 9,
              discovered_health: :unknown,
              provider: Provider.azure()
            }} ==
             "ha_cluster_discovery_ascs_ers"
             |> load_discovery_event_fixture()
             |> ClusterPolicy.handle()
  end

  test "should return the expected commands when a ha_cluster_discovery payload of type ascs_ers with invalid data is handled" do
    assert {:ok,
            %RegisterClusterHost{
              cib_last_written: "Tue Jan 11 13:43:06 2022",
              cluster_id: "0eac831a-aa66-5f45-89a4-007fbd2c5714",
              designated_controller: false,
              details: nil,
              host_id: "4b30a6af-4b52-5bda-bccb-f2248a12c992",
              name: "netweaver_cluster",
              sid: nil,
              type: :unknown,
              hosts_number: 2,
              resources_number: 5,
              discovered_health: :unknown,
              provider: Provider.azure()
            }} ==
             "ha_cluster_discovery_ascs_ers_invalid"
             |> load_discovery_event_fixture()
             |> ClusterPolicy.handle()
  end

  test "should return the expected commands when a ha_cluster_discovery payload of type ascs_ers with multi sid setup is handled" do
    assert {:ok,
            %RegisterClusterHost{
              cib_last_written: "Tue Jan 11 13:43:06 2022",
              cluster_id: "0eac831a-aa66-5f45-89a4-007fbd2c5714",
              designated_controller: false,
              details: nil,
              host_id: "4b30a6af-4b52-5bda-bccb-f2248a12c992",
              name: "netweaver_cluster",
              sid: nil,
              type: :ascs_ers,
              hosts_number: 2,
              resources_number: 17,
              discovered_health: :unknown,
              provider: Provider.azure()
            }} ==
             "ha_cluster_discovery_ascs_ers_multi_sid"
             |> load_discovery_event_fixture()
             |> ClusterPolicy.handle()
  end

  test "should return the expected commands when a ha_cluster_discovery payload with aws provider" do
    assert {
             :ok,
             %Trento.Domain.Commands.RegisterClusterHost{
               cib_last_written: "Wed Apr 27 07:42:23 2022",
               cluster_id: "3e83b9d1-00e8-544d-9e29-7a66d9ed7c1e",
               designated_controller: true,
               details: %Trento.Domain.HanaClusterDetails{
                 fencing_type: "external/ec2",
                 nodes: [
                   %Trento.Domain.ClusterNode{
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
                     name: "vmhana01",
                     resources: [
                       %Trento.Domain.ClusterResource{
                         fail_count: 0,
                         id: "rsc_aws_stonith_PRD_HDB00",
                         role: "Started",
                         status: "Active",
                         type: "stonith:external/ec2"
                       },
                       %Trento.Domain.ClusterResource{
                         fail_count: 0,
                         id: "rsc_ip_PRD_HDB00",
                         role: "Started",
                         status: "Active",
                         type: "ocf::suse:aws-vpc-move-ip"
                       },
                       %Trento.Domain.ClusterResource{
                         fail_count: 0,
                         id: "rsc_exporter_PRD_HDB00",
                         role: "Started",
                         status: "Active",
                         type: "systemd:prometheus-hanadb_exporter@PRD_HDB00"
                       },
                       %Trento.Domain.ClusterResource{
                         fail_count: 0,
                         id: "rsc_SAPHana_PRD_HDB00",
                         role: "Master",
                         status: "Active",
                         type: "ocf::suse:SAPHana"
                       },
                       %Trento.Domain.ClusterResource{
                         fail_count: 0,
                         id: "rsc_SAPHanaTopology_PRD_HDB00",
                         role: "Started",
                         status: "Active",
                         type: "ocf::suse:SAPHanaTopology"
                       }
                     ],
                     site: "Site1",
                     virtual_ip: "192.168.1.10"
                   },
                   %Trento.Domain.ClusterNode{
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
                     name: "vmhana02",
                     resources: [
                       %Trento.Domain.ClusterResource{
                         fail_count: 0,
                         id: "rsc_SAPHana_PRD_HDB00",
                         role: "Slave",
                         status: "Active",
                         type: "ocf::suse:SAPHana"
                       },
                       %Trento.Domain.ClusterResource{
                         fail_count: 0,
                         id: "rsc_SAPHanaTopology_PRD_HDB00",
                         role: "Started",
                         status: "Active",
                         type: "ocf::suse:SAPHanaTopology"
                       }
                     ],
                     site: "Site2",
                     virtual_ip: nil
                   }
                 ],
                 sbd_devices: [],
                 secondary_sync_state: "SOK",
                 sr_health_state: "4",
                 stopped_resources: [],
                 system_replication_mode: "sync",
                 system_replication_operation_mode: "logreplay"
               },
               discovered_health: :passing,
               host_id: "a3279fd0-0443-1234-9354-2d7909fd6bc6",
               hosts_number: 2,
               name: "hana_cluster",
               provider: Provider.aws(),
               resources_number: 7,
               sid: "PRD",
               type: :hana_scale_up
             }
           } ==
             "ha_cluster_discovery_aws"
             |> load_discovery_event_fixture()
             |> ClusterPolicy.handle()
  end

  test "should return the expected commands when a ha_cluster_discovery payload with gcp provider" do
    assert {
             :ok,
             %Trento.Domain.Commands.RegisterClusterHost{
               cib_last_written: "Wed Apr 27 07:02:35 2022",
               cluster_id: "61b4f40d-5e1e-5b58-bdc1-7b855dd7ede2",
               designated_controller: true,
               details: %Trento.Domain.HanaClusterDetails{
                 fencing_type: "fence_gce",
                 nodes: [
                   %Trento.Domain.ClusterNode{
                     attributes: %{
                       "hana_prd_clone_state" => "UNDEFINED",
                       "hana_prd_op_mode" => "logreplay",
                       "hana_prd_remoteHost" => "vmhana02",
                       "hana_prd_roles" => "1:P:master1::worker:",
                       "hana_prd_site" => "Site1",
                       "hana_prd_srmode" => "sync",
                       "hana_prd_version" => "2.00.057.00.1629894416",
                       "hana_prd_vhost" => "vmhana01",
                       "lpa_prd_lpt" => "1650871168",
                       "master-rsc_SAPHana_PRD_HDB00" => "-9000"
                     },
                     hana_status: "Unknown",
                     name: "vmhana01",
                     resources: [
                       %Trento.Domain.ClusterResource{
                         fail_count: 0,
                         id: "rsc_SAPHanaTopology_PRD_HDB00",
                         role: "Started",
                         status: "Active",
                         type: "ocf::suse:SAPHanaTopology"
                       },
                       %Trento.Domain.ClusterResource{
                         fail_count: 0,
                         id: "rsc_ip_PRD_HDB00",
                         role: "Started",
                         status: "Active",
                         type: "ocf::heartbeat:IPaddr2"
                       },
                       %Trento.Domain.ClusterResource{
                         fail_count: 0,
                         id: "rsc_socat_PRD_HDB00",
                         role: "Started",
                         status: "Active",
                         type: "ocf::heartbeat:anything"
                       }
                     ],
                     site: "Site1",
                     virtual_ip: "10.0.0.12"
                   },
                   %Trento.Domain.ClusterNode{
                     attributes: %{
                       "hana_prd_clone_state" => "DEMOTED",
                       "hana_prd_op_mode" => "logreplay",
                       "hana_prd_remoteHost" => "vmhana01",
                       "hana_prd_roles" => "4:S:master1:master:worker:master",
                       "hana_prd_site" => "Site2",
                       "hana_prd_srmode" => "sync",
                       "hana_prd_version" => "2.00.057.00.1629894416",
                       "hana_prd_vhost" => "vmhana02",
                       "lpa_prd_lpt" => "30",
                       "master-rsc_SAPHana_PRD_HDB00" => "-INFINITY"
                     },
                     hana_status: "Unknown",
                     name: "vmhana02",
                     resources: [
                       %Trento.Domain.ClusterResource{
                         fail_count: 0,
                         id: "rsc_SAPHana_PRD_HDB00",
                         role: "Slave",
                         status: "Active",
                         type: "ocf::suse:SAPHana"
                       },
                       %Trento.Domain.ClusterResource{
                         fail_count: 0,
                         id: "rsc_SAPHanaTopology_PRD_HDB00",
                         role: "Started",
                         status: "Active",
                         type: "ocf::suse:SAPHanaTopology"
                       }
                     ],
                     site: "Site2",
                     virtual_ip: nil
                   }
                 ],
                 sbd_devices: [],
                 secondary_sync_state: "Unknown",
                 sr_health_state: "Unknown",
                 stopped_resources: [
                   %Trento.Domain.ClusterResource{
                     fail_count: nil,
                     id: "rsc_gcp_stonith_PRD_HDB00_vmhana01",
                     role: "Stopped",
                     status: nil,
                     type: "stonith:fence_gce"
                   },
                   %Trento.Domain.ClusterResource{
                     fail_count: nil,
                     id: "rsc_exporter_PRD_HDB00",
                     role: "Stopped",
                     status: nil,
                     type: "systemd:prometheus-hanadb_exporter@PRD_HDB00"
                   },
                   %Trento.Domain.ClusterResource{
                     fail_count: nil,
                     id: "rsc_gcp_stonith_PRD_HDB00_vmhana02",
                     role: "Stopped",
                     status: nil,
                     type: "stonith:fence_gce"
                   },
                   %Trento.Domain.ClusterResource{
                     fail_count: nil,
                     id: "rsc_SAPHana_PRD_HDB00",
                     role: "Stopped",
                     status: nil,
                     type: "ocf::suse:SAPHana"
                   }
                 ],
                 system_replication_mode: "sync",
                 system_replication_operation_mode: "logreplay"
               },
               discovered_health: :critical,
               host_id: "1dc79771-0a96-1234-b5b6-cd4d0aef6acc",
               hosts_number: 2,
               name: "hana_cluster",
               provider: Provider.gcp(),
               resources_number: 9,
               sid: "PRD",
               type: :hana_scale_up
             }
           } ==
             "ha_cluster_discovery_gcp"
             |> load_discovery_event_fixture()
             |> ClusterPolicy.handle()
  end

  test "should return the expected commands when a ha_cluster_discovery payload does not have a Name field" do
    assert {:ok,
            %RegisterClusterHost{
              cib_last_written: "Fri Oct 18 11:48:22 2019",
              cluster_id: "34a94290-2236-5e4d-8def-05beb32d14d4",
              designated_controller: true,
              details: %HanaClusterDetails{
                fencing_type: "external/sbd",
                nodes: [
                  %ClusterNode{
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
                    name: "node01",
                    resources: [
                      %ClusterResource{
                        fail_count: 0,
                        id: "stonith-sbd",
                        role: "Started",
                        status: "Active",
                        type: "stonith:external/sbd"
                      },
                      %ClusterResource{
                        fail_count: 2,
                        id: "rsc_ip_PRD_HDB00",
                        role: "Started",
                        status: "Active",
                        type: "ocf::heartbeat:IPaddr2"
                      },
                      %ClusterResource{
                        fail_count: 1_000_000,
                        id: "rsc_SAPHana_PRD_HDB00",
                        role: "Master",
                        status: "Active",
                        type: "ocf::suse:SAPHana"
                      },
                      %ClusterResource{
                        fail_count: 0,
                        id: "rsc_SAPHanaTopology_PRD_HDB00",
                        role: "Started",
                        status: "Active",
                        type: "ocf::suse:SAPHanaTopology"
                      },
                      %ClusterResource{
                        fail_count: nil,
                        id: "clusterfs",
                        role: "Started",
                        status: "Active",
                        type: "ocf::heartbeat:Filesystem"
                      },
                      %ClusterResource{
                        fail_count: nil,
                        id: "rsc_ip_HA1_ASCS00",
                        role: "Started",
                        status: "Active",
                        type: "ocf::heartbeat:IPaddr2"
                      },
                      %ClusterResource{
                        fail_count: nil,
                        id: "rsc_fs_HA1_ASCS00",
                        role: "Started",
                        status: "Active",
                        type: "ocf::heartbeat:Filesystem"
                      },
                      %ClusterResource{
                        fail_count: nil,
                        id: "rsc_sap_HA1_ASCS00",
                        role: "Started",
                        status: "Active",
                        type: "ocf::heartbeat:SAPInstance"
                      }
                    ],
                    site: "PRIMARY_SITE_NAME",
                    virtual_ip: "192.168.123.200"
                  },
                  %ClusterNode{
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
                    name: "node02",
                    resources: [
                      %ClusterResource{
                        fail_count: 0,
                        id: "test",
                        role: "Started",
                        status: "Active",
                        type: "ocf::heartbeat:Dummy"
                      },
                      %ClusterResource{
                        fail_count: 300,
                        id: "rsc_SAPHana_PRD_HDB00",
                        role: "Slave",
                        status: "Active",
                        type: "ocf::suse:SAPHana"
                      },
                      %ClusterResource{
                        fail_count: 0,
                        id: "rsc_SAPHanaTopology_PRD_HDB00",
                        role: "Started",
                        status: "Active",
                        type: "ocf::suse:SAPHanaTopology"
                      },
                      %ClusterResource{
                        fail_count: nil,
                        id: "clusterfs",
                        role: "Started",
                        status: "Active",
                        type: "ocf::heartbeat:Filesystem"
                      },
                      %ClusterResource{
                        fail_count: nil,
                        id: "rsc_ip_HA1_ERS10",
                        role: "Started",
                        status: "Active",
                        type: "ocf::heartbeat:IPaddr2"
                      },
                      %ClusterResource{
                        fail_count: nil,
                        id: "rsc_fs_HA1_ERS10",
                        role: "Started",
                        status: "Active",
                        type: "ocf::heartbeat:Filesystem"
                      },
                      %ClusterResource{
                        fail_count: nil,
                        id: "rsc_sap_HA1_ERS10",
                        role: "Started",
                        status: "Active",
                        type: "ocf::heartbeat:SAPInstance"
                      }
                    ],
                    site: "SECONDARY_SITE_NAME",
                    virtual_ip: nil
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
                    type: "ocf::heartbeat:Dummy"
                  },
                  %ClusterResource{
                    fail_count: nil,
                    id: "clusterfs",
                    role: "Stopped",
                    status: nil,
                    type: "ocf::heartbeat:Filesystem"
                  },
                  %ClusterResource{
                    fail_count: nil,
                    id: "clusterfs",
                    role: "Stopped",
                    status: nil,
                    type: "ocf::heartbeat:Filesystem"
                  }
                ],
                system_replication_mode: "sync",
                system_replication_operation_mode: "logreplay"
              },
              host_id: "779cdd70-e9e2-58ca-b18a-bf3eb3f71244",
              name: nil,
              sid: "PRD",
              type: :hana_scale_up,
              hosts_number: 2,
              resources_number: 8,
              discovered_health: :passing,
              provider: Provider.azure()
            }} ==
             "ha_cluster_discovery_unnamed"
             |> load_discovery_event_fixture()
             |> ClusterPolicy.handle()
  end
end
