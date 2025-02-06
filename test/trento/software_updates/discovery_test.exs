defmodule Trento.SoftwareUpdates.DiscoveryTest do
  use ExUnit.Case
  use Trento.DataCase

  import Mox

  import Trento.Factory

  alias Trento.Hosts.Commands.{
    ClearSoftwareUpdatesDiscovery,
    CompleteSoftwareUpdatesDiscovery
  }

  alias Trento.SoftwareUpdates.Discovery
  alias Trento.SoftwareUpdates.Discovery.DiscoveryResult
  alias Trento.SoftwareUpdates.Discovery.Mock, as: SoftwareUpdatesDiscoveryMock

  require Trento.SoftwareUpdates.Enums.AdvisoryType, as: AdvisoryType
  require Trento.SoftwareUpdates.Enums.SoftwareUpdatesHealth, as: SoftwareUpdatesHealth

  setup :verify_on_exit!

  describe "Discovering software updates for a specific host" do
    test "should handle failures and track causing reasons" do
      scenarios = [
        %{
          name: "should return an error when a null FQDN is provided",
          host_id: Faker.UUID.v4(),
          fully_qualified_domain_name: nil,
          expected_error: :host_without_fqdn,
          expect_tracked_discovery: false
        },
        %{
          name: "should handle failure when getting host's system id",
          host_id: Faker.UUID.v4(),
          fully_qualified_domain_name: Faker.Internet.domain_name(),
          failure_setup: fn scenario ->
            fail_on_getting_system_id(
              scenario.host_id,
              scenario.fully_qualified_domain_name,
              scenario.expected_error
            )
          end,
          expected_error: :some_error_while_getting_system_id
        },
        %{
          name: "should handle failure when getting relevant patches",
          host_id: Faker.UUID.v4(),
          fully_qualified_domain_name: Faker.Internet.domain_name(),
          failure_setup: fn scenario ->
            fail_on_getting_relevant_patches(
              scenario.host_id,
              scenario.fully_qualified_domain_name,
              100,
              scenario.expected_error
            )
          end,
          expected_error: :some_error_while_getting_relevant_patches
        },
        %{
          name: "should handle failure when getting upgradable packages",
          host_id: Faker.UUID.v4(),
          fully_qualified_domain_name: Faker.Internet.domain_name(),
          failure_setup: fn scenario ->
            fail_on_getting_upgradable_packages(
              scenario.host_id,
              scenario.fully_qualified_domain_name,
              100,
              scenario.expected_error
            )
          end,
          expected_error: :some_error_while_getting_relevant_patches
        },
        %{
          name: "should handle failure when dispatching discovery completion command",
          host_id: Faker.UUID.v4(),
          fully_qualified_domain_name: Faker.Internet.domain_name(),
          failure_setup: fn scenario ->
            fail_on_dispatching_completion_command(
              scenario.host_id,
              scenario.fully_qualified_domain_name,
              100,
              scenario.expected_error
            )
          end,
          expected_error: :error_while_dispatching_completion_command
        }
      ]

      for %{
            host_id: host_id,
            fully_qualified_domain_name: fully_qualified_domain_name,
            expected_error: expected_error
          } = scenario <- scenarios do
        failure_setup = Map.get(scenario, :failure_setup, fn _ -> nil end)
        failure_setup.(scenario)

        {:error, ^expected_error} =
          Discovery.discover_host_software_updates(host_id, fully_qualified_domain_name)

        if Map.get(scenario, :expect_tracked_discovery, true) do
          stored_failure = Atom.to_string(expected_error)

          assert %DiscoveryResult{
                   host_id: ^host_id,
                   system_id: nil,
                   relevant_patches: [],
                   upgradable_packages: [],
                   failure_reason: ^stored_failure
                 } = Trento.Repo.get(DiscoveryResult, host_id)
        end
      end
    end

    test "should handle failure when SUMA settings are not configured" do
      host_id = Faker.UUID.v4()
      fully_qualified_domain_name = Faker.Internet.domain_name()

      expect(
        SoftwareUpdatesDiscoveryMock,
        :get_system_id,
        fn ^fully_qualified_domain_name -> {:error, :settings_not_configured} end
      )

      expect(
        Trento.Commanded.Mock,
        :dispatch,
        0,
        fn _ ->
          :ok
        end
      )

      {:error, :settings_not_configured} =
        Discovery.discover_host_software_updates(host_id, fully_qualified_domain_name)
    end

    test "should complete discovery" do
      scenarios = [
        %{
          discovered_relevant_patches: [
            build(:relevant_patch, advisory_type: AdvisoryType.security_advisory()),
            build(:relevant_patch, advisory_type: AdvisoryType.security_advisory()),
            build(:relevant_patch, advisory_type: AdvisoryType.bugfix()),
            build(:relevant_patch, advisory_type: AdvisoryType.enhancement())
          ],
          discovered_upgradable_packages: build_list(3, :upgradable_package),
          expected_health: SoftwareUpdatesHealth.critical()
        },
        %{
          discovered_relevant_patches: [
            build(:relevant_patch, advisory_type: AdvisoryType.bugfix()),
            build(:relevant_patch, advisory_type: AdvisoryType.enhancement())
          ],
          discovered_upgradable_packages: build_list(3, :upgradable_package),
          expected_health: SoftwareUpdatesHealth.warning()
        },
        %{
          discovered_relevant_patches: [
            build(:relevant_patch, advisory_type: AdvisoryType.enhancement())
          ],
          discovered_upgradable_packages: [],
          expected_health: SoftwareUpdatesHealth.warning()
        },
        %{
          discovered_relevant_patches: [
            build(:relevant_patch, advisory_type: AdvisoryType.bugfix())
          ],
          discovered_upgradable_packages: build_list(3, :upgradable_package),
          expected_health: SoftwareUpdatesHealth.warning()
        },
        %{
          discovered_relevant_patches: [],
          discovered_upgradable_packages: build_list(3, :upgradable_package),
          expected_health: SoftwareUpdatesHealth.passing()
        }
      ]

      for %{
            discovered_relevant_patches: discovered_relevant_patches,
            discovered_upgradable_packages: discovered_upgradable_packages,
            expected_health: expected_health
          } <- scenarios do
        host_id = Faker.UUID.v4()

        fully_qualified_domain_name = Faker.Internet.domain_name()
        system_id = 100

        map_discovered_relevant_patches =
          Enum.map(discovered_relevant_patches, &Map.from_struct/1)

        map_discovered_upgradable_packages =
          Enum.map(discovered_upgradable_packages, &Map.from_struct/1)

        expect(
          SoftwareUpdatesDiscoveryMock,
          :get_system_id,
          fn ^fully_qualified_domain_name -> {:ok, system_id} end
        )

        expect(
          SoftwareUpdatesDiscoveryMock,
          :get_relevant_patches,
          fn ^system_id -> {:ok, map_discovered_relevant_patches} end
        )

        expect(
          SoftwareUpdatesDiscoveryMock,
          :get_upgradable_packages,
          fn ^system_id -> {:ok, map_discovered_upgradable_packages} end
        )

        expect(
          Trento.Commanded.Mock,
          :dispatch,
          fn %CompleteSoftwareUpdatesDiscovery{
               host_id: ^host_id,
               health: ^expected_health
             } ->
            :ok
          end
        )

        {:ok, ^host_id, ^system_id, ^map_discovered_relevant_patches,
         ^map_discovered_upgradable_packages} =
          Discovery.discover_host_software_updates(host_id, fully_qualified_domain_name)

        stored_system_id = "#{system_id}"

        assert %DiscoveryResult{
                 host_id: ^host_id,
                 system_id: ^stored_system_id,
                 relevant_patches: ^discovered_relevant_patches,
                 upgradable_packages: ^discovered_upgradable_packages,
                 failure_reason: nil
               } = Trento.Repo.get(DiscoveryResult, host_id)
      end
    end
  end

  describe "Discovering software updates for a collection of hosts" do
    test "should handle empty hosts list" do
      expect(SoftwareUpdatesDiscoveryMock, :setup, fn -> :ok end)

      assert {:ok, {[], []}} = Discovery.discover_software_updates()

      assert 0 ==
               DiscoveryResult
               |> Trento.Repo.all()
               |> length()
    end

    test "should handle authentication error" do
      expect(SoftwareUpdatesDiscoveryMock, :setup, fn -> {:error, :auth_error} end)

      [%{id: host_id1}, %{id: host_id2}] = insert_list(2, :host)

      expect(
        Trento.Commanded.Mock,
        :dispatch,
        2,
        fn
          %CompleteSoftwareUpdatesDiscovery{
            host_id: ^host_id1,
            health: SoftwareUpdatesHealth.unknown()
          } ->
            :ok

          %CompleteSoftwareUpdatesDiscovery{
            host_id: ^host_id2,
            health: SoftwareUpdatesHealth.unknown()
          } ->
            :ok
        end
      )

      {:ok, {[], errored_discoveries}} = Discovery.discover_software_updates()

      Enum.each([host_id1, host_id2], fn host_id ->
        assert {:error, host_id, :auth_error} in errored_discoveries
      end)

      assert 2 ==
               DiscoveryResult
               |> Trento.Repo.all()
               |> length()
    end

    test "should handle SUMA settings not configured error" do
      expect(SoftwareUpdatesDiscoveryMock, :setup, fn -> {:error, :settings_not_configured} end)

      [%{id: host_id1}, %{id: host_id2}] = insert_list(2, :host)

      expect(
        Trento.Commanded.Mock,
        :dispatch,
        0,
        fn _ ->
          :ok
        end
      )

      {:ok, {[], errored_discoveries}} = Discovery.discover_software_updates()

      Enum.each([host_id1, host_id2], fn host_id ->
        assert {:error, host_id, :settings_not_configured} in errored_discoveries
      end)
    end

    test "should handle hosts without fqdn" do
      expect(SoftwareUpdatesDiscoveryMock, :setup, fn -> :ok end)

      %{id: host_id1} = insert(:host, fully_qualified_domain_name: nil)
      %{id: host_id2} = insert(:host, fully_qualified_domain_name: nil)

      {:ok, {[], errored_discoveries}} = Discovery.discover_software_updates()

      Enum.each([host_id1, host_id2], fn host_id ->
        assert {:error, host_id, :host_without_fqdn} in errored_discoveries
      end)

      assert 0 ==
               DiscoveryResult
               |> Trento.Repo.all()
               |> length()
    end

    test "should handle errors when getting a system id" do
      expect(SoftwareUpdatesDiscoveryMock, :setup, fn -> :ok end)

      %{id: host_id, fully_qualified_domain_name: fully_qualified_domain_name} = insert(:host)

      discovery_error = :some_error_while_getting_system_id

      fail_on_getting_system_id(host_id, fully_qualified_domain_name, discovery_error)

      {:ok, {[], errored_discoveries}} = Discovery.discover_software_updates()

      assert {:error, host_id, discovery_error} in errored_discoveries

      assert 1 ==
               DiscoveryResult
               |> Trento.Repo.all()
               |> length()

      assert_failure_result_tracked(host_id, discovery_error)
    end

    test "should handle errors when getting relevant patches" do
      expect(SoftwareUpdatesDiscoveryMock, :setup, fn -> :ok end)

      %{id: host_id, fully_qualified_domain_name: fully_qualified_domain_name} = insert(:host)

      system_id = 100
      discovery_error = :some_error_while_getting_relevant_patches

      fail_on_getting_relevant_patches(
        host_id,
        fully_qualified_domain_name,
        system_id,
        discovery_error
      )

      {:ok, {[], errored_discoveries}} = Discovery.discover_software_updates()

      assert {:error, host_id, discovery_error} in errored_discoveries

      assert 1 ==
               DiscoveryResult
               |> Trento.Repo.all()
               |> length()

      assert_failure_result_tracked(host_id, discovery_error)
    end

    test "should handle errors when getting upgradable packages" do
      expect(SoftwareUpdatesDiscoveryMock, :setup, fn -> :ok end)

      %{id: host_id, fully_qualified_domain_name: fully_qualified_domain_name} = insert(:host)

      system_id = 100
      discovery_error = :some_error_while_getting_upgradable_packages

      fail_on_getting_upgradable_packages(
        host_id,
        fully_qualified_domain_name,
        system_id,
        discovery_error
      )

      {:ok, {[], errored_discoveries}} = Discovery.discover_software_updates()

      assert {:error, host_id, discovery_error} in errored_discoveries

      assert 1 ==
               DiscoveryResult
               |> Trento.Repo.all()
               |> length()

      assert_failure_result_tracked(host_id, discovery_error)
    end

    test "should handle errors when dispatching discovery completion command" do
      expect(SoftwareUpdatesDiscoveryMock, :setup, fn -> :ok end)

      %{id: host_id, fully_qualified_domain_name: fully_qualified_domain_name} = insert(:host)

      system_id = 100

      dispatching_error = :error_while_dispatching_completion_command

      fail_on_dispatching_completion_command(
        host_id,
        fully_qualified_domain_name,
        system_id,
        dispatching_error
      )

      {:ok, {[], errored_discoveries}} = Discovery.discover_software_updates()

      assert {:error, host_id, dispatching_error} in errored_discoveries

      assert 1 ==
               DiscoveryResult
               |> Trento.Repo.all()
               |> length()

      assert_failure_result_tracked(host_id, dispatching_error)
    end

    test "should complete discovery" do
      expect(SoftwareUpdatesDiscoveryMock, :setup, fn -> :ok end)

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

      expected_commands = %{
        host_id1 => %CompleteSoftwareUpdatesDiscovery{
          host_id: host_id1,
          health: SoftwareUpdatesHealth.critical()
        },
        host_id2 => %CompleteSoftwareUpdatesDiscovery{
          host_id: host_id2,
          health: SoftwareUpdatesHealth.unknown()
        },
        host_id3 => %CompleteSoftwareUpdatesDiscovery{
          host_id: host_id3,
          health: SoftwareUpdatesHealth.critical()
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

      upgradable_packages = 3 |> build_list(:upgradable_package) |> Enum.map(&Map.from_struct/1)

      expect(
        SoftwareUpdatesDiscoveryMock,
        :get_upgradable_packages,
        2,
        fn _ -> {:ok, upgradable_packages} end
      )

      expect(
        Trento.Commanded.Mock,
        :dispatch,
        3,
        fn %CompleteSoftwareUpdatesDiscovery{host_id: host_id} = command ->
          assert Map.get(expected_commands, host_id) == command

          :ok
        end
      )

      assert {:ok, {successful_discoveries, errored_discoveries}} =
               Discovery.discover_software_updates()

      assert length(successful_discoveries) == 2
      assert length(errored_discoveries) == 2

      assert [
               {:ok, host_id1, system_id1, discovered_relevant_patches, upgradable_packages},
               {:ok, host_id3, system_id3, discovered_relevant_patches, upgradable_packages}
             ] ==
               successful_discoveries

      assert {:error, host_id2, :some_error} in errored_discoveries
      assert {:error, host_id4, :host_without_fqdn} in errored_discoveries

      assert 3 ==
               DiscoveryResult
               |> Trento.Repo.all()
               |> length()

      assert_failure_result_tracked(host_id2, :some_error)

      assert nil == Trento.Repo.get(DiscoveryResult, host_id4)

      assert %DiscoveryResult{
               host_id: ^host_id1,
               failure_reason: nil
             } = Trento.Repo.get(DiscoveryResult, host_id1)

      assert %DiscoveryResult{
               host_id: ^host_id3,
               failure_reason: nil
             } = Trento.Repo.get(DiscoveryResult, host_id3)
    end
  end

  describe "Clearing up software updates discoveries" do
    test "should pass through an empty hosts list and clear settings" do
      expect(Trento.SoftwareUpdates.Discovery.Mock, :clear, fn -> :ok end)

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

    test "should clear a previously tracked software updates discovery result" do
      %{host_id: host_id} = insert(:software_updates_discovery_result)
      insert_list(4, :software_updates_discovery_result)

      assert %DiscoveryResult{host_id: ^host_id} = Trento.Repo.get(DiscoveryResult, host_id)

      assert :ok == Discovery.clear_tracked_discovery_result(host_id)

      assert nil == Trento.Repo.get(DiscoveryResult, host_id)

      assert 4 ==
               DiscoveryResult
               |> Trento.Repo.all()
               |> length()
    end

    test "should ignore not tracked software updates discovery results" do
      insert_list(4, :software_updates_discovery_result)

      host_id = Faker.UUID.v4()

      assert nil == Trento.Repo.get(DiscoveryResult, host_id)

      assert :ok == Discovery.clear_tracked_discovery_result(host_id)

      assert nil == Trento.Repo.get(DiscoveryResult, host_id)

      assert 4 ==
               DiscoveryResult
               |> Trento.Repo.all()
               |> length()
    end
  end

  describe "retrieving software updates discovery result" do
    test "handles non existing discovery result" do
      host_id = Faker.UUID.v4()

      assert {:error, :not_found} = Discovery.get_discovery_result(host_id)
    end

    test "successfully returns empty discoveries" do
      %{host_id: host_id} =
        insert(:software_updates_discovery_result, relevant_patches: [], upgradable_packages: [])

      assert {:ok, [], []} == Discovery.get_discovery_result(host_id)
    end

    test "successfully returns non-empty discoveries" do
      %{
        host_id: host_id,
        relevant_patches: relevant_patches,
        upgradable_packages: upgradable_packages
      } = insert(:software_updates_discovery_result)

      assert {:ok, tracked_patches, tracked_packages} = Discovery.get_discovery_result(host_id)
      assert length(relevant_patches) == length(tracked_patches)
      assert length(upgradable_packages) == length(tracked_packages)
    end

    test "returns error on failed discovery result" do
      scenarios = [
        %{
          failure_reason: "system_id_not_found",
          expected_error: :system_id_not_found
        },
        %{
          failure_reason: "error_getting_patches",
          expected_error: :error_getting_patches
        },
        %{
          failure_reason: "error_getting_packages",
          expected_error: :error_getting_packages
        },
        %{
          failure_reason: "max_login_retries_reached",
          expected_error: :max_login_retries_reached
        }
      ]

      for %{
            failure_reason: failure_reason,
            expected_error: expected_error
          } <- scenarios do
        %{host_id: host_id} =
          insert(:failed_software_updates_discovery_result, failure_reason: failure_reason)

        assert {:error, ^expected_error} = Discovery.get_discovery_result(host_id)
      end
    end
  end

  defp fail_on_getting_system_id(host_id, fully_qualified_domain_name, discovery_error) do
    expect(
      SoftwareUpdatesDiscoveryMock,
      :get_system_id,
      fn ^fully_qualified_domain_name -> {:error, discovery_error} end
    )

    expect(
      SoftwareUpdatesDiscoveryMock,
      :get_relevant_patches,
      0,
      fn _ -> :ok end
    )

    expect(
      SoftwareUpdatesDiscoveryMock,
      :get_upgradable_packages,
      0,
      fn _ -> :ok end
    )

    expect(
      Trento.Commanded.Mock,
      :dispatch,
      fn %CompleteSoftwareUpdatesDiscovery{
           host_id: ^host_id,
           health: SoftwareUpdatesHealth.unknown()
         } ->
        :ok
      end
    )
  end

  defp fail_on_getting_relevant_patches(
         host_id,
         fully_qualified_domain_name,
         system_id,
         discovery_error
       ) do
    expect(
      SoftwareUpdatesDiscoveryMock,
      :get_system_id,
      fn ^fully_qualified_domain_name -> {:ok, system_id} end
    )

    expect(
      SoftwareUpdatesDiscoveryMock,
      :get_relevant_patches,
      fn ^system_id -> {:error, discovery_error} end
    )

    expect(
      SoftwareUpdatesDiscoveryMock,
      :get_upgradable_packages,
      0,
      fn _ -> :ok end
    )

    expect(
      Trento.Commanded.Mock,
      :dispatch,
      fn %CompleteSoftwareUpdatesDiscovery{
           host_id: ^host_id,
           health: SoftwareUpdatesHealth.unknown()
         } ->
        :ok
      end
    )
  end

  defp fail_on_getting_upgradable_packages(
         host_id,
         fully_qualified_domain_name,
         system_id,
         discovery_error
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
      SoftwareUpdatesDiscoveryMock,
      :get_upgradable_packages,
      fn _ -> {:error, discovery_error} end
    )

    expect(
      Trento.Commanded.Mock,
      :dispatch,
      fn %CompleteSoftwareUpdatesDiscovery{
           host_id: ^host_id,
           health: SoftwareUpdatesHealth.unknown()
         } ->
        :ok
      end
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
      SoftwareUpdatesDiscoveryMock,
      :get_upgradable_packages,
      fn _ -> {:ok, 3 |> build_list(:upgradable_package) |> Enum.map(&Map.from_struct/1)} end
    )

    expect(
      Trento.Commanded.Mock,
      :dispatch,
      fn %CompleteSoftwareUpdatesDiscovery{
           host_id: ^host_id,
           health: SoftwareUpdatesHealth.critical()
         } ->
        {:error, dispatching_error}
      end
    )

    expect(
      Trento.Commanded.Mock,
      :dispatch,
      fn %CompleteSoftwareUpdatesDiscovery{
           host_id: ^host_id,
           health: SoftwareUpdatesHealth.unknown()
         } ->
        :ok
      end
    )
  end

  defp assert_failure_result_tracked(host_id, failure_reason) do
    stored_failure = Atom.to_string(failure_reason)

    assert %DiscoveryResult{
             host_id: ^host_id,
             system_id: nil,
             relevant_patches: [],
             upgradable_packages: [],
             failure_reason: ^stored_failure
           } = Trento.Repo.get(DiscoveryResult, host_id)
  end
end
