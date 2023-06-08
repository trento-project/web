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

      last_heartbeats =
        Enum.map(registered_hosts, fn %Trento.HostReadModel{id: id} ->
          insert(:heartbeat, agent_id: id)
        end)

      deregistered_host = insert(:host, deregistered_at: DateTime.utc_now())

      hosts = Hosts.get_all_hosts()
      hosts_ids = Enum.map(hosts, & &1.id)

      assert Enum.map(registered_hosts, & &1.id) == hosts_ids

      assert Enum.map(hosts, & &1.last_heartbeat_timestamp) ==
               Enum.map(last_heartbeats, & &1.timestamp)

      refute deregistered_host.id in hosts_ids
    end
  end

  describe "get_host_by_id/1" do
    test "should return host" do
      %Trento.HostReadModel{id: id} = insert(:host)
      %Trento.Heartbeat{timestamp: timestamp} = insert(:heartbeat, agent_id: id)

      host = Hosts.get_host_by_id(id)

      assert host.id == id
      assert host.last_heartbeat_timestamp == timestamp
    end

    test "should return nil if host does not exist" do
      host = Hosts.get_host_by_id(UUID.uuid4())

      assert host == nil
    end
  end
end
