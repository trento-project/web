defmodule Trento.Integration.Discovery.ClusterPolicyTest do
  use ExUnit.Case
  use Trento.DataCase

  import Trento.Integration.DiscoveryFixturesHelper

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
              provider: :azure
            }} ==
             "ha_cluster_discovery_hana_scale_up"
             |> load_discovery_event_fixture()
             |> ClusterPolicy.handle()
  end
end
