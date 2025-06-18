defmodule Trento.Discovery.Policies.HostPolicyTest do
  use ExUnit.Case
  use Trento.DataCase
  import Trento.DiscoveryFixturesHelper

  require Trento.Enums.Provider, as: Provider
  require Trento.Enums.Architecture, as: Architecture

  alias Trento.Discovery.Policies.HostPolicy

  alias Trento.Hosts.Commands.{
    RegisterHost,
    UpdateProvider,
    UpdateSaptuneStatus,
    UpdateSlesSubscriptions
  }

  alias Trento.Hosts.ValueObjects.{
    AwsProvider,
    AzureProvider,
    GcpProvider
  }

  alias Trento.Hosts.ValueObjects.{
    SaptuneNote,
    SaptuneServiceStatus,
    SaptuneSolution,
    SaptuneStaging,
    SaptuneStatus,
    SlesSubscription
  }

  test "should return the expected commands when a host_discovery payload is handled" do
    assert {
             :ok,
             %RegisterHost{
               agent_version: "0.1.0",
               arch: Architecture.x86_64(),
               host_id: "779cdd70-e9e2-58ca-b18a-bf3eb3f71244",
               hostname: "suse",
               ip_addresses: ["10.1.1.4/16", "10.1.1.5/24", "10.1.1.6/32"],
               installation_source: :unknown,
               prometheus_targets: nil
             }
           } =
             "host_discovery"
             |> load_discovery_event_fixture()
             |> HostPolicy.handle()
  end

  test "should return the expected commands when a host_discovery payload without architecture is handled" do
    assert {
             :ok,
             %RegisterHost{
               agent_version: "0.1.0",
               arch: Architecture.unknown(),
               host_id: "779cdd70-e9e2-58ca-b18a-bf3eb3f71244",
               hostname: "suse",
               ip_addresses: ["10.1.1.4/16", "10.1.1.5/24", "10.1.1.6/32"],
               installation_source: :unknown,
               prometheus_targets: nil
             }
           } =
             "host_discovery_without_arch"
             |> load_discovery_event_fixture()
             |> HostPolicy.handle()
  end

  test "should return the expected commands when a host_discovery_with_installation_source payload is handled" do
    assert {
             :ok,
             %RegisterHost{
               agent_version: "0.1.0",
               host_id: "779cdd70-e9e2-58ca-b18a-bf3eb3f71244",
               hostname: "suse",
               ip_addresses: ["10.1.1.4/16", "10.1.1.5/24", "10.1.1.6/32"],
               installation_source: :community
             }
           } =
             "host_discovery_with_installation_source"
             |> load_discovery_event_fixture()
             |> HostPolicy.handle()
  end

  test "should return the expected commands when a host_discovery payload without netmasks is handled" do
    assert {
             :ok,
             %RegisterHost{
               ip_addresses: ["10.1.1.4", "10.1.1.5", "10.1.1.6"]
             }
           } =
             "host_discovery"
             |> load_discovery_event_fixture()
             |> pop_in(["payload", "netmasks"])
             |> elem(1)
             |> HostPolicy.handle()
  end

  test "should return the expected commands when a host_discovery payload with prometheus_targets is handled" do
    assert {
             :ok,
             %RegisterHost{
               host_id: "779cdd70-e9e2-58ca-b18a-bf3eb3f71244",
               prometheus_targets: %{
                 "node_exporter" => "10.0.0.1:9100",
                 "ha_cluster_exporter" => "10.0.0.1:9664"
               }
             }
           } =
             "host_discovery_with_prometheus_targets"
             |> load_discovery_event_fixture()
             |> HostPolicy.handle()
  end

  test "should return the expected commands when a cloud_discovery payload with an azure provider is handled" do
    assert {
             :ok,
             %UpdateProvider{
               host_id: "0a055c90-4cb6-54ce-ac9c-ae3fedaf40d4",
               provider: Provider.azure(),
               provider_data: %AzureProvider{
                 vm_name: "vmhdbdev01",
                 data_disk_number: 7,
                 location: "westeurope",
                 offer: "sles-sap-15-sp3-byos",
                 resource_group: "resourceGroupName",
                 sku: "gen2",
                 vm_size: "Standard_E4s_v3",
                 admin_username: "cloudadmin"
               }
             }
           } ==
             "cloud_discovery_azure"
             |> load_discovery_event_fixture()
             |> HostPolicy.handle()
  end

  test "should return the expected commands when a cloud_discovery payload with an aws provider is handled" do
    assert {
             :ok,
             %UpdateProvider{
               host_id: "0a055c90-4cb6-54ce-ac9c-ae3fedaf40d4",
               provider: Provider.aws(),
               provider_data: %AwsProvider{
                 account_id: "12345",
                 ami_id: "ami-12345",
                 availability_zone: "eu-west-1a",
                 data_disk_number: 1,
                 instance_id: "i-12345",
                 instance_type: "t3.micro",
                 region: "eu-west-1",
                 vpc_id: "vpc-12345"
               }
             }
           } ==
             "cloud_discovery_aws"
             |> load_discovery_event_fixture()
             |> HostPolicy.handle()
  end

  test "should return the expected commands when a cloud_discovery payload with an gcp provider is handled" do
    assert {
             :ok,
             %UpdateProvider{
               host_id: "0a055c90-4cb6-54ce-ac9c-ae3fedaf40d4",
               provider: Provider.gcp(),
               provider_data: %GcpProvider{
                 disk_number: 4,
                 image: "sles-15-sp1-sap-byos-v20220126",
                 instance_name: "vmhana01",
                 machine_type: "n1-highmem-8",
                 network: "network",
                 project_id: "123456",
                 zone: "europe-west1-b"
               }
             }
           } ==
             "cloud_discovery_gcp"
             |> load_discovery_event_fixture()
             |> HostPolicy.handle()
  end

  test "should return the expected commands when a cloud_discovery payload with an kvm provider is handled" do
    assert {
             :ok,
             %UpdateProvider{
               host_id: "0a055c90-4cb6-54ce-ac9c-ae3fedaf40d4",
               provider: Provider.kvm()
             }
           } ==
             "cloud_discovery_kvm"
             |> load_discovery_event_fixture()
             |> HostPolicy.handle()
  end

  test "should return the expected commands when a cloud_discovery payload with a vmware provider is handled" do
    assert {
             :ok,
             %UpdateProvider{
               host_id: "0a055c90-4cb6-54ce-ac9c-ae3fedaf40d4",
               provider: Provider.vmware()
             }
           } ==
             "cloud_discovery_vmware"
             |> load_discovery_event_fixture()
             |> HostPolicy.handle()
  end

  test "should return the expected commands when a cloud_discovery payload with an nutanix provider is handled" do
    assert {
             :ok,
             %UpdateProvider{
               host_id: "0a055c90-4cb6-54ce-ac9c-ae3fedaf40d4",
               provider: :nutanix
             }
           } ==
             "cloud_discovery_nutanix"
             |> load_discovery_event_fixture()
             |> HostPolicy.handle()
  end

  test "should return the expected commands when a cloud_discovery payload with an unknown provider is handled" do
    assert {
             :ok,
             %UpdateProvider{
               host_id: "0a055c90-4cb6-54ce-ac9c-ae3fedaf40d4",
               provider: Provider.unknown(),
               provider_data: nil
             }
           } =
             "cloud_discovery_unknown"
             |> load_discovery_event_fixture()
             |> HostPolicy.handle()
  end

  test "should return the expected commands when a subscription_discovery payload is handled" do
    assert {
             :ok,
             %UpdateSlesSubscriptions{
               host_id: "0fc07435-7ee2-54ca-b0de-fb27ffdc5deb",
               subscriptions: [
                 %SlesSubscription{
                   arch: "x86_64",
                   expires_at: "2026-10-18 06:23:46 UTC",
                   host_id: "0fc07435-7ee2-54ca-b0de-fb27ffdc5deb",
                   identifier: "SLES_SAP",
                   starts_at: "2021-10-18 06:23:46 UTC",
                   status: "Registered",
                   subscription_status: "ACTIVE",
                   type: "internal",
                   version: "15.3"
                 },
                 %SlesSubscription{
                   arch: "x86_64",
                   expires_at: nil,
                   host_id: "0fc07435-7ee2-54ca-b0de-fb27ffdc5deb",
                   identifier: "sle-module-basesystem",
                   starts_at: nil,
                   status: "Registered",
                   subscription_status: nil,
                   type: nil,
                   version: "15.3"
                 },
                 %SlesSubscription{
                   arch: "x86_64",
                   expires_at: nil,
                   host_id: "0fc07435-7ee2-54ca-b0de-fb27ffdc5deb",
                   identifier: "sle-module-desktop-applications",
                   starts_at: nil,
                   status: "Registered",
                   subscription_status: nil,
                   type: nil,
                   version: "15.3"
                 },
                 %SlesSubscription{
                   arch: "x86_64",
                   expires_at: nil,
                   host_id: "0fc07435-7ee2-54ca-b0de-fb27ffdc5deb",
                   identifier: "sle-module-server-applications",
                   starts_at: nil,
                   status: "Registered",
                   subscription_status: nil,
                   type: nil,
                   version: "15.3"
                 },
                 %SlesSubscription{
                   arch: "x86_64",
                   expires_at: "2026-10-18 06:23:46 UTC",
                   host_id: "0fc07435-7ee2-54ca-b0de-fb27ffdc5deb",
                   identifier: "sle-ha",
                   starts_at: "2021-10-18 06:23:46 UTC",
                   status: "Registered",
                   subscription_status: "ACTIVE",
                   type: "internal",
                   version: "15.3"
                 },
                 %SlesSubscription{
                   arch: "x86_64",
                   expires_at: nil,
                   host_id: "0fc07435-7ee2-54ca-b0de-fb27ffdc5deb",
                   identifier: "sle-module-sap-applications",
                   starts_at: nil,
                   status: "Registered",
                   subscription_status: nil,
                   type: nil,
                   version: "15.3"
                 },
                 %SlesSubscription{
                   arch: "x86_64",
                   expires_at: nil,
                   host_id: "0fc07435-7ee2-54ca-b0de-fb27ffdc5deb",
                   identifier: "sle-module-public-cloud",
                   starts_at: nil,
                   status: "Registered",
                   subscription_status: nil,
                   type: nil,
                   version: "15.3"
                 }
               ]
             }
           } =
             "subscriptions_discovery"
             |> load_discovery_event_fixture()
             |> HostPolicy.handle()
  end

  test "should emit update saptune command when a saptune_discovery is received with status nil" do
    assert {
             :ok,
             %UpdateSaptuneStatus{
               host_id: "9cd46919-5f19-59aa-993e-cf3736c71053",
               saptune_installed: true,
               package_version: "3.0.0",
               sap_running: true,
               status: nil
             }
           } =
             "saptune_discovery_empty_status"
             |> load_discovery_event_fixture()
             |> HostPolicy.handle(true)
  end

  test "should fail the validation of the saptune payload, when the payload is received malformed" do
    assert {
             :error,
             {:validation, %{result: ["can't be blank"]}}
           } =
             "saptune_discovery_empty_result"
             |> load_discovery_event_fixture()
             |> HostPolicy.handle(true)
  end

  test "should emit update saptune command when a saptune_discovery is received" do
    assert {
             :ok,
             %UpdateSaptuneStatus{
               host_id: "9cd46919-5f19-59aa-993e-cf3736c71053",
               saptune_installed: true,
               package_version: "3.1.0",
               sap_running: false,
               status: %SaptuneStatus{
                 package_version: "3.1.0",
                 configured_version: "3",
                 tuning_state: "not compliant",
                 services: [
                   %SaptuneServiceStatus{
                     name: "sapconf",
                     enabled: nil,
                     active: nil
                   },
                   %SaptuneServiceStatus{
                     name: "saptune",
                     enabled: "enabled",
                     active: "active"
                   },
                   %SaptuneServiceStatus{
                     name: "tuned",
                     enabled: nil,
                     active: nil
                   }
                 ],
                 enabled_notes: [
                   %SaptuneNote{id: "941735", additionally_enabled: true},
                   %SaptuneNote{id: "1771258", additionally_enabled: true},
                   %SaptuneNote{id: "2578899", additionally_enabled: false},
                   %SaptuneNote{id: "2993054", additionally_enabled: false},
                   %SaptuneNote{id: "1656250", additionally_enabled: false},
                   %SaptuneNote{id: "900929", additionally_enabled: false}
                 ],
                 applied_notes: [
                   %SaptuneNote{id: "941735", additionally_enabled: true},
                   %SaptuneNote{id: "1771258", additionally_enabled: true},
                   %SaptuneNote{id: "2578899", additionally_enabled: false},
                   %SaptuneNote{id: "2993054", additionally_enabled: false},
                   %SaptuneNote{id: "1656250", additionally_enabled: false},
                   %SaptuneNote{id: "900929", additionally_enabled: false}
                 ],
                 enabled_solution: %SaptuneSolution{
                   id: "NETWEAVER",
                   notes: ["941735", "1771258", "2578899", "2993054", "1656250", "900929"],
                   partial: false
                 },
                 applied_solution: %SaptuneSolution{
                   id: "NETWEAVER",
                   notes: ["941735", "1771258", "2578899", "2993054", "1656250", "900929"],
                   partial: false
                 },
                 staging: %SaptuneStaging{
                   enabled: false,
                   notes: [],
                   solutions_ids: []
                 }
               }
             }
           } =
             "saptune_discovery"
             |> load_discovery_event_fixture()
             |> HostPolicy.handle(false)
  end

  test "should emit update saptune command when a saptune_discovery without configuration is received" do
    assert {
             :ok,
             %UpdateSaptuneStatus{
               host_id: "9cd46919-5f19-59aa-993e-cf3736c71053",
               saptune_installed: true,
               package_version: "3.1.0",
               sap_running: true,
               status: %SaptuneStatus{
                 package_version: "3.1.0",
                 configured_version: "3",
                 tuning_state: "not tuned",
                 services: [
                   %SaptuneServiceStatus{
                     name: "sapconf",
                     enabled: nil,
                     active: nil
                   },
                   %SaptuneServiceStatus{
                     name: "saptune",
                     enabled: "disabled",
                     active: "inactive"
                   },
                   %SaptuneServiceStatus{
                     name: "tuned",
                     enabled: "disabled",
                     active: "inactive"
                   }
                 ],
                 enabled_notes: [],
                 applied_notes: [],
                 enabled_solution: nil,
                 applied_solution: nil,
                 staging: %SaptuneStaging{
                   enabled: false,
                   notes: [],
                   solutions_ids: []
                 }
               }
             }
           } =
             "saptune_discovery_not_configured"
             |> load_discovery_event_fixture()
             |> HostPolicy.handle(true)
  end
end
