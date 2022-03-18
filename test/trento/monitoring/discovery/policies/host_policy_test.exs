defmodule Trento.Monitoring.Discovery.HostPolicyTest do
  use ExUnit.Case
  use Trento.DataCase

  import Trento.DiscoveryFixturesHelper

  alias Trento.Monitoring.Discovery.HostPolicy

  alias Trento.Monitoring.Domain.Commands.{
    RegisterHost,
    UpdateProvider,
    UpdateSlesSubscriptions
  }

  alias Trento.Monitoring.Domain.{
    AzureProvider,
    SlesSubscription
  }

  test "should return the expected commands when a host_discovery payload is handled" do
    assert {
             :ok,
             %RegisterHost{
               agent_version: "0.1.0",
               host_id: "779cdd70-e9e2-58ca-b18a-bf3eb3f71244",
               hostname: "suse",
               ip_addresses: ["10.1.1.4", "10.1.1.5", "10.1.1.6"]
             }
           } =
             "host_discovery"
             |> load_discovery_event_fixture()
             |> HostPolicy.handle()
  end

  test "should return the expected commands when a cloud_discovery payload with an azure provider is handled" do
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
             |> HostPolicy.handle()
  end

  test "should return the expected commands when a cloud_discovery payload with an unknown provider is handled" do
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
end
