defmodule Trento.Infrastructure.Commanded.ProcessManagers.SoftwareUpdatesProcessManagerTest do
  use ExUnit.Case

  import Trento.Factory

  alias Trento.Hosts.Events.{
    HostDeregistered,
    HostDetailsUpdated,
    HostRegistered,
    HostRestored
  }

  alias Trento.Hosts.Commands.{
    ClearSoftwareUpdatesDiscovery,
    DiscoverSoftwareUpdates
  }

  alias Trento.Infrastructure.Commanded.ProcessManagers.SoftwareUpdatesDiscoveryProcessManager

  describe "events interested" do
    test "should start the process manager when HostRegistered event is emitted" do
      host_id = UUID.uuid4()

      assert {:start, ^host_id} =
               SoftwareUpdatesDiscoveryProcessManager.interested?(%HostRegistered{
                 host_id: host_id
               })
    end

    test "should start the process manager when HostRestored event is emitted" do
      host_id = UUID.uuid4()

      assert {:start, ^host_id} =
               SoftwareUpdatesDiscoveryProcessManager.interested?(%HostRestored{host_id: host_id})
    end

    test "should continue the process manager when HostDetailsUpdated is emitted" do
      host_id = UUID.uuid4()

      assert {:continue, ^host_id} =
               SoftwareUpdatesDiscoveryProcessManager.interested?(%HostDetailsUpdated{
                 host_id: host_id
               })
    end

    test "should stop the process manager when HostDeregistered arrives" do
      host_id = UUID.uuid4()

      assert {:stop, ^host_id} =
               SoftwareUpdatesDiscoveryProcessManager.interested?(%HostDeregistered{
                 host_id: host_id
               })
    end
  end

  describe "initiating software updates discovery process" do
    test "should ignore hosts registered without an FQDN" do
      initial_state = %SoftwareUpdatesDiscoveryProcessManager{}
      host_id = UUID.uuid4()

      {commands, state} =
        :host_registered_event
        |> build(host_id: host_id, fully_qualified_domain_name: nil)
        |> reduce_events(initial_state)

      assert [] == commands

      assert %SoftwareUpdatesDiscoveryProcessManager{
               host_id: ^host_id,
               fully_qualified_domain_name: nil
             } = state
    end

    test "should initiate software updates discovery when a host with FQDN is registered" do
      initial_state = %SoftwareUpdatesDiscoveryProcessManager{}
      host_id = UUID.uuid4()
      fqdn = Faker.Internet.domain_name()

      {commands, state} =
        :host_registered_event
        |> build(host_id: host_id, fully_qualified_domain_name: fqdn)
        |> reduce_events(initial_state)

      assert [%DiscoverSoftwareUpdates{host_id: host_id}] == commands

      assert %SoftwareUpdatesDiscoveryProcessManager{
               host_id: ^host_id,
               fully_qualified_domain_name: ^fqdn
             } = state
    end

    test "should initiate software updates discovery when a host is restored" do
      initial_state = %SoftwareUpdatesDiscoveryProcessManager{}
      host_id = UUID.uuid4()

      {commands, state} =
        :host_restored_event
        |> build(host_id: host_id)
        |> reduce_events(initial_state)

      assert [%DiscoverSoftwareUpdates{host_id: host_id}] == commands

      assert %SoftwareUpdatesDiscoveryProcessManager{
               host_id: ^host_id,
               fully_qualified_domain_name: nil
             } = state
    end

    test "should initiate software updates discovery twice when a host is restored and fqdn changed contextually" do
      initial_state = %SoftwareUpdatesDiscoveryProcessManager{}
      host_id = UUID.uuid4()
      new_fqdn = Faker.Internet.domain_name()

      events = [
        build(:host_restored_event, host_id: host_id),
        build(:host_details_updated_event,
          host_id: host_id,
          fully_qualified_domain_name: new_fqdn
        )
      ]

      {commands, state} = reduce_events(events, initial_state)

      assert [
               %DiscoverSoftwareUpdates{host_id: host_id},
               %DiscoverSoftwareUpdates{host_id: host_id}
             ] == commands

      assert %SoftwareUpdatesDiscoveryProcessManager{
               host_id: ^host_id,
               fully_qualified_domain_name: ^new_fqdn
             } = state
    end

    test "should ignore hosts detail changes when FQDN does not change" do
      scenarios = [
        %{
          initial_fqdn: nil
        },
        %{
          initial_fqdn: Faker.Internet.domain_name()
        }
      ]

      for %{initial_fqdn: initial_fqdn} <- scenarios do
        host_id = UUID.uuid4()

        initial_state = %SoftwareUpdatesDiscoveryProcessManager{
          host_id: host_id,
          fully_qualified_domain_name: initial_fqdn
        }

        {commands, state} =
          :host_details_updated_event
          |> build(
            host_id: host_id,
            fully_qualified_domain_name: initial_fqdn
          )
          |> reduce_events(initial_state)

        assert [] == commands

        assert ^initial_state = state
      end
    end

    test "should initiate software updates discovery when FQDN changes" do
      scenarios = [
        %{
          initial_fqdn: nil,
          new_fqdn: Faker.Internet.domain_name()
        },
        %{
          initial_fqdn: Faker.Internet.domain_name(),
          new_fqdn: Faker.StarWars.planet()
        }
      ]

      for %{initial_fqdn: initial_fqdn, new_fqdn: new_fqdn} <- scenarios do
        host_id = UUID.uuid4()

        initial_state = %SoftwareUpdatesDiscoveryProcessManager{
          host_id: host_id,
          fully_qualified_domain_name: initial_fqdn
        }

        {commands, state} =
          :host_details_updated_event
          |> build(host_id: host_id, fully_qualified_domain_name: new_fqdn)
          |> reduce_events(initial_state)

        assert [%DiscoverSoftwareUpdates{host_id: host_id}] == commands

        assert %SoftwareUpdatesDiscoveryProcessManager{
                 host_id: ^host_id,
                 fully_qualified_domain_name: ^new_fqdn
               } = state
      end
    end

    test "should trigger software updates clear up when FQDN changes to nil" do
      host_id = UUID.uuid4()
      initial_fqdn = Faker.Internet.domain_name()

      initial_state = %SoftwareUpdatesDiscoveryProcessManager{
        host_id: host_id,
        fully_qualified_domain_name: initial_fqdn
      }

      {commands, state} =
        :host_details_updated_event
        |> build(host_id: host_id, fully_qualified_domain_name: nil)
        |> reduce_events(initial_state)

      assert [%ClearSoftwareUpdatesDiscovery{host_id: host_id}] == commands

      assert %SoftwareUpdatesDiscoveryProcessManager{
               host_id: ^host_id,
               fully_qualified_domain_name: nil
             } = state
    end
  end

  defp reduce_events(events, initial_state) do
    events
    |> List.wrap()
    |> Enum.reduce({[], initial_state}, fn event, {commands, state} ->
      new_commands = SoftwareUpdatesDiscoveryProcessManager.handle(state, event)
      new_state = SoftwareUpdatesDiscoveryProcessManager.apply(state, event)

      {commands ++ List.wrap(new_commands), new_state}
    end)
  end
end
