defmodule Trento.Infrastructure.Commanded.ProcessManagers.DeregistrationProcessManager do
  @moduledoc """
    DeregistrationProcessManager is a Commanded ProcessManager, it's the responsible
    for the deregistration procedure for the aggregates

    This represents a transaction to ensure that the procedure of deregistering domain aggregates
    follows a certain path and satisfies some requisites.

    For more information see https://hexdocs.pm/commanded/process-managers.html
  """

  defmodule Instance do
    @moduledoc """
    An application or database instance and which SAP System/Database it belongs to.
    """
    @required_fields :all
    use Trento.Support.Type

    deftype do
      field :sap_system_id, Ecto.UUID
      field :instance_number, :string
    end
  end

  use Commanded.ProcessManagers.ProcessManager,
    application: Trento.Commanded,
    name: "deregistration_process_manager"

  @required_fields []
  use Trento.Support.Type

  deftype do
    field :cluster_id, Ecto.UUID
    embeds_many :application_instances, Instance
    embeds_many :database_instances, Instance
  end

  alias Trento.Infrastructure.Commanded.ProcessManagers.DeregistrationProcessManager

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
    ApplicationInstanceRegistered,
    SapSystemRolledUp
  }

  alias Trento.Clusters.Events.{
    ClusterRolledUp,
    HostAddedToCluster,
    HostRemovedFromCluster
  }

  alias Trento.Hosts.Commands.DeregisterHost

  alias Trento.Databases.Commands.DeregisterDatabaseInstance
  alias Trento.SapSystems.Commands.DeregisterApplicationInstance

  alias Trento.Clusters.Commands.DeregisterClusterHost

  alias Trento.SapSystems
  alias Trento.SapSystems.SapSystem

  alias Trento.Databases.Database

  @doc """
    The Process Manager is started by the following events (provided the instance hasn't been started already):
    - HostRegistered for a newly registered host.
    - HostAddedToCluster when a Host gets added to a Cluster, as this event may arrive prior to the
      HostRegistered event.
    - DatabaseInstanceRegistered when an instance gets added to a SAP system, as this event may arrive prior to the
      HostRegistered event.
    - ApplicationInstanceRegistered when an instance gets added to a SAP system, as this event may arrive prior to the
      HostRegistered event.
    - "Rolled-Up" events:
        - HostRolledUp as the HostRegistered event might have been rolled up.
        - ClusterRolledUp as the HostAddedToCluster event might have been rolled up.
        - SapSystemRolledUp as the ApplicationInstanceRegistered events might have been rolled up.
        - DatabaseRolledUp as the DatabaseInstanceRegistered events might have been rolled up.

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
          instances: app_instances
        }
      }),
      do:
        {:start,
         app_instances
         |> Enum.map(fn %SapSystems.Instance{host_id: host_id} -> host_id end)
         |> Enum.uniq()}

  def interested?(%DatabaseRolledUp{
        snapshot: %Database{
          instances: db_instances
        }
      }),
      do:
        {:start,
         db_instances
         |> Enum.map(fn %SapSystems.Instance{host_id: host_id} -> host_id end)
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
          database_instances: database_instances,
          application_instances: application_instances
        },
        %HostDeregistrationRequested{
          host_id: host_id,
          requested_at: requested_at
        }
      ) do
    database_instances_deregister_commands =
      Enum.map(database_instances, fn %Instance{
                                        sap_system_id: database_id,
                                        instance_number: instance_number
                                      } ->
        %DeregisterDatabaseInstance{
          database_id: database_id,
          instance_number: instance_number,
          host_id: host_id,
          deregistered_at: requested_at
        }
      end)

    application_instances_deregister_commands =
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
      end)

    database_instances_deregister_commands ++
      application_instances_deregister_commands ++
      maybe_deregister_cluster_host(cluster_id, host_id, requested_at) ++
      [%DeregisterHost{host_id: host_id, deregistered_at: requested_at}]
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
          database_id: database_id,
          instance_number: instance_number
        }
      ) do
    %DeregistrationProcessManager{
      state
      | database_instances: [
          %Instance{
            sap_system_id: database_id,
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
          application_instances: application_instances
        } = state,
        %SapSystemRolledUp{
          sap_system_id: snapshot_sap_system_id,
          snapshot: %SapSystem{
            instances: snapshot_application_instances
          }
        }
      ) do
    new_application_instances =
      snapshot_application_instances
      |> Enum.map(fn %SapSystems.Instance{
                       instance_number: instance_number
                     } ->
        %Instance{sap_system_id: snapshot_sap_system_id, instance_number: instance_number}
      end)
      |> Enum.concat(application_instances)
      |> Enum.uniq()

    %DeregistrationProcessManager{
      state
      | application_instances: new_application_instances
    }
  end

  def apply(
        %DeregistrationProcessManager{
          database_instances: database_instances
        } = state,
        %DatabaseRolledUp{
          database_id: snapshot_database_id,
          snapshot: %Database{
            instances: snapshot_database_instances
          }
        }
      ) do
    new_database_instances =
      snapshot_database_instances
      |> Enum.map(fn %SapSystems.Instance{
                       instance_number: instance_number
                     } ->
        %Instance{sap_system_id: snapshot_database_id, instance_number: instance_number}
      end)
      |> Enum.concat(database_instances)
      |> Enum.uniq()

    %DeregistrationProcessManager{
      state
      | database_instances: new_database_instances
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

  # Ignore the legacy_system error. The instance to deregister does not exist
  # because it was a leftover instance

  def error({:error, :legacy_sap_system}, _command_or_event, _context),
    do: {:skip, :continue_pending}

  # Retry the rollup errors, stop the process on other errors

  def error({:error, :host_rolling_up}, _command_or_event, %{context: context}),
    do: {:retry, context}

  def error({:error, :cluster_rolling_up}, _command_or_event, %{context: context}),
    do: {:retry, context}

  def error({:error, :sap_system_rolling_up}, _command_or_event, %{context: context}),
    do: {:retry, context}

  def error({:error, :database_rolling_up}, _command_or_event, %{context: context}),
    do: {:retry, context}

  defp maybe_deregister_cluster_host(nil, _, _), do: []

  defp maybe_deregister_cluster_host(cluster_id, host_id, requested_at) do
    [
      %DeregisterClusterHost{
        host_id: host_id,
        cluster_id: cluster_id,
        deregistered_at: requested_at
      }
    ]
  end
end
