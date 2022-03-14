defmodule Tronto.Monitoring.Integration.DiscoveryTest do
  use ExUnit.Case
  use Tronto.DataCase

  import Tronto.DiscoveryFixturesHelper

  alias Tronto.Monitoring.Integration.Discovery

  alias Tronto.Monitoring.Domain.{
    AzureProvider,
    HanaClusterDetails
  }

  alias Tronto.Monitoring.Domain.Commands.UpdateProvider

  alias Tronto.Monitoring.Domain.Commands.{
    RegisterApplicationInstance,
    RegisterClusterHost,
    RegisterDatabaseInstance
  }

  describe "cloud_discovery" do
    test "cloud_discovery payload with azure provider should return the expected command" do
      assert {
               :ok,
               %UpdateProvider{
                 host_id: "0a055c90-4cb6-54ce-ac9c-ae3fedaf40d4",
                 provider: :azure,
                 provider_data: %AzureProvider{
                   vm_name: "vmhdbdev01",
                   data_disk_number: 7,
                   location: "westeurope",
                   offer: "sles-sap-15-sp3-byos",
                   resource_group: "/subscriptions/00000000-0000-0000-0000-000000000000",
                   sku: "gen2",
                   vm_size: "Standard_E4s_v3"
                 }
               }
             } =
               "cloud_discovery_azure"
               |> load_discovery_event_fixture()
               |> Discovery.handle_discovery_event()
    end

    test "cloud_discovery payload with unknown provider should return the expected command" do
      assert {
               :ok,
               %UpdateProvider{
                 host_id: "0a055c90-4cb6-54ce-ac9c-ae3fedaf40d4",
                 provider: :unknown,
                 provider_data: nil
               }
             } =
               "cloud_discovery_unknown"
               |> load_discovery_event_fixture()
               |> Discovery.handle_discovery_event()
    end
  end

  describe "ha_cluster_discovery" do
    test "ha_cluster_discovery payload of type HANA Scale-up should return the expected command" do
      assert {:ok,
              %RegisterClusterHost{
                cluster_id: "34a94290-2236-5e4d-8def-05beb32d14d4",
                designated_controller: true,
                details: %HanaClusterDetails{
                  fencing_type: "external/sbd",
                  nodes: [
                    %HanaClusterDetails.Node{
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
                        %HanaClusterDetails.Resource{
                          fail_count: 0,
                          id: "stonith-sbd",
                          role: "Started",
                          status: "Active",
                          type: "stonith:external/sbd"
                        },
                        %HanaClusterDetails.Resource{
                          fail_count: 2,
                          id: "rsc_ip_PRD_HDB00",
                          role: "Started",
                          status: "Active",
                          type: "ocf::heartbeat:IPaddr2"
                        },
                        %HanaClusterDetails.Resource{
                          fail_count: 1_000_000,
                          id: "rsc_SAPHana_PRD_HDB00",
                          role: "Master",
                          status: "Active",
                          type: "ocf::suse:SAPHana"
                        },
                        %HanaClusterDetails.Resource{
                          fail_count: 0,
                          id: "rsc_SAPHanaTopology_PRD_HDB00",
                          role: "Started",
                          status: "Active",
                          type: "ocf::suse:SAPHanaTopology"
                        },
                        %HanaClusterDetails.Resource{
                          fail_count: nil,
                          id: "clusterfs",
                          role: "Started",
                          status: "Active",
                          type: "ocf::heartbeat:Filesystem"
                        },
                        %HanaClusterDetails.Resource{
                          fail_count: nil,
                          id: "rsc_ip_HA1_ASCS00",
                          role: "Started",
                          status: "Active",
                          type: "ocf::heartbeat:IPaddr2"
                        },
                        %HanaClusterDetails.Resource{
                          fail_count: nil,
                          id: "rsc_fs_HA1_ASCS00",
                          role: "Started",
                          status: "Active",
                          type: "ocf::heartbeat:Filesystem"
                        },
                        %HanaClusterDetails.Resource{
                          fail_count: nil,
                          id: "rsc_sap_HA1_ASCS00",
                          role: "Started",
                          status: "Active",
                          type: "ocf::heartbeat:SAPInstance"
                        }
                      ],
                      site: "PRIMARY_SITE_NAME"
                    },
                    %HanaClusterDetails.Node{
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
                        %HanaClusterDetails.Resource{
                          fail_count: 0,
                          id: "test",
                          role: "Started",
                          status: "Active",
                          type: "ocf::heartbeat:Dummy"
                        },
                        %HanaClusterDetails.Resource{
                          fail_count: 300,
                          id: "rsc_SAPHana_PRD_HDB00",
                          role: "Slave",
                          status: "Active",
                          type: "ocf::suse:SAPHana"
                        },
                        %HanaClusterDetails.Resource{
                          fail_count: 0,
                          id: "rsc_SAPHanaTopology_PRD_HDB00",
                          role: "Started",
                          status: "Active",
                          type: "ocf::suse:SAPHanaTopology"
                        },
                        %HanaClusterDetails.Resource{
                          fail_count: nil,
                          id: "clusterfs",
                          role: "Started",
                          status: "Active",
                          type: "ocf::heartbeat:Filesystem"
                        },
                        %HanaClusterDetails.Resource{
                          fail_count: nil,
                          id: "rsc_ip_HA1_ERS10",
                          role: "Started",
                          status: "Active",
                          type: "ocf::heartbeat:IPaddr2"
                        },
                        %HanaClusterDetails.Resource{
                          fail_count: nil,
                          id: "rsc_fs_HA1_ERS10",
                          role: "Started",
                          status: "Active",
                          type: "ocf::heartbeat:Filesystem"
                        },
                        %HanaClusterDetails.Resource{
                          fail_count: nil,
                          id: "rsc_sap_HA1_ERS10",
                          role: "Started",
                          status: "Active",
                          type: "ocf::heartbeat:SAPInstance"
                        }
                      ],
                      site: "SECONDARY_SITE_NAME"
                    }
                  ],
                  sbd_devices: [
                    %HanaClusterDetails.SbdDevice{
                      device: "/dev/vdc",
                      status: "healthy"
                    },
                    %HanaClusterDetails.SbdDevice{
                      device: "/dev/vdb",
                      status: "healthy"
                    }
                  ],
                  secondary_sync_state: "SOK",
                  sr_health_state: "4",
                  stopped_resources: [
                    %HanaClusterDetails.Resource{
                      fail_count: nil,
                      id: "test-stop",
                      role: "Stopped",
                      status: nil,
                      type: "ocf::heartbeat:Dummy"
                    },
                    %HanaClusterDetails.Resource{
                      fail_count: nil,
                      id: "clusterfs",
                      role: "Stopped",
                      status: nil,
                      type: "ocf::heartbeat:Filesystem"
                    },
                    %HanaClusterDetails.Resource{
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
                type: :hana_scale_up
              }} ==
               "ha_cluster_discovery_hana_scale_up"
               |> load_discovery_event_fixture()
               |> Discovery.handle_discovery_event()
    end
  end

  describe "sap_system_discovery" do
    test "sap_system_discovery payload of type database should return the expected commands" do
      assert {:ok,
              [
                %RegisterDatabaseInstance{
                  features: "HDB|HDB_WORKER",
                  host_id: "779cdd70-e9e2-58ca-b18a-bf3eb3f71244",
                  instance_number: "00",
                  sap_system_id: "97c4127a-29bc-5315-82bd-8f154bee626f",
                  sid: "PRD",
                  tenant: "PRD",
                  health: :passing
                }
              ]} =
               "sap_system_discovery_database"
               |> load_discovery_event_fixture()
               |> Discovery.handle_discovery_event()
    end

    test "sap_system_discovery payload of type application parsing should return the expected commands" do
      assert {:ok,
              [
                %RegisterApplicationInstance{
                  db_host: "10.74.1.12",
                  features: "ABAP|GATEWAY|ICMAN|IGS",
                  host_id: "779cdd70-e9e2-58ca-b18a-bf3eb3f71244",
                  instance_number: "02",
                  sap_system_id: nil,
                  sid: "HA1",
                  tenant: "PRD",
                  health: :passing
                }
              ]} =
               "sap_system_discovery_application"
               |> load_discovery_event_fixture()
               |> Discovery.handle_discovery_event()
    end
  end
end
