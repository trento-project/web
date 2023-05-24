defmodule Trento.HostsTest do
  use ExUnit.Case
  use Trento.DataCase

  import Trento.Factory
  import Mox

  alias Trento.Hosts
  alias Trento.Repo

  alias Trento.SlesSubscriptionReadModel

  require Trento.Domain.Enums.Health, as: Health

  @moduletag :integration

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

  describe "deregister_host" do
    test "should deregister a host with unknown health" do
      expect(
        Trento.Commanded.Mock,
        :dispatch,
        fn %Trento.Domain.Commands.RequestHostDeregistration{} ->
          :ok
        end
      )

      %{id: id} = insert(:host, heartbeat: Health.unknown())
      assert :ok = Hosts.deregister_host(id)
    end

    test "should deregister a host with critical health" do
      expect(
        Trento.Commanded.Mock,
        :dispatch,
        fn %Trento.Domain.Commands.RequestHostDeregistration{} ->
          :ok
        end
      )

      %{id: id} = insert(:host, heartbeat: Health.critical())
      assert :ok = Hosts.deregister_host(id)
    end

    test "should not deregister a host with passing health" do
      expect(
        Trento.Commanded.Mock,
        :dispatch,
        fn %Trento.Domain.Commands.RequestHostDeregistration{} ->
          :error
        end
      )

      %{id: id} = insert(:host, heartbeat: Health.passing())
      assert :error = Hosts.deregister_host(id)
    end

    test "should return an error when the host does not exist" do
      assert {:error, :host_not_found} = Hosts.deregister_host(UUID.uuid4())
    end

    test "should return an error if deregistration requested within the debounce period" do
      last_heartbeat = DateTime.utc_now()

      expect(
        Trento.Support.DateService.Mock,
        :utc_now,
        fn -> last_heartbeat end
      )

      %{id: id} = insert(:host, heartbeat: Health.critical())
      insert(:heartbeat, agent_id: id, timestamp: Trento.Support.DateService.Mock.utc_now())

      expect(
        Trento.Support.DateService.Mock,
        :utc_now,
        fn -> DateTime.add(last_heartbeat, 500, :millisecond) end
      )

      assert {:error, :host_alive} = Hosts.deregister_host(id, Trento.Support.DateService.Mock)
    end
  end
end
