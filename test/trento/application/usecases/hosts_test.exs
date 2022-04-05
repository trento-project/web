defmodule Trento.HostsTest do
  use ExUnit.Case
  use Trento.DataCase

  import Trento.Factory

  alias Trento.Hosts
  alias Trento.Repo

  alias Trento.SlesSubscriptionReadModel

  @moduletag :integration

  describe "SLES Subscriptions" do
    test "No SLES4SAP Subscriptions detected" do
      assert 0 = Repo.all(SlesSubscriptionReadModel) |> length
      assert 0 = Hosts.get_all_sles_subscriptions()
    end

    test "Detects the correct number of SLES4SAP Subscriptions" do
      0..5
      |> Enum.map(fn _ ->
        subscription_projection(identifier: "SLES_SAP")
        subscription_projection(identifier: "sle-module-server-applications")
      end)

      assert 12 = SlesSubscriptionReadModel |> Repo.all() |> length()
      assert 6 = Hosts.get_all_sles_subscriptions()
    end
  end

  describe "Connection settings" do
    test "Returns connection settings map" do
      host_id = Faker.UUID.v4()
      host_projection(id: host_id, ssh_address: "192.168.1.1")

      host_connection_settings_projection(id: host_id, user: "root")

      assert %{host_id: host_id, ssh_address: "192.168.1.1", user: "root"} ==
               Hosts.get_connection_settings(host_id)
    end
  end
end
