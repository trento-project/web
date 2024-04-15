defmodule Trento.SoftwareUpdates.DiscoveryTest do
  use ExUnit.Case
  use Trento.DataCase

  import Mox

  import Trento.Factory

  alias Trento.Hosts.Commands.{
    ClearSoftwareUpdatesDiscovery,
    CompleteSoftwareUpdatesDiscovery,
    DiscoverSoftwareUpdates
  }

  alias Trento.SoftwareUpdates.Discovery
  alias Trento.SoftwareUpdates.Discovery.Mock, as: SoftwareUpdatesDiscoveryMock

  require Trento.SoftwareUpdates.Enums.AdvisoryType, as: AdvisoryType

  setup :verify_on_exit!

  describe "Discovering software updates for a specific host" do
    test "should return an error when a null FQDN is provided" do
      host_id = Faker.UUID.v4()

      assert {:error, :host_without_fqdn} =
               Discovery.discover_host_software_updates(host_id, nil)
    end

    test "should handle failure when getting host's system id" do
      host_id = Faker.UUID.v4()
      fully_qualified_domain_name = Faker.Internet.domain_name()

      discovery_error = {:error, :some_error_while_getting_system_id}

      fail_on_getting_system_id(fully_qualified_domain_name, discovery_error)

      {:error, ^discovery_error} =
        Discovery.discover_host_software_updates(host_id, fully_qualified_domain_name)
    end

    test "should handle failure when getting relevant patches" do
      host_id = Faker.UUID.v4()
      fully_qualified_domain_name = Faker.Internet.domain_name()
      system_id = 100
      discovery_error = {:error, :some_error_while_getting_relevant_patches}

      fail_on_getting_relevant_patches(fully_qualified_domain_name, system_id, discovery_error)

      {:error, ^discovery_error} =
        Discovery.discover_host_software_updates(host_id, fully_qualified_domain_name)
    end

    test "should handle failure when dispatching discovery completion command" do
      host_id = Faker.UUID.v4()
      fully_qualified_domain_name = Faker.Internet.domain_name()
      system_id = 100
      dispatching_error = {:error, :error_while_dispatching_completion_command}

      fail_on_dispatching_completion_command(
        host_id,
        fully_qualified_domain_name,
        system_id,
        dispatching_error
      )

      {:error, ^dispatching_error} =
        Discovery.discover_host_software_updates(host_id, fully_qualified_domain_name)
    end
  end

  describe "Discovering software updates for a collection of hosts" do
    test "should handle empty hosts list" do
      expect(
        Trento.Commanded.Mock,
        :dispatch,
        0,
        fn _ -> :ok end
      )

      assert :ok = Discovery.discover_software_updates()
    end

    test "should issue software updates discovery in a best effort fashion" do
      %{id: host_id1} = insert(:host, hostname: "host1")
      %{id: host_id2} = insert(:host, hostname: "host2")
      %{id: host_id3} = insert(:host, hostname: "host3")

      insert(:host,
        hostname: "host4",
        deregistered_at: DateTime.to_iso8601(Faker.DateTime.backward(2))
      )

      %{id: host_id5} = insert(:host, hostname: "host5", fully_qualified_domain_name: nil)

      {:ok, _} = Agent.start_link(fn -> 0 end, name: :command_dispatching_iteration)

      expect(
        Trento.Commanded.Mock,
        :dispatch,
        4,
        fn command ->
          iteration = Agent.get(:command_dispatching_iteration, & &1)

          dispatching_result =
            case iteration do
              0 ->
                assert %DiscoverSoftwareUpdates{
                         host_id: ^host_id1
                       } = command

                :ok

              1 ->
                assert %DiscoverSoftwareUpdates{
                         host_id: ^host_id2
                       } = command

                :ok

              2 ->
                assert %DiscoverSoftwareUpdates{
                         host_id: ^host_id3
                       } = command

                {:error, :some_error}

              3 ->
                assert %DiscoverSoftwareUpdates{
                         host_id: ^host_id5
                       } = command

                :ok
            end

          Agent.update(:command_dispatching_iteration, &(&1 + 1))

          dispatching_result
        end
      )

      assert :ok = Discovery.discover_software_updates()
    end
  end

  describe "Clearing up software updates discoveries" do
    test "should pass through an empty hosts list" do
      expect(Trento.SoftwareUpdates.Discovery.Mock, :clear, 0, fn -> :ok end)

      assert :ok = Discovery.clear_software_updates_discoveries()
    end

    test "should clear software updates for all registered hosts in a best effort fashion" do
      %{id: host_id1} = insert(:host)
      %{id: host_id2} = insert(:host)
      %{id: host_id3} = insert(:host, fully_qualified_domain_name: nil)

      expect(
        Trento.Commanded.Mock,
        :dispatch,
        3,
        fn %ClearSoftwareUpdatesDiscovery{host_id: host_id} ->
          assert host_id in [host_id1, host_id2, host_id3]

          case host_id do
            ^host_id2 -> {:error, :some_error}
            _ -> :ok
          end
        end
      )

      expect(Trento.SoftwareUpdates.Discovery.Mock, :clear, 1, fn -> :ok end)

      assert :ok = Discovery.clear_software_updates_discoveries()
    end
  end

  defp fail_on_getting_system_id(fully_qualified_domain_name, discovery_error) do
    expect(
      SoftwareUpdatesDiscoveryMock,
      :get_system_id,
      fn ^fully_qualified_domain_name -> discovery_error end
    )

    expect(
      SoftwareUpdatesDiscoveryMock,
      :get_relevant_patches,
      0,
      fn _ -> :ok end
    )

    expect(
      Trento.Commanded.Mock,
      :dispatch,
      0,
      fn _ -> :ok end
    )
  end

  defp fail_on_getting_relevant_patches(fully_qualified_domain_name, system_id, discovery_error) do
    expect(
      SoftwareUpdatesDiscoveryMock,
      :get_system_id,
      fn ^fully_qualified_domain_name -> {:ok, system_id} end
    )

    expect(
      SoftwareUpdatesDiscoveryMock,
      :get_relevant_patches,
      fn ^system_id -> discovery_error end
    )

    expect(
      Trento.Commanded.Mock,
      :dispatch,
      0,
      fn _ -> :ok end
    )
  end

  defp fail_on_dispatching_completion_command(
         host_id,
         fully_qualified_domain_name,
         system_id,
         dispatching_error
       ) do
    expect(
      SoftwareUpdatesDiscoveryMock,
      :get_system_id,
      fn ^fully_qualified_domain_name -> {:ok, system_id} end
    )

    expect(
      SoftwareUpdatesDiscoveryMock,
      :get_relevant_patches,
      fn ^system_id -> {:ok, [%{advisory_type: AdvisoryType.security_advisory()}]} end
    )

    expect(
      Trento.Commanded.Mock,
      :dispatch,
      fn %CompleteSoftwareUpdatesDiscovery{host_id: ^host_id} -> dispatching_error end
    )
  end
end
