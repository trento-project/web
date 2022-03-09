defmodule Tronto.Monitoring.Integration.SubscriptionsTest do
  use ExUnit.Case

  import Tronto.DiscoveryFixturesHelper

  alias Tronto.Monitoring.Domain.Commands.UpdateSlesSubscriptions
  alias Tronto.Monitoring.Domain.SlesSubscription

  alias Tronto.Monitoring.Integration.Discovery

  describe "subscription_discovery" do
    test "subscription_discovery payload should return the expected commands" do
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
               |> Discovery.handle_discovery_event()
    end
  end
end
