defmodule Tronto.Monitoring.Integration.DiscoveryTest do
  use ExUnit.Case

  import Tronto.DiscoveryFixturesHelper

  alias Tronto.Monitoring.Integration.Discovery

  alias Tronto.Monitoring.Domain.Commands.UpdateProvider

  describe "cloud_discovery" do
    test "cloud_discovery payload with azure provider should return the expected commands" do
      assert {
               :ok,
               %Tronto.Monitoring.Domain.Commands.UpdateProvider{
                 host_id: "0a055c90-4cb6-54ce-ac9c-ae3fedaf40d4",
                 provider: "azure"
               }
             } =
               "cloud_discovery_azure"
               |> load_discovery_event_fixture()
               |> Discovery.handle_discovery_event()
    end
  end
end
