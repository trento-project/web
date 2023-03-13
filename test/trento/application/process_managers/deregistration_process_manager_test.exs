defmodule Trento.DeregistrationProcessManagerTest do
  use ExUnit.Case

  alias Trento.Domain.Events.{
    HostDeregistered,
    HostDeregistrationRequested,
    HostRegistered,
    HostRolledUp
  }

  alias Trento.DeregistrationProcessManager
  alias Trento.Domain.Commands.DeregisterHost

  describe "events interested" do
    test "should start the process manager when HostRegistered event arrives" do
      host_id = UUID.uuid4()

      assert {:start, ^host_id} =
               DeregistrationProcessManager.interested?(%HostRegistered{host_id: host_id})
    end

    test "should start the process manager when HostRolledUp arrives" do
      host_id = UUID.uuid4()

      assert {:start, ^host_id} =
               DeregistrationProcessManager.interested?(%HostRolledUp{host_id: host_id})
    end

    test "should continue the process manager when HostDeregistrationRequested arrives" do
      host_id = UUID.uuid4()

      assert {:continue, ^host_id} =
               DeregistrationProcessManager.interested?(%HostDeregistrationRequested{
                 host_id: host_id
               })
    end

    test "should stop the process manager when HostDeregistered arrives" do
      host_id = UUID.uuid4()

      assert {:stop, ^host_id} =
               DeregistrationProcessManager.interested?(%HostDeregistered{host_id: host_id})
    end
  end

  describe "host deregistration procedure" do
    test "should update the state with the proper host id when HostRegistered event is emitted" do
      initial_state = %DeregistrationProcessManager{}
      host_id = UUID.uuid4()

      events = [%HostRegistered{host_id: host_id}]

      {commands, state} = reduce_events(events, initial_state)

      assert [] == commands
      assert %DeregistrationProcessManager{host_id: ^host_id} = state
    end

    test "should update the state with the proper host when HostRolledUp event is emitted" do
      initial_state = %DeregistrationProcessManager{}
      host_id = UUID.uuid4()

      events = [%HostRolledUp{host_id: host_id}]

      {commands, state} = reduce_events(events, initial_state)

      assert [] == commands
      assert %DeregistrationProcessManager{host_id: ^host_id} = state
    end

    test "should dispatch DeregisterHost command when HostDeregistrationRequested is emitted" do
      host_id = UUID.uuid4()
      requested_at = DateTime.utc_now()
      initial_state = %DeregistrationProcessManager{host_id: host_id}

      events = [%HostDeregistrationRequested{host_id: host_id, requested_at: requested_at}]

      {commands, state} = reduce_events(events, initial_state)

      assert ^initial_state = state
      assert %DeregisterHost{host_id: ^host_id, deregistered_at: ^requested_at} = commands
    end
  end

  defp reduce_events(events, initial_state) do
    Enum.reduce(events, {[], initial_state}, fn event, {commands, state} ->
      new_commands = DeregistrationProcessManager.handle(state, event)
      new_state = DeregistrationProcessManager.apply(state, event)

      {commands ++ new_commands, new_state}
    end)
  end
end
