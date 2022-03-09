defmodule Tronto.Monitoring.Integration.DiscoveryTest do
  use ExUnit.Case

  import Tronto.DiscoveryFixturesHelper

  alias Tronto.Monitoring.Integration.Discovery

  alias Tronto.Monitoring.Domain.AzureProvider
  alias Tronto.Monitoring.Domain.Commands.UpdateProvider

  describe "cloud_discovery" do
    test "cloud_discovery payload with azure provider should return the expected commands" do
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
                   provider: "azure",
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

    test "cloud_discovery payload with unknown provider should return the expected commands" do
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
end
