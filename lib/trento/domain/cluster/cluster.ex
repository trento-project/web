defmodule Trento.Domain.Cluster do
  @moduledoc """
  The cluster aggregate manages all the domain logic related to
  deployed HA Clusters (Pacemaker, Corosync, etc).
  The HA cluster is used to handle the high availability scenarios on the installed
  SAP infrastructure. That's why this domain is tailored to work on clusters managing
  SAP workloads.

  Each deployed cluster is registered as a new aggregate entry, meaning that all the hosts belonging
  to the same cluster are part of the same stream.

  A new cluster is registered when a cluster discovery message from any of the nodes of the cluster is received.

  The cluster details will be populated if the received discovery message is coming from the **designated controller** node.
  Otherwise the cluster details are left as unknown, and filled once a message from the **designated controller** is received.
  Once a cluster is registered, other hosts will be added when cluster discovery messages from them are received.

  All the hosts are listed in the `hosts` field.


  The cluster aggregate stores and updates information coming in the cluster discovery messages such as:

  - Cluster name
  - Number of hosts and cluster resources
  - Platform where the host is running (the cloud provider for instance)
  - Managed SAP workload SID

  ## Cluster health

  The cluster health is one of the most relevant concepts of this domain.
  It shows if the cluster is working as expected or not, and in the second case,
  what is the roout cause of the issue and if there is some possible remediation.
  It is composed by sub-health elements:

  - Discovered health
  - Checks health

  The main cluster health is computed using the values from these two. This means that the cluster health is the
  worst of the two.

  ### Discovered health

  The discovered health comes from the cluster discovery messages and it depends on the cluster type.
  Each cluster type has a different way of evaluating the health.

  ### Checks health

  The checks health is obtained from the [Checks Engine executions](https://github.com/trento-project/wanda/).
  Every time a checks execution is started, the selected checks for this cluster are executed, and based on the result
  the health value is updated. The checks are started from a user request or periodically following the
  project scheduler configuration.

  This domain only knows about the health, the details about the execution are stored in the
  [Checks Engine](https://github.com/trento-project/wanda/).
  """

  require Trento.Domain.Enums.Provider, as: Provider
  require Trento.Domain.Enums.ClusterType, as: ClusterType
  require Trento.Domain.Enums.Health, as: Health

  alias Commanded.Aggregate.Multi

  alias Trento.Domain.{
    Cluster,
    HanaClusterDetails,
    HealthService
  }

  alias Trento.Domain.Commands.{
    CompleteChecksExecution,
    RegisterClusterHost,
    RollUpCluster,
    SelectChecks
  }

  alias Trento.Domain.Events.{
    ChecksExecutionCompleted,
    ChecksExecutionRequested,
    ChecksExecutionStarted,
    ChecksSelected,
    ClusterChecksHealthChanged,
    ClusterDetailsUpdated,
    ClusterDiscoveredHealthChanged,
    ClusterHealthChanged,
    ClusterRegistered,
    ClusterRolledUp,
    ClusterRollUpRequested,
    HostAddedToCluster,
    HostChecksExecutionCompleted
  }

  @required_fields []
  @legacy_events [
    ChecksExecutionCompleted,
    ChecksExecutionRequested,
    ChecksExecutionStarted,
    HostChecksExecutionCompleted
  ]

  use Trento.Type

  deftype do
    field :cluster_id, Ecto.UUID
    field :name, :string
    field :type, Ecto.Enum, values: ClusterType.values()
    field :sid, :string
    field :resources_number, :integer
    field :hosts_number, :integer
    field :provider, Ecto.Enum, values: Provider.values()
    field :discovered_health, Ecto.Enum, values: Health.values()
    field :checks_health, Ecto.Enum, values: Health.values()
    field :health, Ecto.Enum, values: Health.values(), default: Health.unknown()
    field :hosts, {:array, :string}, default: []
    field :selected_checks, {:array, :string}, default: []
    field :rolling_up, :boolean, default: false
    embeds_one :details, HanaClusterDetails
  end

  def execute(%Cluster{rolling_up: true}, _), do: {:error, :cluster_rolling_up}

  # When a DC cluster node is registered for the first time,
  # a cluster is registered and the host of the node is added to the cluster,
  # we took the full details of the cluster because the first host is DC
  def execute(
        %Cluster{cluster_id: nil},
        %RegisterClusterHost{
          cluster_id: cluster_id,
          host_id: host_id,
          name: name,
          type: type,
          sid: sid,
          provider: provider,
          resources_number: resources_number,
          hosts_number: hosts_number,
          details: details,
          discovered_health: health,
          designated_controller: true
        }
      ) do
    [
      %ClusterRegistered{
        cluster_id: cluster_id,
        name: name,
        type: type,
        sid: sid,
        provider: provider,
        resources_number: resources_number,
        hosts_number: hosts_number,
        details: details,
        health: health
      },
      %HostAddedToCluster{
        cluster_id: cluster_id,
        host_id: host_id
      }
    ]
  end

  # When a message from a not registered cluster node is received, and this node is **not** a DC,
  # a new cluster is registered including the host that sent the message.
  # In this case, the cluster details are left empty as the node is not the DC
  def execute(%Cluster{cluster_id: nil}, %RegisterClusterHost{
        cluster_id: cluster_id,
        name: name,
        host_id: host_id,
        designated_controller: false
      }) do
    [
      %ClusterRegistered{
        cluster_id: cluster_id,
        name: name,
        type: :unknown,
        sid: nil,
        provider: :unknown,
        resources_number: nil,
        hosts_number: nil,
        details: nil,
        health: :unknown
      },
      %HostAddedToCluster{
        cluster_id: cluster_id,
        host_id: host_id
      }
    ]
  end

  def execute(
        %Cluster{} = cluster,
        %RegisterClusterHost{
          host_id: host_id,
          designated_controller: false
        }
      ) do
    maybe_emit_host_added_to_cluster_event(cluster, host_id)
  end

  # When a message arrives from a non DC host who belongs to a cluster, we add that host to the cluster
  def execute(
        %Cluster{} = cluster,
        %RegisterClusterHost{
          designated_controller: true,
          host_id: host_id
        } = command
      ) do
    cluster
    |> Multi.new()
    |> Multi.execute(fn cluster -> maybe_emit_host_added_to_cluster_event(cluster, host_id) end)
    |> Multi.execute(fn cluster -> maybe_emit_cluster_details_updated_event(cluster, command) end)
    |> Multi.execute(fn cluster ->
      maybe_emit_cluster_discovered_health_changed_event(cluster, command)
    end)
    |> Multi.execute(fn cluster -> maybe_emit_cluster_health_changed_event(cluster) end)
  end

  def execute(%Cluster{cluster_id: nil}, _),
    do: {:error, :cluster_not_found}

  # Checks selected
  def execute(
        %Cluster{
          cluster_id: cluster_id
        } = cluster,
        %SelectChecks{
          checks: selected_checks
        }
      ) do
    cluster
    |> Multi.new()
    |> Multi.execute(fn _ ->
      [
        %ChecksSelected{
          cluster_id: cluster_id,
          checks: selected_checks
        }
      ]
    end)
    |> Multi.execute(fn cluster -> maybe_emit_cluster_health_changed_event(cluster) end)
  end

  def execute(
        %Cluster{
          cluster_id: cluster_id
        } = cluster,
        %CompleteChecksExecution{
          cluster_id: cluster_id
        } = command
      ) do
    cluster
    |> Multi.new()
    |> Multi.execute(&maybe_emit_cluster_checks_health_changed_event(&1, command))
    |> Multi.execute(&maybe_emit_cluster_health_changed_event/1)
  end

  def execute(
        %Cluster{cluster_id: cluster_id} = snapshot,
        %RollUpCluster{}
      ) do
    %ClusterRollUpRequested{
      cluster_id: cluster_id,
      snapshot: snapshot
    }
  end

  def apply(
        %Cluster{} = cluster,
        %ClusterRegistered{
          cluster_id: cluster_id,
          name: name,
          type: type,
          sid: sid,
          provider: provider,
          resources_number: resources_number,
          hosts_number: hosts_number,
          details: details,
          health: health
        }
      ) do
    %Cluster{
      cluster
      | cluster_id: cluster_id,
        name: name,
        type: type,
        sid: sid,
        provider: provider,
        resources_number: resources_number,
        hosts_number: hosts_number,
        details: details,
        discovered_health: health,
        health: health
    }
  end

  def apply(%Cluster{} = cluster, %ClusterDiscoveredHealthChanged{
        discovered_health: discovered_health
      }) do
    %Cluster{
      cluster
      | discovered_health: discovered_health
    }
  end

  def apply(%Cluster{} = cluster, %ClusterChecksHealthChanged{
        checks_health: checks_health
      }) do
    %Cluster{
      cluster
      | checks_health: checks_health
    }
  end

  def apply(
        %Cluster{} = cluster,
        %ClusterDetailsUpdated{
          name: name,
          type: type,
          sid: sid,
          provider: provider,
          resources_number: resources_number,
          hosts_number: hosts_number,
          details: details
        }
      ) do
    %Cluster{
      cluster
      | name: name,
        type: type,
        sid: sid,
        provider: provider,
        resources_number: resources_number,
        hosts_number: hosts_number,
        details: details
    }
  end

  def apply(
        %Cluster{hosts: hosts} = cluster,
        %HostAddedToCluster{
          host_id: host_id
        }
      ) do
    %Cluster{
      cluster
      | hosts: [host_id | hosts]
    }
  end

  def apply(
        %Cluster{} = cluster,
        %ChecksSelected{
          checks: selected_checks
        }
      ) do
    %Cluster{
      cluster
      | selected_checks: selected_checks
    }
  end

  def apply(%Cluster{} = cluster, %ClusterHealthChanged{health: health}) do
    %Cluster{cluster | health: health}
  end

  def apply(%Cluster{} = cluster, %ClusterRollUpRequested{}) do
    %Cluster{cluster | rolling_up: true}
  end

  def apply(%Cluster{}, %ClusterRolledUp{
        snapshot: snapshot
      }) do
    snapshot
  end

  def apply(cluster, %legacy_event{}) when legacy_event in @legacy_events, do: cluster

  defp maybe_emit_host_added_to_cluster_event(
         %Cluster{cluster_id: cluster_id, hosts: hosts},
         host_id
       ) do
    if host_id in hosts do
      []
    else
      [
        %HostAddedToCluster{
          cluster_id: cluster_id,
          host_id: host_id
        }
      ]
    end
  end

  defp maybe_emit_cluster_details_updated_event(
         %Cluster{
           name: name,
           type: type,
           sid: sid,
           provider: provider,
           resources_number: resources_number,
           hosts_number: hosts_number,
           details: details
         },
         %RegisterClusterHost{
           name: name,
           type: type,
           sid: sid,
           provider: provider,
           resources_number: resources_number,
           hosts_number: hosts_number,
           details: details
         }
       ) do
    nil
  end

  defp maybe_emit_cluster_details_updated_event(
         %Cluster{},
         %RegisterClusterHost{
           cluster_id: cluster_id,
           name: name,
           type: type,
           sid: sid,
           provider: provider,
           resources_number: resources_number,
           hosts_number: hosts_number,
           details: details
         }
       ) do
    %ClusterDetailsUpdated{
      cluster_id: cluster_id,
      name: name,
      type: type,
      sid: sid,
      provider: provider,
      resources_number: resources_number,
      hosts_number: hosts_number,
      details: details
    }
  end

  defp maybe_emit_cluster_discovered_health_changed_event(
         %Cluster{discovered_health: discovered_health},
         %RegisterClusterHost{discovered_health: discovered_health}
       ),
       do: nil

  defp maybe_emit_cluster_discovered_health_changed_event(
         %Cluster{cluster_id: cluster_id},
         %RegisterClusterHost{discovered_health: discovered_health}
       ) do
    %ClusterDiscoveredHealthChanged{
      cluster_id: cluster_id,
      discovered_health: discovered_health
    }
  end

  defp maybe_emit_cluster_checks_health_changed_event(
         %Cluster{checks_health: checks_health},
         %CompleteChecksExecution{health: checks_health}
       ),
       do: nil

  defp maybe_emit_cluster_checks_health_changed_event(
         %Cluster{cluster_id: cluster_id},
         %CompleteChecksExecution{health: checks_health}
       ) do
    %ClusterChecksHealthChanged{
      cluster_id: cluster_id,
      checks_health: checks_health
    }
  end

  defp maybe_add_checks_health(healths, _, []), do: healths
  defp maybe_add_checks_health(healths, checks_health, _), do: [checks_health | healths]

  defp maybe_emit_cluster_health_changed_event(%Cluster{
         cluster_id: cluster_id,
         discovered_health: discovered_health,
         checks_health: checks_health,
         selected_checks: selected_checks,
         health: health
       }) do
    new_health =
      [discovered_health]
      |> maybe_add_checks_health(checks_health, selected_checks)
      |> Enum.filter(& &1)
      |> HealthService.compute_aggregated_health()

    if new_health != health do
      %ClusterHealthChanged{cluster_id: cluster_id, health: new_health}
    end
  end
end
