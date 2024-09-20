defmodule Trento.HostsTest do
  use ExUnit.Case
  use Trento.DataCase

  import ExUnit.CaptureLog
  import Trento.Factory
  import Mox

  alias Trento.Hosts.Commands.SelectHostChecks

  alias Trento.Heartbeats.Heartbeat
  alias Trento.{Hosts, Repo}

  alias Trento.Hosts.Projections.{
    HostReadModel,
    SlesSubscriptionReadModel
  }

  alias Trento.Checks.V1.{
    ExecutionRequested,
    Target
  }

  require Logger

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
        Enum.map(registered_hosts, fn %HostReadModel{id: id} ->
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
      %HostReadModel{id: id} = insert(:host)
      %Heartbeat{timestamp: timestamp} = insert(:heartbeat, agent_id: id)

      host = Hosts.get_host_by_id(id)

      assert host.id == id
      assert host.last_heartbeat_timestamp == timestamp
    end

    test "should return nil if host is deregistered" do
      %HostReadModel{id: id} = insert(:host, deregistered_at: DateTime.utc_now())

      host = Hosts.get_host_by_id(id)

      assert host == nil
    end

    test "should return nil if host does not exist" do
      host = Hosts.get_host_by_id(UUID.uuid4())

      assert host == nil
    end
  end

  describe "retrieving a host by identifier" do
    test "should not return a non existent host" do
      assert {:error, :not_found} == Hosts.by_id(Faker.UUID.v4())
    end

    test "should return an existent host, whether it is registered or not" do
      %{id: registered_host_id} = insert(:host)

      %{id: deregistered_host_id} =
        insert(:host, deregistered_at: Faker.DateTime.backward(1))

      for host_id <- [registered_host_id, deregistered_host_id] do
        assert {:ok, %HostReadModel{id: ^host_id}} = Hosts.by_id(host_id)
      end
    end
  end

  describe "Check Selection" do
    test "should dispatch command on Check Selection" do
      host_id = Faker.UUID.v4()
      selected_checks = Enum.map(0..4, fn _ -> Faker.UUID.v4() end)

      expect(
        Trento.Commanded.Mock,
        :dispatch,
        fn %SelectHostChecks{
             host_id: ^host_id,
             checks: ^selected_checks
           } ->
          :ok
        end
      )

      assert :ok = Hosts.select_checks(host_id, selected_checks)
    end

    test "should return command dispatching error" do
      host_id = Faker.UUID.v4()
      selected_checks = Enum.map(0..4, fn _ -> Faker.UUID.v4() end)

      expect(
        Trento.Commanded.Mock,
        :dispatch,
        fn %SelectHostChecks{
             host_id: ^host_id,
             checks: ^selected_checks
           } ->
          {:error, :some_error}
        end
      )

      assert {:error, :some_error} = Hosts.select_checks(host_id, selected_checks)
    end
  end

  describe "Checks Execution" do
    test "should start an execution" do
      %{id: host_id, provider: provider} = insert(:host)

      expect(Trento.Infrastructure.Messaging.Adapter.Mock, :publish, fn "executions", message ->
        assert message.group_id == host_id
        assert length(message.targets) == 1

        assert message.env == %{
                 "provider" => %{kind: {:string_value, Atom.to_string(provider)}}
               }

        assert message.target_type == "host"

        :ok
      end)

      assert :ok = Hosts.request_checks_execution(host_id)
    end

    test "should not start an execution for an unregistered host" do
      %{id: deregistered_host} = insert(:host, deregistered_at: DateTime.utc_now())

      for deregistered_host_id <- [deregistered_host, Faker.UUID.v4()] do
        expect(Trento.Infrastructure.Messaging.Adapter.Mock, :publish, 0, fn _, _ ->
          :ok
        end)

        assert {:error, :not_found} = Hosts.request_checks_execution(deregistered_host_id)
      end
    end

    test "should not start an execution with an empty selection" do
      %{id: host_id} = insert(:host, selected_checks: [])

      expect(Trento.Infrastructure.Messaging.Adapter.Mock, :publish, 0, fn _, _ ->
        :ok
      end)

      assert {:error, :no_checks_selected} = Hosts.request_checks_execution(host_id)
    end

    test "should return an error on message publishing failure" do
      %{id: host_id} = insert(:host)

      expect(Trento.Infrastructure.Messaging.Adapter.Mock, :publish, fn _, _ ->
        {:error, :amqp_error}
      end)

      assert {:error, :amqp_error} = Hosts.request_checks_execution(host_id)
    end

    test "should request host checks execution for hosts when checks are selected" do
      checks = [Faker.UUID.v4(), Faker.UUID.v4()]
      %{id: host_id1} = insert(:host, id: Faker.UUID.v4(), selected_checks: checks)

      %{id: host_id2} =
        insert(:host,
          selected_checks: checks,
          deregistered_at: DateTime.utc_now()
        )

      expect(Trento.Infrastructure.Messaging.Adapter.Mock, :publish, 1, fn "executions",
                                                                           %ExecutionRequested{
                                                                             group_id: ^host_id1,
                                                                             targets: [
                                                                               %Target{
                                                                                 agent_id:
                                                                                   ^host_id1,
                                                                                 checks: ^checks
                                                                               }
                                                                             ]
                                                                           } ->
        :ok
      end)

      expect(Trento.Infrastructure.Messaging.Adapter.Mock, :publish, 0, fn "executions",
                                                                           %ExecutionRequested{
                                                                             group_id: ^host_id2,
                                                                             targets: [
                                                                               %Target{
                                                                                 agent_id:
                                                                                   ^host_id2,
                                                                                 checks: ^checks
                                                                               }
                                                                             ]
                                                                           } ->
        :ok
      end)

      assert :ok = Hosts.request_hosts_checks_execution()
    end

    test "should log an error message when host checks execution is requested but no checks selected" do
      %{id: host_id} = insert(:host, selected_checks: [])

      expected_logger_message =
        "Failed to request checks execution, host: #{host_id}, reason: no_checks_selected"

      assert capture_log(fn -> Hosts.request_hosts_checks_execution() end) =~
               expected_logger_message
    end
  end
end
