defmodule Trento.DeregistrationProcessManager do
  @moduledoc """
    DeregistrationProcessManager is a Commanded ProcessManager, it's the responsible
    for the deregistration procedure for the aggregates

    This represents a transaction to ensure that the procedure of deregistering domain aggregates
    follows a certain path and satisfies some requisites.

    For more information see https://hexdocs.pm/commanded/process-managers.html
  """

  defmodule Instance do
    @moduledoc """
    An application or database instance and which SAP System it belongs to.
    """
    @required_fields :all
    use Trento.Type

    deftype do
      field :sap_system_id, Ecto.UUID
      field :instance_number, :string
    end
  end

  defmodule Instance do
    @moduledoc """
    An application or database instance and which SAP System it belongs to.
    """
    @required_fields :all
    use Trento.Type

    deftype do
      field :sap_system_id, Ecto.UUID
      field :instance_number, :string
    end
  end

  @required_fields :all

  use Trento.Type

  use Commanded.ProcessManagers.ProcessManager,
    application: Trento.Commanded,
    name: "deregistration_process_manager"

  deftype do
    field :cluster_id, Ecto.UUID
    embeds_many :application_instances, Instance
    embeds_many :database_instances, Instance
  end

  alias Trento.DeregistrationProcessManager

  alias Trento.Domain.Events.{
    ApplicationInstanceDeregistered,
    ApplicationInstanceRegistered,
    ClusterRolledUp,
    DatabaseInstanceDeregistered,
    DatabaseInstanceRegistered,
    HostAddedToCluster,
    HostDeregistered,
    HostDeregistrationRequested,
    HostRegistered,
    HostRemovedFromCluster,
    HostRolledUp,
    SapSystemRolledUp
  }

  alias Trento.Domain.Commands.{
    DeregisterApplicationInstance,
    DeregisterClusterHost,
    DeregisterDatabaseInstance,
    DeregisterHost
  }

  alias Trento.Domain.SapSystem

  @doc """
    The Process Manager is started by the following events (provided the instance hasn't been started already):
    - HostRegistered starts a Process Manager for a newly registered host.
    - HostAddedToCluster starts a Process Manager when a Host gets added to a Cluster, as this event may arrive
      prior to the HostRegistered event.
    - DatabaseInstanceRegistered starts a Process Manager when an instance gets added to a SAP system, as this
      event may arrive prior to the HostRegistered event.
    - ApplicationInstanceRegistered starts a Process Manager when an instance gets added to a SAP system, as this
      event may arrive prior to the HostRegistered event.
    - "Rolled-Up" events:
        - HostRolledUp starts the Process Manager as the HostRegistered event might have been rolled up.
        - ClusterRolledUp starts the Process Manager as the HostAddedToCluster event might have been rolled up.
        - SapSystemRolledUp starts the Process Manager as the DatabaseInstanceRegistered/ApplicationInstanceRegistered
          events might have been rolled up.

    HostDeregistered stops a Process Manager for the Host identified by host_id.
  """
  # Start the Process Manager
  def interested?(%HostRegistered{host_id: host_id}), do: {:start, host_id}
  def interested?(%HostRolledUp{host_id: host_id}), do: {:start, host_id}
  def interested?(%HostAddedToCluster{host_id: host_id}), do: {:start, host_id}
  def interested?(%ClusterRolledUp{snapshot: %{hosts: hosts}}), do: {:start, hosts}
  def interested?(%DatabaseInstanceRegistered{host_id: host_id}), do: {:start, host_id}
  def interested?(%ApplicationInstanceRegistered{host_id: host_id}), do: {:start, host_id}

  def interested?(%SapSystemRolledUp{
        snapshot: %SapSystem{
          database: %SapSystem.Database{instances: db_instances},
          application: %SapSystem.Application{instances: app_instances}
        }
      }),
      do:
        {:start,
         (db_instances ++ app_instances)
         |> Enum.map(fn %SapSystem.Instance{host_id: host_id} -> host_id end)
         |> Enum.uniq()}

  # Continue the Process Manager
  def interested?(%HostDeregistrationRequested{host_id: host_id}), do: {:continue, host_id}
  def interested?(%HostRemovedFromCluster{host_id: host_id}), do: {:continue, host_id}
  def interested?(%DatabaseInstanceDeregistered{host_id: host_id}), do: {:continue, host_id}
  def interested?(%ApplicationInstanceDeregistered{host_id: host_id}), do: {:continue, host_id}
  # Stop the Process Manager
  def interested?(%HostDeregistered{host_id: host_id}), do: {:stop, host_id}

  def interested?(_event), do: false

  def handle(
        %DeregistrationProcessManager{
          cluster_id: nil,
          application_instances: [],
          database_instances: []
        },
        %HostDeregistrationRequested{
          host_id: host_id,
          requested_at: requested_at
        }
      ) do
    %DeregisterHost{host_id: host_id, deregistered_at: requested_at}
  end

  def handle(
        %DeregistrationProcessManager{
          cluster_id: cluster_id,
          application_instances: [],
          database_instances: []
        },
        %HostDeregistrationRequested{
          host_id: host_id,
          requested_at: requested_at
        }
      ) do
    [
      %DeregisterClusterHost{
        host_id: host_id,
        cluster_id: cluster_id,
        deregistered_at: requested_at
      },
      %DeregisterHost{host_id: host_id, deregistered_at: requested_at}
    ]
  end

  def handle(
        %DeregistrationProcessManager{
          cluster_id: cluster_id,
          database_instances: database_instances,
          application_instances: application_instances
        },
        %HostDeregistrationRequested{
          host_id: host_id,
          requested_at: requested_at
        }
      ) do
    List.flatten([
      %DeregisterClusterHost{
        host_id: host_id,
        cluster_id: cluster_id,
        deregistered_at: requested_at
      },
      Enum.map(database_instances, fn %Instance{
                                        sap_system_id: sap_system_id,
                                        instance_number: instance_number
                                      } ->
        %DeregisterDatabaseInstance{
          sap_system_id: sap_system_id,
          instance_number: instance_number,
          host_id: host_id,
          deregistered_at: requested_at
        }
      end),
      Enum.map(application_instances, fn %Instance{
                                           sap_system_id: sap_system_id,
                                           instance_number: instance_number
                                         } ->
        %DeregisterApplicationInstance{
          sap_system_id: sap_system_id,
          instance_number: instance_number,
          host_id: host_id,
          deregistered_at: requested_at
        }
      end),
      %DeregisterHost{host_id: host_id, deregistered_at: requested_at}
    ])
  end

  def apply(%DeregistrationProcessManager{} = state, %HostAddedToCluster{
        cluster_id: cluster_id
      }) do
    %DeregistrationProcessManager{state | cluster_id: cluster_id}
  end

  def apply(%DeregistrationProcessManager{} = state, %HostRemovedFromCluster{}) do
    %DeregistrationProcessManager{state | cluster_id: nil}
  end

  def apply(%DeregistrationProcessManager{} = state, %ClusterRolledUp{
        cluster_id: cluster_id
      }) do
    %DeregistrationProcessManager{state | cluster_id: cluster_id}
  end

  def apply(
        %DeregistrationProcessManager{database_instances: database_instances} = state,
        %DatabaseInstanceRegistered{
          sap_system_id: sap_system_id,
          instance_number: instance_number
        }
      ) do
    %DeregistrationProcessManager{
      state
      | database_instances: [
          %Instance{
            sap_system_id: sap_system_id,
            instance_number: instance_number
          }
          | database_instances
        ]
    }
  end

  def apply(
        %DeregistrationProcessManager{application_instances: application_instances} = state,
        %ApplicationInstanceRegistered{
          sap_system_id: sap_system_id,
          instance_number: instance_number
        }
      ) do
    %DeregistrationProcessManager{
      state
      | application_instances: [
          %Instance{
            sap_system_id: sap_system_id,
            instance_number: instance_number
          }
          | application_instances
        ]
    }
  end

  def apply(
        %DeregistrationProcessManager{
          database_instances: database_instances,
          application_instances: application_instances
        } = state,
        %SapSystemRolledUp{
          sap_system_id: snapshot_sap_system_id,
          snapshot: %SapSystem{
            database: %SapSystem.Database{instances: snapshot_database_instances},
            application: %SapSystem.Application{instances: snapshot_application_instances}
          }
        }
      ) do
    %DeregistrationProcessManager{
      state
      | database_instances:
          snapshot_database_instances
          |> Enum.map(fn %SapSystem.Instance{
                           instance_number: instance_number
                         } ->
            %Instance{sap_system_id: snapshot_sap_system_id, instance_number: instance_number}
          end)
          |> Enum.concat(database_instances)
          |> Enum.uniq(),
        application_instances:
          snapshot_application_instances
          |> Enum.map(fn %SapSystem.Instance{
                           instance_number: instance_number
                         } ->
            %Instance{sap_system_id: snapshot_sap_system_id, instance_number: instance_number}
          end)
          |> Enum.concat(application_instances)
          |> Enum.uniq()
    }
  end

  def apply(
        %DeregistrationProcessManager{database_instances: database_instances} = state,
        %DatabaseInstanceDeregistered{instance_number: instance_number}
      ) do
    %DeregistrationProcessManager{
      state
      | database_instances:
          Enum.reject(database_instances, fn %Instance{
                                               instance_number: current_instance_number
                                             } ->
            current_instance_number == instance_number
          end)
    }
  end

  def apply(
        %DeregistrationProcessManager{application_instances: application_instances} = state,
        %ApplicationInstanceDeregistered{instance_number: instance_number}
      ) do
    %DeregistrationProcessManager{
      state
      | application_instances:
          Enum.reject(application_instances, fn %Instance{
                                                  instance_number: current_instance_number
                                                } ->
            current_instance_number == instance_number
          end)
    }
  end
end
