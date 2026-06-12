# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

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

  - Replication health (only applicable for HANA clusters)
  - Distributed health (only applicable for ASCS/ERS clusters)
  - Checks health

  The main cluster health is computed using the values from all of them. This means that the cluster health is a
  computation of them.

  ### Replication health

  The discovered replication health. It is based in the cluster replication values coming from cluster attributes.
  The health is passing if the SR health is 4 and the secondary sync state "SOK". It is critical or
  unknown (when the data is not available) otherwise.

  # Distributed health

  The discovered distributed health. It checks if ASCS and ERS workloads are distributed among 2 nodes and not running
  in a single one. It is passing if all handled SAP systems are distributed and critical otherwise.

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
  require Trento.Clusters.Enums.ClusterHostStatus, as: ClusterHostStatus
  require Trento.Clusters.Enums.ClusterState, as: ClusterState
  require Trento.Enums.Health, as: Health

  alias Commanded.Aggregate.Multi

  alias Trento.Services.HealthService

  alias Trento.Clusters.Cluster

  alias Trento.Clusters.ValueObjects.{
    AscsErsClusterDetails,
    AscsErsClusterHealthDetails,
    HanaClusterDetails,
    HanaClusterHealthDetails,
    SapInstance,
    SbdDevice
  }

  alias Trento.Clusters.Commands.{
    CompleteChecksExecution,
    DeregisterClusterHost,
    RegisterOfflineClusterHost,
    RegisterOnlineClusterHost,
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
    ClusterDistributedHealthChanged,
    ClusterHealthChanged,
    ClusterHostStatusChanged,
    ClusterRegistered,
    ClusterReplicationHealthChanged,
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
    field :health, Ecto.Enum, values: Health.values(), default: Health.unknown()
    field :state, Ecto.Enum, values: ClusterState.values()
    field :hosts, {:array, :string}, default: []
    field :offline_hosts, {:array, :string}, default: []
    field :selected_checks, {:array, :string}, default: []
    field :rolling_up, :boolean, default: false
    field :deregistered_at, :utc_datetime_usec, default: nil

    polymorphic_embeds_one(:details,
      types: [
        hana_scale_up: [
          module: HanaClusterDetails,
          identify_by_fields: [:system_replication_mode]
        ],
        ascs_ers: [module: AscsErsClusterDetails, identify_by_fields: [:sap_systems]]
      ],
      on_replace: :update
    )

    polymorphic_embeds_one(:health_details,
      types: [
        hana_scale_up: HanaClusterHealthDetails,
        hana_scale_out: HanaClusterHealthDetails,
        ascs_ers: AscsErsClusterHealthDetails
      ],
      on_replace: :update,
      use_parent_field_for_type: :type,
      on_type_not_found: :nilify
    )

    embeds_many :sap_instances, SapInstance
  end

  def execute(%Cluster{rolling_up: true}, _), do: {:error, :cluster_rolling_up}

  # When a DC node is discovered, a cluster is registered and the host is added to the cluster.
  # The cluster details are populated with the information coming from the DC node.
  def execute(
        %Cluster{cluster_id: nil},
        %RegisterOnlineClusterHost{
          cluster_id: cluster_id,
          host_id: host_id,
          name: name,
          type: type,
          sap_instances: sap_instances,
          provider: provider,
          resources_number: resources_number,
          hosts_number: hosts_number,
          details: details,
          state: state,
          designated_controller: true
        }
      ) do
    health_details = derive_discovered_health(details)
    health = aggregate_health_details(health_details)

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
        health: health,
        health_details: health_details,
        state: state
      },
      %HostAddedToCluster{
        cluster_id: cluster_id,
        host_id: host_id,
        cluster_host_status: ClusterHostStatus.online()
      }
    ]
  end

  # When a non-DC node is discovered, a cluster is registered and the host is added to the cluster.
  # The cluster details are left as unknown, and filled once a message from the DC node is received.
  def execute(%Cluster{cluster_id: nil}, %RegisterOnlineClusterHost{
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
        health: Health.unknown(),
        health_details: nil,
        state: ClusterState.unknown()
      },
      %HostAddedToCluster{
        cluster_id: cluster_id,
        host_id: host_id,
        cluster_host_status: ClusterHostStatus.online()
      }
    ]
  end

  # When an Offline node is discovered, a cluster is registered and the host is added to the cluster.
  # The cluster details are left as unknown, and filled once a message from the DC node is received.
  def execute(%Cluster{cluster_id: nil}, %RegisterOfflineClusterHost{
        cluster_id: cluster_id,
        name: name,
        host_id: host_id
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
        health: Health.unknown(),
        health_details: nil,
        state: ClusterState.unknown()
      },
      %HostAddedToCluster{
        cluster_id: cluster_id,
        host_id: host_id,
        cluster_host_status: ClusterHostStatus.offline()
      }
    ]
  end

  def execute(%Cluster{cluster_id: nil}, _),
    do: {:error, :cluster_not_registered}

  # Restoration, when a RegisterOnlineClusterHost command is received for a deregistered Cluster
  # the cluster is restored, the host is added to cluster and if the host is a DC
  # cluster details are updated
  # Offline hosts are added to the cluster as well, but the cluster details are not updated
  def execute(
        %Cluster{deregistered_at: deregistered_at, cluster_id: cluster_id},
        %RegisterOnlineClusterHost{
          host_id: host_id,
          designated_controller: false
        }
      )
      when not is_nil(deregistered_at) do
    [
      %ClusterRestored{cluster_id: cluster_id},
      %HostAddedToCluster{
        cluster_id: cluster_id,
        host_id: host_id,
        cluster_host_status: ClusterHostStatus.online()
      }
    ]
  end

  def execute(
        %Cluster{deregistered_at: deregistered_at, cluster_id: cluster_id} = cluster,
        %RegisterOnlineClusterHost{
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
        host_id: host_id,
        cluster_host_status: ClusterHostStatus.online()
      }
    end)
    |> Multi.execute(fn cluster ->
      # TODO: Isn't this duplicate?
      maybe_emit_host_added_to_cluster_event(cluster, host_id, ClusterHostStatus.online())
    end)
    |> Multi.execute(fn cluster -> maybe_emit_cluster_details_updated_event(cluster, command) end)
    |> handle_cluster_health_events(command)
  end

  def execute(
        %Cluster{deregistered_at: deregistered_at, cluster_id: cluster_id},
        %RegisterOfflineClusterHost{
          host_id: host_id
        }
      )
      when not is_nil(deregistered_at) do
    [
      %ClusterRestored{cluster_id: cluster_id},
      %HostAddedToCluster{
        cluster_id: cluster_id,
        host_id: host_id,
        cluster_host_status: ClusterHostStatus.offline()
      }
    ]
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
        %RegisterOnlineClusterHost{
          host_id: host_id,
          designated_controller: false
        }
      ) do
    maybe_emit_host_added_to_cluster_event(cluster, host_id, ClusterHostStatus.online())
  end

  def execute(
        %Cluster{} = cluster,
        %RegisterOfflineClusterHost{
          host_id: host_id
        } = command
      ) do
    cluster
    |> Multi.new()
    |> Multi.execute(fn cluster ->
      maybe_emit_host_added_to_cluster_event(cluster, host_id, ClusterHostStatus.offline())
    end)
    |> Multi.execute(fn cluster ->
      maybe_emit_cluster_details_updated_event(cluster, command)
    end)
    |> handle_cluster_health_events(command)
  end

  # When a DC node is discovered, if the cluster is already registered,
  # the cluster details are updated with the information coming from the DC node.
  # The cluster discovered health is updated based on the new details.
  def execute(
        %Cluster{} = cluster,
        %RegisterOnlineClusterHost{
          host_id: host_id,
          designated_controller: true
        } = command
      ) do
    cluster
    |> Multi.new()
    |> Multi.execute(fn cluster ->
      maybe_emit_host_added_to_cluster_event(cluster, host_id, ClusterHostStatus.online())
    end)
    |> Multi.execute(fn cluster -> maybe_emit_cluster_details_updated_event(cluster, command) end)
    |> handle_cluster_health_events(command)
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
          health: health,
          health_details: health_details,
          state: state
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
        health: health,
        health_details: health_details,
        state: state
    }
  end

  def apply(
        %Cluster{health_details: health_details} = cluster,
        %ClusterReplicationHealthChanged{
          replication_health: replication_health
        }
      ) do
    %HanaClusterHealthDetails{} =
      current_health_details = health_details || %HanaClusterHealthDetails{}

    %Cluster{
      cluster
      | health_details: %HanaClusterHealthDetails{
          current_health_details
          | replication_health: replication_health
        }
    }
  end

  def apply(
        %Cluster{health_details: health_details} = cluster,
        %ClusterDistributedHealthChanged{
          distributed_health: distributed_health
        }
      ) do
    %AscsErsClusterHealthDetails{} =
      current_health_details = health_details || %AscsErsClusterHealthDetails{}

    %Cluster{
      cluster
      | health_details: %AscsErsClusterHealthDetails{
          current_health_details
          | distributed_health: distributed_health
        }
    }
  end

  # Handle old ClusterDiscoveredHealthChanged event.
  # Cannot be superseded by other events as it has different meanings for each cluster type.
  def apply(
        %Cluster{type: cluster_type, health_details: health_details} = cluster,
        %ClusterDiscoveredHealthChanged{
          discovered_health: discovered_health
        }
      )
      when cluster_type in [ClusterType.hana_scale_up(), ClusterType.hana_scale_out()] do
    %HanaClusterHealthDetails{} =
      current_health_details = health_details || %HanaClusterHealthDetails{}

    %Cluster{
      cluster
      | health_details: %HanaClusterHealthDetails{
          current_health_details
          | replication_health: discovered_health
        }
    }
  end

  def apply(
        %Cluster{type: ClusterType.ascs_ers(), health_details: health_details} = cluster,
        %ClusterDiscoveredHealthChanged{
          discovered_health: discovered_health
        }
      ) do
    %AscsErsClusterHealthDetails{} =
      current_health_details = health_details || %AscsErsClusterHealthDetails{}

    %Cluster{
      cluster
      | health_details: %AscsErsClusterHealthDetails{
          current_health_details
          | distributed_health: discovered_health
        }
    }
  end

  def apply(%Cluster{} = cluster, %ClusterDiscoveredHealthChanged{}) do
    cluster
  end

  def apply(
        %Cluster{health_details: %HanaClusterHealthDetails{} = health_details} = cluster,
        %ClusterChecksHealthChanged{
          checks_health: checks_health
        }
      ) do
    %Cluster{
      cluster
      | health_details: %HanaClusterHealthDetails{
          health_details
          | checks_health: checks_health
        }
    }
  end

  def apply(
        %Cluster{health_details: %AscsErsClusterHealthDetails{} = health_details} = cluster,
        %ClusterChecksHealthChanged{
          checks_health: checks_health
        }
      ) do
    %Cluster{
      cluster
      | health_details: %AscsErsClusterHealthDetails{
          health_details
          | checks_health: checks_health
        }
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
          state: state,
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
        state: state,
        details: details
    }
  end

  def apply(
        %Cluster{hosts: hosts} = cluster,
        %HostAddedToCluster{
          host_id: host_id,
          cluster_host_status: ClusterHostStatus.online()
        }
      ) do
    %Cluster{
      cluster
      | hosts: [host_id | hosts]
    }
  end

  def apply(
        %Cluster{hosts: hosts, offline_hosts: offline_host} = cluster,
        %HostAddedToCluster{
          host_id: host_id,
          cluster_host_status: ClusterHostStatus.offline()
        }
      ) do
    %Cluster{
      cluster
      | hosts: [host_id | hosts],
        offline_hosts: [host_id | offline_host]
    }
  end

  def apply(
        %Cluster{offline_hosts: offline_host} = cluster,
        %ClusterHostStatusChanged{
          host_id: host_id,
          cluster_host_status: ClusterHostStatus.online()
        }
      ) do
    %Cluster{
      cluster
      | offline_hosts: List.delete(offline_host, host_id)
    }
  end

  def apply(
        %Cluster{offline_hosts: offline_host} = cluster,
        %ClusterHostStatusChanged{
          host_id: host_id,
          cluster_host_status: ClusterHostStatus.offline()
        }
      ) do
    %Cluster{
      cluster
      | offline_hosts: [host_id | offline_host]
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
    %Cluster{
      cluster
      | hosts: List.delete(hosts, host_id),
        offline_hosts: List.delete(cluster.offline_hosts, host_id)
    }
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

  defp derive_discovered_health(%HanaClusterDetails{} = details) do
    %HanaClusterHealthDetails{
      sbd_health: derive_sbd_health(details),
      replication_health: derive_replication_health(details)
    }
  end

  defp derive_discovered_health(%AscsErsClusterDetails{} = details) do
    %AscsErsClusterHealthDetails{
      sbd_health: derive_sbd_health(details),
      distributed_health: derive_distributed_health(details)
    }
  end

  defp derive_discovered_health(_), do: nil

  defp derive_sbd_health(%{sbd_devices: [_ | _] = sbd_devices}) do
    Enum.find_value(sbd_devices, Health.passing(), fn %SbdDevice{status: status} ->
      if status != :healthy, do: Health.critical()
    end)
  end

  defp derive_sbd_health(_), do: Health.unknown()

  # Passing state if SR Health state is 4 and Sync state is SOK, everything else is critical
  # If data is not present for some reason the state goes to unknown
  defp derive_replication_health(%HanaClusterDetails{
         sr_health_state: "4",
         secondary_sync_state: "SOK"
       }),
       do: Health.passing()

  defp derive_replication_health(%HanaClusterDetails{
         sr_health_state: _,
         secondary_sync_state: _
       }),
       do: Health.critical()

  defp derive_replication_health(_), do: Health.unknown()

  defp derive_distributed_health(%AscsErsClusterDetails{sap_systems: sap_systems}) do
    Enum.find_value(sap_systems, Health.passing(), fn %{distributed: distributed} ->
      if not distributed, do: Health.critical()
    end)
  end

  defp derive_distributed_health(_), do: Health.unknown()

  defp aggregate_health_details(health_details) when is_struct(health_details) do
    health_details
    |> Map.from_struct()
    |> remove_optional_unknown_healths()
    |> Map.values()
    |> Enum.reject(&is_nil/1)
    |> HealthService.compute_aggregated_health()
  end

  defp aggregate_health_details(_), do: Health.unknown()

  defp maybe_emit_host_added_to_cluster_event(
         %Cluster{cluster_id: cluster_id, hosts: hosts, offline_hosts: offline_hosts},
         host_id,
         cluster_host_status
       ) do
    cond do
      host_id not in hosts ->
        %HostAddedToCluster{
          cluster_id: cluster_id,
          host_id: host_id,
          cluster_host_status: cluster_host_status
        }

      host_id in offline_hosts and cluster_host_status == ClusterHostStatus.online() ->
        %ClusterHostStatusChanged{
          cluster_id: cluster_id,
          host_id: host_id,
          cluster_host_status: ClusterHostStatus.online()
        }

      host_id not in offline_hosts and cluster_host_status == ClusterHostStatus.offline() ->
        %ClusterHostStatusChanged{
          cluster_id: cluster_id,
          host_id: host_id,
          cluster_host_status: ClusterHostStatus.offline()
        }

      true ->
        []
    end
  end

  defp accumulate_cluster_health_events(cluster, health_details) do
    health_details_emitters = [
      &maybe_emit_cluster_replication_health_changed_event/2,
      &maybe_emit_cluster_distributed_health_changed_event/2
      # &maybe_emit_cluster_sbd_health_changed_event/2
    ]

    health_details_emitters
    |> Enum.reduce([], fn health_emitter, acc ->
      [health_emitter.(cluster, health_details) | acc]
    end)
    |> Enum.reject(&is_nil/1)
  end

  defp maybe_emit_cluster_health_details_events(
         %Cluster{state: state},
         %RegisterOfflineClusterHost{}
       )
       when state != ClusterState.stopped(),
       do: nil

  defp maybe_emit_cluster_health_details_events(
         %Cluster{state: state, type: cluster_type} = cluster,
         %RegisterOfflineClusterHost{}
       )
       when state == ClusterState.stopped() do
    health_details =
      case cluster_type do
        ClusterType.ascs_ers() ->
          %AscsErsClusterHealthDetails{
            sbd_health: Health.unknown(),
            distributed_health: Health.unknown()
          }

        cluster_type
        when cluster_type in [ClusterType.hana_scale_out(), ClusterType.hana_scale_up()] ->
          %HanaClusterHealthDetails{
            sbd_health: Health.unknown(),
            replication_health: Health.unknown()
          }

        _ ->
          nil
      end

    accumulate_cluster_health_events(cluster, health_details)
  end

  defp maybe_emit_cluster_health_details_events(
         %Cluster{cluster_id: cluster_id} = cluster,
         %RegisterOnlineClusterHost{designated_controller: true, details: details}
       )
       when not is_nil(cluster_id) do
    health_details = derive_discovered_health(details)
    accumulate_cluster_health_events(cluster, health_details)
  end

  defp maybe_emit_cluster_health_details_events(_, _), do: nil

  defp handle_cluster_health_events(multi, command) do
    multi
    |> Multi.execute(fn cluster -> maybe_emit_cluster_health_details_events(cluster, command) end)
    |> Multi.execute(&maybe_emit_cluster_health_changed_event/1)
  end

  defp maybe_emit_cluster_details_updated_event(
         %Cluster{
           name: name,
           type: type,
           sap_instances: sap_instances,
           provider: provider,
           resources_number: resources_number,
           hosts_number: hosts_number,
           state: state,
           details: details
         },
         %RegisterOnlineClusterHost{
           name: name,
           type: type,
           sap_instances: sap_instances,
           provider: provider,
           resources_number: resources_number,
           hosts_number: hosts_number,
           state: state,
           details: details
         }
       ) do
    nil
  end

  defp maybe_emit_cluster_details_updated_event(
         %Cluster{},
         %RegisterOnlineClusterHost{
           cluster_id: cluster_id,
           name: name,
           type: type,
           sap_instances: sap_instances,
           provider: provider,
           resources_number: resources_number,
           hosts_number: hosts_number,
           state: state,
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
      state: state,
      details: details
    }
  end

  defp maybe_emit_cluster_details_updated_event(
         %Cluster{
           state: ClusterState.stopped()
         },
         %RegisterOfflineClusterHost{}
       ),
       do: nil

  defp maybe_emit_cluster_details_updated_event(
         %Cluster{
           cluster_id: cluster_id,
           name: name,
           type: type,
           sap_instances: sap_instances,
           provider: provider,
           resources_number: resources_number,
           hosts_number: hosts_number,
           hosts: hosts,
           offline_hosts: offline_hosts,
           details: details
         },
         %RegisterOfflineClusterHost{}
       )
       when length(hosts) == length(offline_hosts) do
    [
      %ClusterDetailsUpdated{
        cluster_id: cluster_id,
        name: name,
        type: type,
        sap_instances: sap_instances,
        provider: provider,
        resources_number: resources_number,
        hosts_number: hosts_number,
        state: ClusterState.stopped(),
        details: details
      }
    ]
  end

  defp maybe_emit_cluster_details_updated_event(
         %Cluster{},
         %RegisterOfflineClusterHost{}
       ),
       do: nil

  defp maybe_emit_cluster_replication_health_changed_event(
         %Cluster{
           health_details: %HanaClusterHealthDetails{replication_health: replication_health}
         },
         %HanaClusterHealthDetails{replication_health: replication_health}
       ),
       do: nil

  defp maybe_emit_cluster_replication_health_changed_event(
         %Cluster{
           cluster_id: cluster_id,
           type: cluster_type
         },
         %HanaClusterHealthDetails{replication_health: replication_health}
       )
       when cluster_type in [ClusterType.hana_scale_up(), ClusterType.hana_scale_out()] do
    %ClusterReplicationHealthChanged{
      cluster_id: cluster_id,
      replication_health: replication_health
    }
  end

  defp maybe_emit_cluster_replication_health_changed_event(_, _), do: nil

  defp maybe_emit_cluster_distributed_health_changed_event(
         %Cluster{
           health_details: %AscsErsClusterHealthDetails{distributed_health: distributed_health}
         },
         %AscsErsClusterHealthDetails{distributed_health: distributed_health}
       ),
       do: nil

  defp maybe_emit_cluster_distributed_health_changed_event(
         %Cluster{
           cluster_id: cluster_id,
           type: ClusterType.ascs_ers()
         },
         %AscsErsClusterHealthDetails{distributed_health: distributed_health}
       ) do
    %ClusterDistributedHealthChanged{
      cluster_id: cluster_id,
      distributed_health: distributed_health
    }
  end

  defp maybe_emit_cluster_distributed_health_changed_event(_, _), do: nil

  defp maybe_emit_cluster_checks_health_changed_event(
         %Cluster{health_details: %{checks_health: checks_health}},
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

  defp maybe_emit_cluster_health_changed_event(%Cluster{
         cluster_id: cluster_id,
         health_details: %{} = health_details,
         health: health
       }) do
    new_health = aggregate_health_details(health_details)

    if new_health != health do
      %ClusterHealthChanged{cluster_id: cluster_id, health: new_health}
    end
  end

  defp maybe_emit_cluster_health_changed_event(_), do: nil

  defp remove_optional_unknown_healths(health_details) do
    Map.reject(health_details, fn {key, value} ->
      key in [:checks_health, :sbd_health] and value == Health.unknown()
    end)
  end
end
