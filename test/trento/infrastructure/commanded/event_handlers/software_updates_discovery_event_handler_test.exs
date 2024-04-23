defmodule Trento.Infrastructure.Commanded.EventHandlers.SoftwareUpdatesDiscoveryEventHandlerTest do
  use Trento.DataCase

  import Mox
  import Trento.Factory

  alias Trento.SoftwareUpdates.Discovery.Mock, as: SoftwareUpdatesDiscoveryMock

  alias Trento.Hosts.Commands.CompleteSoftwareUpdatesDiscovery
  alias Trento.Hosts.Events.SoftwareUpdatesDiscoveryRequested

  alias Trento.Infrastructure.Commanded.EventHandlers.SoftwareUpdatesDiscoveryEventHandler

  require Trento.SoftwareUpdates.Enums.SoftwareUpdatesHealth, as: SoftwareUpdatesHealth

  setup [:set_mox_from_context, :verify_on_exit!]

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
