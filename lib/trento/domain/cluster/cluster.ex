defmodule Trento.Domain.Cluster do
  @moduledoc false

  require Trento.Domain.Enums.Provider, as: Provider
  require Trento.Domain.Enums.ClusterType, as: ClusterType
  require Trento.Domain.Enums.Health, as: Health

  alias Commanded.Aggregate.Multi

  alias Trento.Domain.{
    CheckResult,
    Cluster,
    HanaClusterDetails,
    HealthService,
    HostExecution
  }

  alias Trento.Domain.Commands.{
    AbortClusterRollup,
    CompleteChecksExecution,
    RegisterClusterHost,
    RequestChecksExecution,
    RollupCluster,
    SelectChecks,
    StartChecksExecution
  }

  alias Trento.Domain.Events.{
    ChecksExecutionCompleted,
    ChecksExecutionRequested,
    ChecksExecutionStarted,
    ChecksSelected,
    ClusterDetailsUpdated,
    ClusterDiscoveredHealthChanged,
    ClusterHealthChanged,
    ClusterRegistered,
    ClusterRolledUp,
    ClusterRollupFailed,
    HostAddedToCluster,
    HostChecksExecutionCompleted
  }

  @required_fields []

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

    field :checks_execution, Ecto.Enum,
      values: [:not_running, :requested, :running],
      default: :not_running

    field :rolling_up, :boolean, default: false

    embeds_one :details, HanaClusterDetails
    embeds_many :hosts_executions, HostExecution
  end

  def execute(%Cluster{rolling_up: false}, %AbortClusterRollup{}),
    do: []

  def execute(%Cluster{rolling_up: true}, %AbortClusterRollup{cluster_id: cluster_id}) do
    %ClusterRollupFailed{
      cluster_id: cluster_id
    }
  end

  def execute(%Cluster{rolling_up: true}, _), do: {:error, :cluster_rolling_up}

  # When a DC cluster node is registered for the first time, a cluster is registered
  # and the host of the node is added to the cluster
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

  # If no DC node was received yet, no cluster was registered.
  def execute(%Cluster{cluster_id: nil}, %RegisterClusterHost{designated_controller: false}),
    do: {:error, :cluster_not_found}

  def execute(
        %Cluster{} = cluster,
        %RegisterClusterHost{
          host_id: host_id,
          designated_controller: false
        }
      ) do
    maybe_emit_host_added_to_cluster_event(cluster, host_id)
  end

  def execute(
        %Cluster{} = cluster,
        %RegisterClusterHost{
          designated_controller: true
        } = command
      ) do
    cluster
    |> Multi.new()
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

  # Request checks execution
  def execute(
        %Cluster{
          cluster_id: cluster_id,
          selected_checks: []
        },
        %RequestChecksExecution{cluster_id: cluster_id}
      ),
      do: nil

  def execute(
        %Cluster{
          cluster_id: cluster_id,
          provider: provider,
          hosts: hosts,
          selected_checks: selected_checks
        },
        %RequestChecksExecution{cluster_id: cluster_id}
      ) do
    [
      %ChecksExecutionRequested{
        cluster_id: cluster_id,
        provider: provider,
        hosts: hosts,
        checks: selected_checks
      },
      %ClusterHealthChanged{cluster_id: cluster_id, health: :unknown}
    ]
  end

  # Start the checks execution
  def execute(
        %Cluster{
          cluster_id: cluster_id
        },
        %StartChecksExecution{cluster_id: cluster_id}
      ) do
    %ChecksExecutionStarted{
      cluster_id: cluster_id
    }
  end

  # Store checks results
  def execute(
        %Cluster{
          cluster_id: cluster_id,
          hosts_executions: old_hosts_executions
        } = cluster,
        %CompleteChecksExecution{
          hosts_executions: hosts_executions
        }
      ) do
    hosts_executions
    |> Enum.reduce(
      Multi.new(cluster),
      &emit_host_execution_completed_event(&1, &2, cluster_id, old_hosts_executions)
    )
    |> Multi.execute(fn _ ->
      %ChecksExecutionCompleted{
        cluster_id: cluster_id,
        health:
          hosts_executions
          |> Enum.flat_map(fn %{checks_results: checks_results} -> checks_results end)
          |> Enum.map(fn %{result: result} -> result end)
          |> Enum.reject(fn result -> result == :skipped end)
          |> HealthService.compute_aggregated_health()
      }
    end)
    |> Multi.execute(&maybe_emit_cluster_health_changed_event/1)
  end

  def execute(
        %Cluster{
          cluster_id: cluster_id,
          name: name,
          type: type,
          sid: sid,
          provider: provider,
          resources_number: resources_number,
          hosts_number: hosts_number,
          details: details,
          health: health,
          hosts: hosts,
          selected_checks: selected_checks,
          discovered_health: discovered_health,
          checks_health: checks_health,
          hosts_executions: hosts_executions
        },
        %RollupCluster{}
      ) do
    %ClusterRolledUp{
      cluster_id: cluster_id,
      name: name,
      type: type,
      sid: sid,
      provider: provider,
      resources_number: resources_number,
      hosts_number: hosts_number,
      details: details,
      health: health,
      hosts: hosts,
      selected_checks: selected_checks,
      discovered_health: discovered_health,
      checks_health: checks_health,
      hosts_executions: hosts_executions,
      applied: false
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

  def apply(
        %Cluster{selected_checks: selected_checks, hosts: hosts} = cluster,
        %ChecksExecutionRequested{}
      ) do
    hosts_executions =
      Enum.map(hosts, fn host_id ->
        %HostExecution{
          host_id: host_id,
          reachable: true,
          checks_results:
            Enum.map(selected_checks, fn check_id ->
              %CheckResult{check_id: check_id, result: :unknown}
            end)
        }
      end)

    %Cluster{
      cluster
      | hosts_executions: hosts_executions,
        checks_execution: :requested
    }
  end

  def apply(
        %Cluster{} = cluster,
        %ChecksExecutionStarted{}
      ) do
    %Cluster{
      cluster
      | checks_execution: :running
    }
  end

  def apply(
        %Cluster{} = cluster,
        %ChecksExecutionCompleted{
          health: health
        }
      ) do
    %Cluster{
      cluster
      | checks_execution: :not_running,
        checks_health: health
    }
  end

  def apply(
        %Cluster{hosts_executions: hosts_executions} = cluster,
        %HostChecksExecutionCompleted{
          host_id: host_id,
          reachable: true,
          msg: msg,
          checks_results: checks_results
        }
      ) do
    hosts_executions =
      Enum.map(hosts_executions, fn
        %HostExecution{host_id: ^host_id} ->
          %HostExecution{
            host_id: host_id,
            reachable: true,
            msg: msg,
            checks_results: checks_results
          }

        host ->
          host
      end)

    %Cluster{
      cluster
      | hosts_executions: hosts_executions
    }
  end

  def apply(
        %Cluster{hosts_executions: hosts_executions} = cluster,
        %HostChecksExecutionCompleted{host_id: host_id, reachable: false, msg: msg}
      ) do
    %Cluster{
      cluster
      | hosts_executions:
          Enum.map(hosts_executions, fn
            %HostExecution{host_id: ^host_id, checks_results: checks_results} ->
              %HostExecution{
                host_id: host_id,
                reachable: false,
                msg: msg,
                checks_results: checks_results
              }

            host ->
              host
          end)
    }
  end

  def apply(%Cluster{} = cluster, %ClusterHealthChanged{health: health}) do
    %Cluster{cluster | health: health}
  end

  def apply(%Cluster{} = cluster, %ClusterRolledUp{applied: false}) do
    %Cluster{cluster | rolling_up: true}
  end

  def apply(%Cluster{}, %ClusterRolledUp{
        cluster_id: cluster_id,
        name: name,
        type: type,
        sid: sid,
        provider: provider,
        resources_number: resources_number,
        hosts_number: hosts_number,
        details: details,
        health: health,
        hosts: hosts,
        selected_checks: selected_checks,
        discovered_health: discovered_health,
        checks_health: checks_health,
        hosts_executions: hosts_executions,
        applied: true
      }) do
    %Cluster{
      cluster_id: cluster_id,
      name: name,
      type: type,
      sid: sid,
      provider: provider,
      resources_number: resources_number,
      hosts_number: hosts_number,
      details: details,
      health: health,
      hosts: hosts,
      selected_checks: selected_checks,
      discovered_health: discovered_health,
      checks_health: checks_health,
      hosts_executions: hosts_executions
    }
  end

  def apply(%Cluster{} = cluster, %ClusterRollupFailed{}) do
    %Cluster{cluster | rolling_up: false}
  end

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

  defp emit_host_execution_completed_event(
         %{host_id: host_id, reachable: false, msg: msg},
         multi,
         cluster_id,
         hosts_executions
       ) do
    Multi.execute(multi, fn _ ->
      %HostChecksExecutionCompleted{
        cluster_id: cluster_id,
        host_id: host_id,
        reachable: false,
        msg: msg,
        checks_results:
          Enum.find_value(
            hosts_executions,
            fn
              %HostExecution{
                host_id: ^host_id,
                checks_results: checks_results
              } ->
                checks_results

              _ ->
                false
            end
          )
      }
    end)
  end

  defp emit_host_execution_completed_event(
         %{host_id: host_id, reachable: true, msg: msg, checks_results: results},
         multi,
         cluster_id,
         _hosts_executions
       ) do
    Multi.execute(multi, fn _ ->
      %HostChecksExecutionCompleted{
        cluster_id: cluster_id,
        host_id: host_id,
        reachable: true,
        msg: msg,
        checks_results: results
      }
    end)
  end
end
