defmodule Trento.SoftwareUpdates.DiscoveryTest do
  use ExUnit.Case
  use Trento.DataCase

  import Mox

  import Trento.Factory

  alias Trento.Hosts.Commands.{
    ClearSoftwareUpdatesDiscovery,
    CompleteSoftwareUpdatesDiscovery
  }

  alias Trento.Hosts.ValueObjects.RelevantPatches
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
      assert {:ok, {[], []}} = Discovery.discover_software_updates()
    end

    test "should handle hosts without fqdn" do
      %{id: host_id1} = insert(:host, fully_qualified_domain_name: nil)
      %{id: host_id2} = insert(:host, fully_qualified_domain_name: nil)

      {:ok, {[], errored_discoveries}} = Discovery.discover_software_updates()

      Enum.each([host_id1, host_id2], fn host_id ->
        assert {:error, host_id, :host_without_fqdn} in errored_discoveries
      end)
    end

    test "should handle errors when getting a system id" do
      %{id: host_id, fully_qualified_domain_name: fully_qualified_domain_name} = insert(:host)

      discovery_error = {:error, :some_error_while_getting_system_id}

      fail_on_getting_system_id(fully_qualified_domain_name, discovery_error)

      {:ok, {[], errored_discoveries}} = Discovery.discover_software_updates()

      assert {:error, host_id, discovery_error} in errored_discoveries
    end

    test "should handle errors when getting relevant patches" do
      %{id: host_id, fully_qualified_domain_name: fully_qualified_domain_name} = insert(:host)

      system_id = 100
      discovery_error = {:error, :some_error_while_getting_relevant_patches}

      fail_on_getting_relevant_patches(fully_qualified_domain_name, system_id, discovery_error)

      {:ok, {[], errored_discoveries}} = Discovery.discover_software_updates()

      assert {:error, host_id, discovery_error} in errored_discoveries
    end

    test "should handle errors when dispatching discovery completion command" do
      %{id: host_id, fully_qualified_domain_name: fully_qualified_domain_name} = insert(:host)

      system_id = 100

      dispatching_error = {:error, :error_while_dispatching_completion_command}

      fail_on_dispatching_completion_command(
        host_id,
        fully_qualified_domain_name,
        system_id,
        dispatching_error
      )

      {:ok, {[], errored_discoveries}} = Discovery.discover_software_updates()

      assert {:error, host_id, dispatching_error} in errored_discoveries
    end

    test "should complete discovery" do
      %{id: host_id1, fully_qualified_domain_name: fully_qualified_domain_name1} =
        insert(:host, hostname: "host1")

      %{id: host_id2, fully_qualified_domain_name: fully_qualified_domain_name2} =
        insert(:host, hostname: "host2")

      %{id: host_id3, fully_qualified_domain_name: fully_qualified_domain_name3} =
        insert(:host, hostname: "host3")

      %{id: host_id4} = insert(:host, fully_qualified_domain_name: nil)

      system_id1 = 100
      system_id2 = 101
      system_id3 = 102

      fqdns_map = %{
        fully_qualified_domain_name1 => system_id1,
        fully_qualified_domain_name2 => system_id2,
        fully_qualified_domain_name3 => system_id3
      }

      discovered_relevant_patches = [
        %{advisory_type: AdvisoryType.security_advisory()},
        %{advisory_type: AdvisoryType.security_advisory()},
        %{advisory_type: AdvisoryType.bugfix()},
        %{advisory_type: AdvisoryType.enhancement()}
      ]

      systems_map = %{
        system_id1 => {:ok, discovered_relevant_patches},
        system_id2 => {:error, :some_error},
        system_id3 => {:ok, discovered_relevant_patches}
      }

      expected_relevant_patches = %RelevantPatches{
        security_advisories: 2,
        bug_fixes: 1,
        software_enhancements: 1
      }

      expected_commands = %{
        host_id1 => %CompleteSoftwareUpdatesDiscovery{
          host_id: host_id1,
          relevant_patches: expected_relevant_patches
        },
        host_id3 => %CompleteSoftwareUpdatesDiscovery{
          host_id: host_id3,
          relevant_patches: expected_relevant_patches
        }
      }

      expect(
        SoftwareUpdatesDiscoveryMock,
        :get_system_id,
        3,
        fn fqdn ->
          system_id = Map.get(fqdns_map, fqdn)

          {:ok, system_id}
        end
      )

      expect(
        SoftwareUpdatesDiscoveryMock,
        :get_relevant_patches,
        3,
        fn system_id ->
          Map.get(systems_map, system_id)
        end
      )

      expect(
        Trento.Commanded.Mock,
        :dispatch,
        2,
        fn %{host_id: host_id} = command ->
          assert Map.get(expected_commands, host_id) == command

          :ok
        end
      )

      assert {:ok, {successful_discoveries, errored_discoveries}} =
               Discovery.discover_software_updates()

      assert length(successful_discoveries) == 2
      assert length(errored_discoveries) == 2

      assert [
               {:ok, host_id1, system_id1, discovered_relevant_patches},
               {:ok, host_id3, system_id3, discovered_relevant_patches}
             ] ==
               successful_discoveries

      assert {:error, host_id2, {:error, :some_error}} in errored_discoveries
      assert {:error, host_id4, :host_without_fqdn} in errored_discoveries
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
