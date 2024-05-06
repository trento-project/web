defmodule Trento.Infrastructure.Commanded.EventHandlers.SoftwareUpdatesDiscoveryEventHandlerTest do
  use Trento.DataCase

  import Mox
  import Phoenix.ChannelTest
  import TrentoWeb.ChannelCase
  import Trento.Factory

  alias Trento.SoftwareUpdates.Discovery.DiscoveryResult
  alias Trento.SoftwareUpdates.Discovery.Mock, as: SoftwareUpdatesDiscoveryMock

  alias Trento.Hosts.Commands.CompleteSoftwareUpdatesDiscovery

  alias Trento.Hosts.Events.SoftwareUpdatesDiscoveryRequested

  alias Trento.Infrastructure.Commanded.EventHandlers.SoftwareUpdatesDiscoveryEventHandler

  require Trento.SoftwareUpdates.Enums.SoftwareUpdatesHealth, as: SoftwareUpdatesHealth

  setup [:set_mox_from_context, :verify_on_exit!]

  @endpoint TrentoWeb.Endpoint

  setup do
    {:ok, _, socket} =
      TrentoWeb.UserSocket
      |> socket("user_id", %{some: :assign})
      |> subscribe_and_join(TrentoWeb.MonitoringChannel, "monitoring:hosts")

    %{socket: socket}
  end

  describe "Discovering software updates" do
    test "should discover software updates when a SoftwareUpdatesDiscoveryRequested is emitted" do
      %SoftwareUpdatesDiscoveryRequested{
        host_id: host_id,
        fully_qualified_domain_name: fully_qualified_domain_name
      } = event = build(:software_updates_discovery_requested_event)

      system_id = Faker.UUID.v4()

      expect(
        SoftwareUpdatesDiscoveryMock,
        :get_system_id,
        fn ^fully_qualified_domain_name -> {:ok, system_id} end
      )

      expect(
        SoftwareUpdatesDiscoveryMock,
        :get_relevant_patches,
        fn ^system_id -> {:ok, []} end
      )

      expect(
        SoftwareUpdatesDiscoveryMock,
        :get_upgradable_packages,
        fn ^system_id -> {:ok, []} end
      )

      expect(
        Trento.Commanded.Mock,
        :dispatch,
        fn %CompleteSoftwareUpdatesDiscovery{host_id: ^host_id} -> :ok end
      )

      assert :ok = SoftwareUpdatesDiscoveryEventHandler.handle(event, %{})
    end

    test "should pass through failures" do
      %SoftwareUpdatesDiscoveryRequested{
        fully_qualified_domain_name: fully_qualified_domain_name
      } = event = build(:software_updates_discovery_requested_event)

      expect(
        SoftwareUpdatesDiscoveryMock,
        :get_system_id,
        fn ^fully_qualified_domain_name -> {:error, :some_error} end
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
             health: SoftwareUpdatesHealth.unknown()
           } ->
          :ok
        end
      )

      assert :ok = SoftwareUpdatesDiscoveryEventHandler.handle(event, %{})
    end
  end

  describe "Clearing up software updates discoveries" do
    test "should clear previously tracked software updates discoveries when a SoftwareUpdatesDiscoveryCleared is emitted" do
      [%{host_id: host_id} | _] = insert_list(6, :software_updates_discovery_result)

      assert :ok ==
               :software_updates_discovery_cleared_event
               |> build(host_id: host_id)
               |> SoftwareUpdatesDiscoveryEventHandler.handle(%{})

      assert_broadcast(
        "host_software_updates_discovery_completed",
        %{id: ^host_id},
        1000
      )

      assert nil == Trento.Repo.get(DiscoveryResult, host_id)
    end
  end
end
