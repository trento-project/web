defmodule Trento.Domain.Cluster do
  @moduledoc false

  alias Commanded.Aggregate.Multi

  alias Trento.Domain.{
    CheckResult,
    Cluster,
    HanaClusterDetails,
    HealthService
  }

  alias Trento.Domain.Commands.{
    CompleteChecksExecution,
    RegisterClusterHost,
    RequestChecksExecution,
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
    HostAddedToCluster,
    HostChecksExecutionCompleted,
    HostChecksExecutionUnreachable
  }

  defstruct [
    :cluster_id,
    :name,
    :type,
    :sid,
    :details,
    :resources_number,
    :hosts_number,
    discovered_health: :unknown,
    health: :unknown,
    hosts: [],
    selected_checks: [],
    hosts_checks_results: %{},
    checks_execution: :not_running
  ]

  @type t :: %__MODULE__{
          cluster_id: String.t(),
          name: [String.t()],
          type: :hana_scale_up | :hana_scale_out | :unknown,
          discovered_health: :passing | :warning | :critical | :unknown,
          health: :passing | :warning | :critical | :unknown,
          sid: String.t(),
          details: HanaClusterDetails.t() | nil,
          hosts: [String.t()],
          selected_checks: [String.t()],
          hosts_checks_results: %{String.t() => [CheckResult.t()]},
          checks_execution: :not_running | :requested | :running
        }

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

  # Checks selected
  def execute(
        %Cluster{
          cluster_id: cluster_id,
          hosts: hosts
        },
        %SelectChecks{
          checks: selected_checks
        }
      ) do
    [
      %ChecksSelected{
        cluster_id: cluster_id,
        checks: selected_checks
      },
      %ChecksExecutionRequested{
        cluster_id: cluster_id,
        hosts: hosts,
        checks: selected_checks
      },
      %ClusterHealthChanged{cluster_id: cluster_id, health: :unknown}
    ]
  end

  # Request checks execution
  def execute(
        %Cluster{
          cluster_id: cluster_id,
          hosts: hosts,
          selected_checks: selected_checks
        },
        %RequestChecksExecution{cluster_id: cluster_id}
      ) do
    [
      %ChecksExecutionRequested{
        cluster_id: cluster_id,
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
          cluster_id: cluster_id
        } = cluster,
        %CompleteChecksExecution{
          hosts_executions: hosts_executions
        }
      ) do
    hosts_executions
    |> Enum.reduce(
      Multi.new(cluster),
      &handle_hosts_execution_data(&1, &2, cluster_id)
    )
    |> Multi.execute(fn _ -> %ChecksExecutionCompleted{cluster_id: cluster_id} end)
    |> Multi.execute(&maybe_emit_cluster_health_changed_event/1)
  end

  def apply(
        %Cluster{} = cluster,
        %ClusterRegistered{
          cluster_id: cluster_id,
          name: name,
          type: type,
          sid: sid,
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
    hosts_checks_results =
      Enum.reduce(hosts, %{}, fn host, acc ->
        Map.put(
          acc,
          host,
          Enum.map(selected_checks, fn check_id ->
            %CheckResult{check_id: check_id, result: :unknown}
          end)
        )
      end)

    %Cluster{
      cluster
      | hosts_checks_results: hosts_checks_results,
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
        %ChecksExecutionCompleted{}
      ) do
    %Cluster{
      cluster
      | checks_execution: :not_running
    }
  end

  def apply(
        %Cluster{hosts_checks_results: hosts_checks_results} = cluster,
        %HostChecksExecutionCompleted{host_id: host_id, checks_results: checks_results}
      ) do
    %Cluster{
      cluster
      | hosts_checks_results: Map.put(hosts_checks_results, host_id, checks_results)
    }
  end

  def apply(
        %Cluster{hosts_checks_results: hosts_checks_results} = cluster,
        %HostChecksExecutionUnreachable{host_id: host_id}
      ) do
    {_, hosts_checks_results} =
    Map.get_and_update(hosts_checks_results, host_id, fn checks ->
      {host_id, Enum.map(checks, fn check -> %CheckResult{check_id: check.check_id, result: :unknown} end)}
    end)

    %Cluster{
      cluster
      | hosts_checks_results: hosts_checks_results
    }
  end

  def apply(%Cluster{} = cluster, %ClusterHealthChanged{health: health}) do
    %Cluster{cluster | health: health}
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
           resources_number: resources_number,
           hosts_number: hosts_number,
           details: details
         },
         %RegisterClusterHost{
           name: name,
           type: type,
           sid: sid,
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

  defp maybe_emit_cluster_health_changed_event(%Cluster{
         cluster_id: cluster_id,
         hosts_checks_results: hosts_checks_results,
         discovered_health: discovered_health,
         health: health
       }) do
    new_health =
      hosts_checks_results
      |> Enum.flat_map(fn {_, results} -> results end)
      |> Enum.map(fn %{result: result} -> result end)
      |> Enum.reject(fn result -> result == :skipped end)
      |> Kernel.++([discovered_health])
      |> HealthService.compute_aggregated_health()

    if new_health != health do
      %ClusterHealthChanged{cluster_id: cluster_id, health: new_health}
    end
  end

  defp handle_hosts_execution_data(
      %{host_id: host_id, reachable: false, msg: msg}, multi, cluster_id) do

    multi
    |> Multi.execute(fn _ ->
      %HostChecksExecutionUnreachable{
        cluster_id: cluster_id,
        host_id: host_id,
        msg: msg
      }
    end)
  end

  defp handle_hosts_execution_data(
      %{host_id: host_id, reachable: true, checks_results: results}, multi, cluster_id) do

    multi
    |> Multi.execute(fn _ ->
      %HostChecksExecutionCompleted{
        cluster_id: cluster_id,
        host_id: host_id,
        checks_results: results
      }
    end)
  end
end
