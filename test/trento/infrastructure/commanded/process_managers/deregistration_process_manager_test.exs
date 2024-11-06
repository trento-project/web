defmodule Trento.Infrastructure.Commanded.ProcessManagers.DeregistrationProcessManagerTest do
  use ExUnit.Case

  import Trento.Factory

  alias Trento.Clusters.Events.{
    ClusterRolledUp,
    HostAddedToCluster,
    HostRemovedFromCluster
  }

  alias Trento.Hosts.Events.{
    HostDeregistered,
    HostDeregistrationRequested,
    HostRegistered,
    HostRolledUp
  }

  alias Trento.Databases.Events.{
    DatabaseInstanceDeregistered,
    DatabaseInstanceRegistered,
    DatabaseRolledUp
  }

  alias Trento.SapSystems.Events.{
    ApplicationInstanceDeregistered,
    ApplicationInstanceMoved,
    ApplicationInstanceRegistered,
    SapSystemRolledUp
  }

  alias Trento.DeregistrationProcessManager
  alias Trento.Infrastructure.Commanded.ProcessManagers.DeregistrationProcessManager

  alias Trento.Infrastructure.Commanded.ProcessManagers.DeregistrationProcessManager.Instance

  alias Trento.Clusters.Cluster
  alias Trento.Databases.Database
  alias Trento.SapSystems.Instance, as: SapSystemInstance
  alias Trento.SapSystems.SapSystem

  alias Trento.Clusters.Commands.DeregisterClusterHost
  alias Trento.Hosts.Commands.DeregisterHost

  alias Trento.Databases.Commands.DeregisterDatabaseInstance
  alias Trento.SapSystems.Commands.DeregisterApplicationInstance

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

    test "should start the process manager when DatabaseInstanceRegistered event arrives" do
      host_id = UUID.uuid4()

      assert {:start, ^host_id} =
               DeregistrationProcessManager.interested?(%DatabaseInstanceRegistered{
                 host_id: host_id
               })
    end

    test "should start the process manager when ApplicationInstanceRegistered event arrives" do
      host_id = UUID.uuid4()

      assert {:start, ^host_id} =
               DeregistrationProcessManager.interested?(%ApplicationInstanceRegistered{
                 host_id: host_id
               })
    end

    test "should start process managers when SapSystemRolledUp arrives" do
      [%{host_id: app_host_id_1}, %{host_id: app_host_id_2}] =
        application_instances = build_list(2, :sap_system_instance)

      assert {:start, [^app_host_id_1, ^app_host_id_2]} =
               DeregistrationProcessManager.interested?(%SapSystemRolledUp{
                 snapshot: %SapSystem{
                   instances: application_instances
                 }
               })
    end

    test "should start process managers when DatabaseRolledUp arrives" do
      [%{host_id: db_host_id_1}, %{host_id: db_host_id_2}] =
        database_instances = build_list(2, :sap_system_instance)

      assert {:start, [^db_host_id_1, ^db_host_id_2]} =
               DeregistrationProcessManager.interested?(%DatabaseRolledUp{
                 snapshot: %Database{
                   instances: database_instances
                 }
               })
    end

    test "should continue the process manager when HostDeregistrationRequested arrives" do
      host_id = UUID.uuid4()

      assert {:continue, ^host_id} =
               DeregistrationProcessManager.interested?(%HostDeregistrationRequested{
                 host_id: host_id
               })
    end

    test "should continue the process manager when HostRemovedFromCluster arrives" do
      host_id = UUID.uuid4()

      assert {:continue, ^host_id} =
               DeregistrationProcessManager.interested?(%HostRemovedFromCluster{host_id: host_id})
    end

    test "should continue the process manager when DatabaseInstanceDeregistered arrives" do
      host_id = UUID.uuid4()

      assert {:continue, ^host_id} =
               DeregistrationProcessManager.interested?(%DatabaseInstanceDeregistered{
                 host_id: host_id
               })
    end

    test "should continue the process manager when ApplicationInstanceDeregistered arrives" do
      host_id = UUID.uuid4()

      assert {:continue, ^host_id} =
               DeregistrationProcessManager.interested?(%ApplicationInstanceDeregistered{
                 host_id: host_id
               })
    end

    test "should stop the process manager when HostDeregistered arrives" do
      host_id = UUID.uuid4()

      assert {:stop, ^host_id} =
               DeregistrationProcessManager.interested?(%HostDeregistered{host_id: host_id})
    end

    test "should continue the process manager when ApplicationInstanceMoved arrives" do
      old_host_id = UUID.uuid4()
      new_host_id = UUID.uuid4()

      assert {:continue, [^old_host_id, ^new_host_id]} =
               DeregistrationProcessManager.interested?(%ApplicationInstanceMoved{
                 old_host_id: old_host_id,
                 new_host_id: new_host_id
               })
    end
  end

  describe "host registration procedure" do
    test "should update the state with the proper cluster id when HostAddedToCluster event is emitted" do
      initial_state = %DeregistrationProcessManager{}
      cluster_id = UUID.uuid4()
      host_id = UUID.uuid4()

      events = [%HostAddedToCluster{cluster_id: cluster_id, host_id: host_id}]

      {commands, state} = reduce_events(events, initial_state)

      assert [] == commands
      assert %DeregistrationProcessManager{cluster_id: ^cluster_id} = state
    end

    test "should add database instance with the proper host id when DatabaseInstanceRegistered event is emitted" do
      initial_state = %DeregistrationProcessManager{
        database_instances: [],
        application_instances: []
      }

      host_id = UUID.uuid4()
      database_id = UUID.uuid4()
      instance_number = "01"

      events = [
        %DatabaseInstanceRegistered{
          host_id: host_id,
          database_id: database_id,
          instance_number: instance_number
        }
      ]

      {commands, state} = reduce_events(events, initial_state)

      assert [] == commands

      assert %DeregistrationProcessManager{
               database_instances: [
                 %Instance{
                   sap_system_id: ^database_id,
                   instance_number: ^instance_number
                 }
               ],
               application_instances: []
             } = state
    end

    test "should add application instance when ApplicationInstanceRegistered event is emitted" do
      sap_system_id_1 = UUID.uuid4()
      instance_number_1 = "01"

      initial_state = %DeregistrationProcessManager{
        database_instances: [],
        application_instances: [
          %Instance{
            sap_system_id: sap_system_id_1,
            instance_number: instance_number_1
          }
        ]
      }

      host_id = UUID.uuid4()
      sap_system_id_2 = UUID.uuid4()
      instance_number_2 = "01"

      events = [
        %ApplicationInstanceRegistered{
          host_id: host_id,
          sap_system_id: sap_system_id_2,
          instance_number: instance_number_2
        }
      ]

      {commands, state} = reduce_events(events, initial_state)

      assert [] == commands

      assert %DeregistrationProcessManager{
               database_instances: [],
               application_instances: [
                 %Instance{
                   sap_system_id: ^sap_system_id_2,
                   instance_number: ^instance_number_2
                 },
                 %Instance{
                   sap_system_id: ^sap_system_id_1,
                   instance_number: ^instance_number_1
                 }
               ]
             } = state
    end

    test "should update the state with the proper cluster id when ClusterRolledUp event is emitted" do
      initial_state = %DeregistrationProcessManager{}
      cluster_id = UUID.uuid4()
      cluster_hosts = [UUID.uuid4(), UUID.uuid4()]

      events = [
        %ClusterRolledUp{cluster_id: cluster_id, snapshot: %Cluster{hosts: cluster_hosts}}
      ]

      {commands, state} = reduce_events(events, initial_state)

      assert [] == commands
      assert %DeregistrationProcessManager{cluster_id: ^cluster_id} = state
    end

    test "should update state when SapSystemRolledUp event received" do
      sap_system_id = UUID.uuid4()
      instance_number = "00"
      application_instance_number = "01"

      initial_state = %DeregistrationProcessManager{
        database_instances: [
          %Instance{sap_system_id: sap_system_id, instance_number: instance_number}
        ],
        application_instances: []
      }

      events = [
        %SapSystemRolledUp{
          sap_system_id: sap_system_id,
          snapshot: %SapSystem{
            instances: [
              %SapSystemInstance{
                instance_number: application_instance_number
              }
            ]
          }
        }
      ]

      {commands, state} = reduce_events(events, initial_state)

      assert [] == commands

      assert %DeregistrationProcessManager{
               database_instances: [
                 %Instance{
                   sap_system_id: ^sap_system_id,
                   instance_number: ^instance_number
                 }
               ],
               application_instances: [
                 %Instance{
                   sap_system_id: ^sap_system_id,
                   instance_number: ^application_instance_number
                 }
               ]
             } = state
    end

    test "should update state when DatabaseRolledUp event received" do
      sap_system_id = UUID.uuid4()
      database_id = UUID.uuid4()
      instance_number = "00"
      database_instance_number = "01"

      initial_state = %DeregistrationProcessManager{
        database_instances: [],
        application_instances: [
          %Instance{sap_system_id: sap_system_id, instance_number: instance_number}
        ]
      }

      events = [
        %DatabaseRolledUp{
          database_id: database_id,
          snapshot: %Database{
            instances: [
              %SapSystemInstance{
                instance_number: database_instance_number
              }
            ]
          }
        }
      ]

      {commands, state} = reduce_events(events, initial_state)

      assert [] == commands

      assert %DeregistrationProcessManager{
               database_instances: [
                 %Instance{
                   sap_system_id: ^database_id,
                   instance_number: ^database_instance_number
                 }
               ],
               application_instances: [
                 %Instance{
                   sap_system_id: ^sap_system_id,
                   instance_number: ^instance_number
                 }
               ]
             } = state
    end

    test "should update state when ApplicationInstaceMoved event is received removing the instance from the old host" do
      old_host_id = UUID.uuid4()
      new_host_id = UUID.uuid4()
      sap_system_id = UUID.uuid4()
      instance_number = "00"

      # Set identity to process manager instance
      Process.put(:process_uuid, old_host_id)

      initial_state = %DeregistrationProcessManager{
        database_instances: [],
        application_instances: [
          %Instance{
            sap_system_id: sap_system_id,
            instance_number: instance_number
          }
        ]
      }

      events = [
        %ApplicationInstanceMoved{
          sap_system_id: sap_system_id,
          instance_number: instance_number,
          old_host_id: old_host_id,
          new_host_id: new_host_id
        }
      ]

      {commands, state} = reduce_events(events, initial_state)

      assert [] == commands

      assert %DeregistrationProcessManager{
               database_instances: [],
               application_instances: []
             } = state
    end

    test "should update state when ApplicationInstaceMoved event is received adding the instance in the new host" do
      old_host_id = UUID.uuid4()
      new_host_id = UUID.uuid4()
      sap_system_id = UUID.uuid4()
      instance_number = "00"

      initial_state = %DeregistrationProcessManager{
        database_instances: [],
        application_instances: []
      }

      events = [
        %ApplicationInstanceMoved{
          sap_system_id: sap_system_id,
          instance_number: instance_number,
          old_host_id: old_host_id,
          new_host_id: new_host_id
        }
      ]

      {commands, state} = reduce_events(events, initial_state)

      assert [] == commands

      assert %DeregistrationProcessManager{
               database_instances: [],
               application_instances: [
                 %Instance{
                   sap_system_id: ^sap_system_id,
                   instance_number: ^instance_number
                 }
               ]
             } = state
    end
  end

  describe "host deregistration procedure" do
    test "should dispatch DeregisterHost command when HostDeregistrationRequested is emitted" do
      host_id = UUID.uuid4()
      requested_at = DateTime.utc_now()
      initial_state = %DeregistrationProcessManager{}

      events = [%HostDeregistrationRequested{host_id: host_id, requested_at: requested_at}]

      {commands, state} = reduce_events(events, initial_state)

      assert ^initial_state = state
      assert %DeregisterHost{host_id: ^host_id, deregistered_at: ^requested_at} = commands
    end

    test "should dispatch commands when HostDeregistrationRequested is emitted and the host does not belong to a cluster and has instances associated" do
      host_id = UUID.uuid4()
      sap_system_id = UUID.uuid4()
      database_id = UUID.uuid4()
      db_instance_number = "00"
      app_instance_number = "01"
      requested_at = DateTime.utc_now()

      initial_state = %DeregistrationProcessManager{
        cluster_id: nil,
        database_instances: [
          %Instance{sap_system_id: database_id, instance_number: db_instance_number}
        ],
        application_instances: [
          %Instance{sap_system_id: sap_system_id, instance_number: app_instance_number}
        ]
      }

      events = [%HostDeregistrationRequested{host_id: host_id, requested_at: requested_at}]

      {commands, state} = reduce_events(events, initial_state)

      assert ^initial_state = state

      assert [
               %DeregisterDatabaseInstance{
                 database_id: ^database_id,
                 instance_number: ^db_instance_number,
                 host_id: ^host_id,
                 deregistered_at: ^requested_at
               },
               %DeregisterApplicationInstance{
                 sap_system_id: ^sap_system_id,
                 instance_number: ^app_instance_number,
                 host_id: ^host_id,
                 deregistered_at: ^requested_at
               },
               %DeregisterHost{host_id: ^host_id, deregistered_at: ^requested_at}
             ] = commands
    end

    test "should dispatch commands when HostDeregistrationRequested is emitted and the host belongs to a cluster and has no instances associated" do
      host_id = UUID.uuid4()
      cluster_id = UUID.uuid4()
      requested_at = DateTime.utc_now()

      initial_state = %DeregistrationProcessManager{
        cluster_id: cluster_id,
        database_instances: [],
        application_instances: []
      }

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

    test "should dispatch commands when HostDeregistrationRequested is emitted and the host belongs to a cluster and has instances associated" do
      host_id = UUID.uuid4()
      cluster_id = UUID.uuid4()
      sap_system_id = UUID.uuid4()
      database_id = UUID.uuid4()
      db_instance_number = "00"
      app_instance_number = "01"
      requested_at = DateTime.utc_now()

      initial_state = %DeregistrationProcessManager{
        cluster_id: cluster_id,
        database_instances: [
          %Instance{sap_system_id: database_id, instance_number: db_instance_number}
        ],
        application_instances: [
          %Instance{sap_system_id: sap_system_id, instance_number: app_instance_number}
        ]
      }

      events = [%HostDeregistrationRequested{host_id: host_id, requested_at: requested_at}]

      {commands, state} = reduce_events(events, initial_state)

      assert ^initial_state = state

      assert [
               %DeregisterDatabaseInstance{
                 database_id: ^database_id,
                 instance_number: ^db_instance_number,
                 host_id: ^host_id,
                 deregistered_at: ^requested_at
               },
               %DeregisterApplicationInstance{
                 sap_system_id: ^sap_system_id,
                 instance_number: ^app_instance_number,
                 host_id: ^host_id,
                 deregistered_at: ^requested_at
               },
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

    test "should remove instance from state when DatabaseInstanceDeregistered event received" do
      sap_system_id = UUID.uuid4()
      database_id = UUID.uuid4()
      instance_number = "00"

      initial_state = %DeregistrationProcessManager{
        database_instances: [
          %Instance{
            sap_system_id: sap_system_id,
            instance_number: instance_number
          }
        ],
        application_instances: []
      }

      host_id = UUID.uuid4()
      deregistered_at = DateTime.utc_now()

      events = [
        %DatabaseInstanceDeregistered{
          instance_number: instance_number,
          host_id: host_id,
          database_id: database_id,
          deregistered_at: deregistered_at
        }
      ]

      {commands, state} = reduce_events(events, initial_state)

      assert [] == commands

      assert %DeregistrationProcessManager{
               database_instances: [],
               application_instances: []
             } = state
    end

    test "should remove instance from state when ApplicationInstanceDeregistered event received" do
      sap_system_id = UUID.uuid4()
      instance_number = "00"

      initial_state = %DeregistrationProcessManager{
        database_instances: [],
        application_instances: [
          %Instance{
            sap_system_id: sap_system_id,
            instance_number: instance_number
          }
        ]
      }

      host_id = UUID.uuid4()
      deregistered_at = DateTime.utc_now()

      events = [
        %ApplicationInstanceDeregistered{
          instance_number: instance_number,
          host_id: host_id,
          sap_system_id: sap_system_id,
          deregistered_at: deregistered_at
        }
      ]

      {commands, state} = reduce_events(events, initial_state)

      assert [] == commands

      assert %DeregistrationProcessManager{
               database_instances: [],
               application_instances: []
             } = state
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
