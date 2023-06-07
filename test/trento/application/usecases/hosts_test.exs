defmodule Trento.HostsTest do
  use ExUnit.Case
  use Trento.DataCase

  import Trento.Factory
  import Mox

  alias Trento.Hosts
  alias Trento.Repo

  alias Trento.SlesSubscriptionReadModel

  @moduletag :integration

  setup :verify_on_exit!

  describe "SLES Subscriptions" do
    test "No SLES4SAP Subscriptions detected" do
      assert 0 = SlesSubscriptionReadModel |> Repo.all() |> length()
      assert 0 = Hosts.get_all_sles_subscriptions()
    end

    test "Detects the correct number of SLES4SAP Subscriptions" do
      insert_list(6, :sles_subscription, identifier: "SLES_SAP")
      insert_list(6, :sles_subscription, identifier: "sle-module-server-applications")

      assert 12 = SlesSubscriptionReadModel |> Repo.all() |> length()
      assert 6 = Hosts.get_all_sles_subscriptions()
    end
  end

  describe "get_all_hosts/0" do
    test "should list all hosts except the deregistered ones" do
      registered_hosts = Enum.map(0..9, fn i -> insert(:host, hostname: "hostname_#{i}") end)
      deregistered_host = insert(:host, deregistered_at: DateTime.utc_now())

      hosts = Hosts.get_all_hosts()
      hosts_ids = Enum.map(hosts, & &1.id)

      assert Enum.map(registered_hosts, & &1.id) == hosts_ids
      refute deregistered_host.id in hosts_ids
    end
  end
end
