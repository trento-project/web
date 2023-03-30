defmodule Trento.DeregistrationProcessManagerTest do
  use ExUnit.Case

  alias Trento.Domain.Events.{
    ClusterRolledUp,
    HostAddedToCluster,
    HostDeregistered,
    HostDeregistrationRequested,
    HostRegistered,
    HostRemovedFromCluster,
    HostRolledUp
  }

  alias Trento.DeregistrationProcessManager
  alias Trento.Domain.Cluster

  alias Trento.Domain.Commands.{
    DeregisterClusterHost,
    DeregisterHost
  }

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

    test "should start the process manager when HostAddedToCluster arrives" do
      host_id = UUID.uuid4()

      assert {:start, ^host_id} =
               DeregistrationProcessManager.interested?(%HostAddedToCluster{host_id: host_id})
    end

    test "should start the process manager when ClusterRolledUp arrives" do
      cluster_hosts = [UUID.uuid4(), UUID.uuid4()]

      assert {:start, ^cluster_hosts} =
               DeregistrationProcessManager.interested?(%ClusterRolledUp{
                 snapshot: %Cluster{hosts: cluster_hosts}
               })
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
    test "should update the state with the proper cluster id when ClusterRolledUp event is emitted" do
      initial_state = %DeregistrationProcessManager{}
      cluster_id = UUID.uuid4()
      cluster_hosts = [UUID.uuid4(), UUID.uuid4()]

      events = [%ClusterRolledUp{cluster_id: cluster_id, snapshot: cluster_hosts}]

      {commands, state} = reduce_events(events, initial_state)

      assert [] == commands
      assert %DeregistrationProcessManager{cluster_id: ^cluster_id} = state
    end

    test "should update the state with the proper cluster id when HostAddedToCluster event is emitted" do
      initial_state = %DeregistrationProcessManager{}
      cluster_id = UUID.uuid4()
      host_id = UUID.uuid4()

      events = [%HostAddedToCluster{cluster_id: cluster_id, host_id: host_id}]

      {commands, state} = reduce_events(events, initial_state)

      assert [] == commands
      assert %DeregistrationProcessManager{cluster_id: ^cluster_id} = state
    end

    test "should dispatch DeregisterHost command when HostDeregistrationRequested is emitted" do
      host_id = UUID.uuid4()
      requested_at = DateTime.utc_now()
      initial_state = %DeregistrationProcessManager{}

      events = [%HostDeregistrationRequested{host_id: host_id, requested_at: requested_at}]

      {commands, state} = reduce_events(events, initial_state)

      assert ^initial_state = state
      assert %DeregisterHost{host_id: ^host_id, deregistered_at: ^requested_at} = commands
    end

    test "should dispatch DeregisterClusterHost and then DeregisterHost commands when HostDeregistrationRequested is emitted and the host belongs to a cluster" do
      host_id = UUID.uuid4()
      cluster_id = UUID.uuid4()
      requested_at = DateTime.utc_now()
      initial_state = %DeregistrationProcessManager{cluster_id: cluster_id}

      events = [%HostDeregistrationRequested{host_id: host_id, requested_at: requested_at}]

      {commands, state} = reduce_events(events, initial_state)

      assert ^initial_state = state

      assert [
               %DeregisterClusterHost{
                 host_id: ^host_id,
                 cluster_id: ^cluster_id,
                 deregistered_at: ^requested_at
               },
               %DeregisterHost{host_id: ^host_id, deregistered_at: ^requested_at}
             ] = commands
    end

    test "should update the state and remove the cluster id when HostRemovedFromCluster event is emitted" do
      initial_state = %DeregistrationProcessManager{}
      cluster_id = UUID.uuid4()
      host_id = UUID.uuid4()

      events = [
        %HostAddedToCluster{cluster_id: cluster_id, host_id: host_id},
        %HostRemovedFromCluster{host_id: host_id}
      ]

      {commands, state} = reduce_events(events, initial_state)

      assert [] == commands
      assert %DeregistrationProcessManager{cluster_id: nil} = state
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
