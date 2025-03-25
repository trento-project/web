defmodule Trento.Clusters.Cluster do
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

  require Trento.Enums.Provider, as: Provider
  require Trento.Clusters.Enums.ClusterType, as: ClusterType
  require Trento.Enums.Health, as: Health

  alias Commanded.Aggregate.Multi

  alias Trento.Services.HealthService

  alias Trento.Clusters.Cluster

  alias Trento.Clusters.ValueObjects.{
    AscsErsClusterDetails,
    HanaClusterDetails,
    SapInstance
  }

  alias Trento.Clusters.Commands.{
    CompleteChecksExecution,
    DeregisterClusterHost,
    RegisterClusterHost,
    RollUpCluster,
    SelectChecks
  }

  alias Trento.Domain.Events.{
    ChecksExecutionCompleted,
    ChecksExecutionRequested,
    ChecksExecutionStarted,
    HostChecksExecutionCompleted
  }

  alias Trento.Clusters.Events.{
    ChecksSelected,
    ClusterChecksHealthChanged,
    ClusterDeregistered,
    ClusterDetailsUpdated,
    ClusterDiscoveredHealthChanged,
    ClusterHealthChanged,
    ClusterRegistered,
    ClusterRestored,
    ClusterRolledUp,
    ClusterRollUpRequested,
    ClusterTombstoned,
    HostAddedToCluster,
    HostRemovedFromCluster
  }

  @required_fields []
  @legacy_events [
    ChecksExecutionCompleted,
    ChecksExecutionRequested,
    ChecksExecutionStarted,
    HostChecksExecutionCompleted
  ]

  use Trento.Support.Type

  deftype do
    field :cluster_id, Ecto.UUID
    field :name, :string
    field :type, Ecto.Enum, values: ClusterType.values()
    field :resources_number, :integer
    field :hosts_number, :integer
    field :provider, Ecto.Enum, values: Provider.values()
    field :discovered_health, Ecto.Enum, values: Health.values()
    field :checks_health, Ecto.Enum, values: Health.values(), default: Health.unknown()
    field :health, Ecto.Enum, values: Health.values(), default: Health.unknown()
    field :hosts, {:array, :string}, default: []
    field :selected_checks, {:array, :string}, default: []
    field :rolling_up, :boolean, default: false
    field :deregistered_at, :utc_datetime_usec, default: nil

    field :details, PolymorphicEmbed,
      types: [
        hana_scale_up: [
          module: HanaClusterDetails,
          identify_by_fields: [:system_replication_mode]
        ],
        ascs_ers: [module: AscsErsClusterDetails, identify_by_fields: [:sap_systems]]
      ],
      on_replace: :update

    embeds_many :sap_instances, SapInstance
  end

  def execute(%Cluster{rolling_up: true}, _), do: {:error, :cluster_rolling_up}

  # When a DC node is discovered, a cluster is registered and the host is added to the cluster.
  # The cluster details are populated with the information coming from the DC node.
  def execute(
        %Cluster{cluster_id: nil},
        %RegisterClusterHost{
          cluster_id: cluster_id,
          host_id: host_id,
          name: name,
          type: type,
          sap_instances: sap_instances,
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
        sap_instances: sap_instances,
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

  # When a non-DC node is discovered, a cluster is registered and the host is added to the cluster.
  # The cluster details are left as unknown, and filled once a message from the DC node is received.
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
        sap_instances: [],
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

  def execute(%Cluster{cluster_id: nil}, _),
    do: {:error, :cluster_not_registered}

  # Restoration, when a RegisterClusterHost command is received for a deregistered Cluster
  # the cluster is restored, the host is added to cluster and if the host is a DC
  # cluster details are updated
  def execute(
        %Cluster{deregistered_at: deregistered_at, cluster_id: cluster_id},
        %RegisterClusterHost{
          host_id: host_id,
          designated_controller: false
        }
      )
      when not is_nil(deregistered_at) do
    [
      %ClusterRestored{cluster_id: cluster_id},
      %HostAddedToCluster{
        cluster_id: cluster_id,
        host_id: host_id
      }
    ]
  end

  def execute(
        %Cluster{deregistered_at: deregistered_at, cluster_id: cluster_id} = cluster,
        %RegisterClusterHost{
          host_id: host_id,
          designated_controller: true
        } = command
      )
      when not is_nil(deregistered_at) do
    cluster
    |> Multi.new()
    |> Multi.execute(fn _ ->
      %ClusterRestored{cluster_id: cluster_id}
    end)
    |> Multi.execute(fn _ ->
      %HostAddedToCluster{
        cluster_id: cluster_id,
        host_id: host_id
      }
    end)
    |> maybe_update_cluster(command)
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

  def execute(%Cluster{deregistered_at: deregistered_at}, _) when not is_nil(deregistered_at),
    do: {:error, :cluster_not_registered}

  # If the cluster is already registered, and the host was never discovered before, it is added to the cluster.
  def execute(
        %Cluster{} = cluster,
        %RegisterClusterHost{
          host_id: host_id,
          designated_controller: false
        }
      ) do
    maybe_emit_host_added_to_cluster_event(cluster, host_id)
  end

  # When a DC node is discovered, if the cluster is already registered,
  # the cluster details are updated with the information coming from the DC node.
  # The cluster discovered health is updated based on the new details.
  def execute(
        %Cluster{} = cluster,
        %RegisterClusterHost{
          designated_controller: true
        } = command
      ) do
    cluster
    |> Multi.new()
    |> maybe_update_cluster(command)
  end

  # Checks selected
  def execute(
        %Cluster{
          cluster_id: cluster_id
        },
        %SelectChecks{
          checks: selected_checks
        }
      ) do
    %ChecksSelected{
      cluster_id: cluster_id,
      checks: selected_checks
    }
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
        %Cluster{cluster_id: cluster_id} = cluster,
        %DeregisterClusterHost{
          host_id: host_id,
          cluster_id: cluster_id
        } = command
      ) do
    cluster
    |> Multi.new()
    |> Multi.execute(fn _ ->
      %HostRemovedFromCluster{
        cluster_id: cluster_id,
        host_id: host_id
      }
    end)
    |> Multi.execute(&maybe_emit_cluster_deregistered_event(&1, command))
  end

  def apply(
        %Cluster{} = cluster,
        %ClusterRegistered{
          cluster_id: cluster_id,
          name: name,
          type: type,
          sap_instances: sap_instances,
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
        sap_instances: sap_instances,
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
          sap_instances: sap_instances,
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
        sap_instances: sap_instances,
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

  def apply(%Cluster{hosts: hosts} = cluster, %HostRemovedFromCluster{
        host_id: host_id
      }) do
    %Cluster{cluster | hosts: List.delete(hosts, host_id)}
  end

  # Deregistration
  def apply(%Cluster{} = cluster, %ClusterDeregistered{deregistered_at: deregistered_at}) do
    %Cluster{cluster | deregistered_at: deregistered_at}
  end

  # Restoration
  def apply(%Cluster{} = cluster, %ClusterRestored{}) do
    %Cluster{cluster | deregistered_at: nil}
  end

  def apply(cluster, %legacy_event{}) when legacy_event in @legacy_events, do: cluster

  def apply(%Cluster{} = cluster, %ClusterTombstoned{}), do: cluster

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

  defp maybe_update_cluster(
         multi,
         %RegisterClusterHost{host_id: host_id} = command
       ) do
    multi
    |> Multi.execute(fn cluster -> maybe_emit_host_added_to_cluster_event(cluster, host_id) end)
    |> Multi.execute(fn cluster -> maybe_emit_cluster_details_updated_event(cluster, command) end)
    |> Multi.execute(fn cluster ->
      maybe_emit_cluster_discovered_health_changed_event(cluster, command)
    end)
    |> Multi.execute(fn cluster -> maybe_emit_cluster_health_changed_event(cluster) end)
  end

  defp maybe_emit_cluster_details_updated_event(
         %Cluster{
           name: name,
           type: type,
           sap_instances: sap_instances,
           provider: provider,
           resources_number: resources_number,
           hosts_number: hosts_number,
           details: details
         },
         %RegisterClusterHost{
           name: name,
           type: type,
           sap_instances: sap_instances,
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
           sap_instances: sap_instances,
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
      sap_instances: sap_instances,
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

  defp maybe_emit_cluster_deregistered_event(
         %Cluster{cluster_id: cluster_id, hosts: []},
         %DeregisterClusterHost{
           cluster_id: cluster_id,
           deregistered_at: deregistered_at
         }
       ) do
    [
      %ClusterDeregistered{cluster_id: cluster_id, deregistered_at: deregistered_at},
      %ClusterTombstoned{cluster_id: cluster_id}
    ]
  end

  defp maybe_emit_cluster_deregistered_event(_, _), do: nil

  defp maybe_add_checks_health(healths, Health.unknown()), do: healths
  defp maybe_add_checks_health(healths, checks_health), do: [checks_health | healths]

  defp maybe_emit_cluster_health_changed_event(%Cluster{
         cluster_id: cluster_id,
         discovered_health: discovered_health,
         checks_health: checks_health,
         health: health
       }) do
    new_health =
      [discovered_health]
      |> maybe_add_checks_health(checks_health)
      |> Enum.filter(& &1)
      |> HealthService.compute_aggregated_health()

    if new_health != health do
      %ClusterHealthChanged{cluster_id: cluster_id, health: new_health}
    end
  end
end
