defmodule Trento.SoftwareUpdates.SettingsTest do
  use ExUnit.Case
  use Trento.CommandedCase
  use Trento.DataCase
  use Trento.SoftwareUpdates.DiscoveryCase
  use Trento.TaskCase

  import Mox

  import Trento.Factory

  alias Trento.Settings
  alias Trento.SoftwareUpdates

  setup :verify_on_exit!

  describe "discovery" do
    test "should not start discovery if settings are not configured" do
      assert {:error, :settings_not_configured} = SoftwareUpdates.run_discovery()
    end

    test "should start discovery if settings are configured" do
      insert_software_updates_settings()
      insert_list(4, :host)

      assert :ok == SoftwareUpdates.run_discovery()
    end

    test "should trigger clearing of software updates discoveries when clearing settings" do
      insert_software_updates_settings()
      insert_list(4, :host)

      expect(Trento.SoftwareUpdates.Discovery.Mock, :clear, 3, fn -> :ok end)

      Enum.each(1..3, fn _ ->
        assert :ok == Settings.clear_suse_manager_settings()
        assert {:error, :settings_not_configured} == Settings.get_suse_manager_settings()
      end)
    end
  end

  describe "getting software updates" do
    test "should fail when settings are not configured" do
      %{host_id: tracked_discovery_id} = insert(:software_updates_discovery_result)
      untracked_discovery_id = Faker.UUID.v4()

      for host_id <- [tracked_discovery_id, untracked_discovery_id] do
        assert {:error, :settings_not_configured} = SoftwareUpdates.get_software_updates(host_id)
      end
    end

    test "handles non existing discovery result" do
      insert_software_updates_settings()
      host_id = Faker.UUID.v4()

      assert {:error, :not_found} = SoftwareUpdates.get_software_updates(host_id)
    end

    test "successfully returns software updates" do
      insert_software_updates_settings()
      %{host_id: host_id} = insert(:software_updates_discovery_result)

      assert {:ok, %{relevant_patches: [_, _], upgradable_packages: [_, _]}} =
               SoftwareUpdates.get_software_updates(host_id)
    end

    test "returns errors on failed discoveries" do
      insert_software_updates_settings()

      %{host_id: host_id} =
        insert(:failed_software_updates_discovery_result)

      assert {:error, _} = SoftwareUpdates.get_software_updates(host_id)
    end
  end

  describe "getting related patches for some packages" do
    test "should return an aggregated list of packages and related patches" do
      insert_software_updates_settings()

      [first_package_id, second_package_id, _] =
        packages_ids = [Faker.UUID.v4(), Faker.UUID.v4(), Faker.UUID.v4()]

      first_patch = [build(:patch_for_package)]
      second_patch = [build(:patch_for_package)]

      expect(Trento.SoftwareUpdates.Discovery.Mock, :get_patches_for_package, 3, fn
        ^first_package_id ->
          {:ok, first_patch}

        ^second_package_id ->
          {:ok, second_patch}

        _ ->
          {:error, :some_error}
      end)

      assert {:ok,
              [
                %{package_id: ^first_package_id, patches: ^first_patch},
                %{package_id: ^second_package_id, patches: ^second_patch},
                %{package_id: _, patches: []}
              ]} =
               SoftwareUpdates.get_packages_patches(packages_ids)
    end
  end

  describe "testing connection settings" do
    test "should return an error when connection test fails" do
      expect(Trento.SoftwareUpdates.Discovery.Mock, :setup, fn -> {:error, :some_error} end)

      assert {:error, :connection_test_failed} = SoftwareUpdates.test_connection_settings()
    end

    test "should return ok when connection test succeeds" do
      expect(Trento.SoftwareUpdates.Discovery.Mock, :setup, fn -> :ok end)

      assert :ok == SoftwareUpdates.test_connection_settings()
    end
  end
end
