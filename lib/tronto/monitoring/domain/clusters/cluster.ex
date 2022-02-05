defmodule Tronto.Monitoring.Domain.Cluster do
  @moduledoc false

  alias Tronto.Monitoring.Domain.{
    CheckResult,
    Cluster
  }

  alias Tronto.Monitoring.Domain.Commands.{
    RegisterCluster,
    RequestChecksExecution,
    SelectChecks,
    StoreChecksResults
  }

  alias Tronto.Monitoring.Domain.Events.{
    ChecksExecutionRequested,
    ChecksResultsStored,
    ChecksSelected,
    ClusterDetailsUpdated,
    ClusterRegistered,
    HostAddedToCluster
  }

  defstruct [
    :cluster_id,
    :name,
    :type,
    :sid,
    hosts: [],
    selected_checks: [],
    hosts_checks_results: %{}
  ]

  @type t :: %__MODULE__{
          cluster_id: String.t(),
          name: [String.t()],
          type: :hana_scale_up | :hana_scale_out | :unknown,
          sid: String.t(),
          hosts: [String.t()],
          selected_checks: [String.t()],
          hosts_checks_results: %{String.t() => [CheckResult.t()]}
        }

  # New cluster registered
  def execute(
        %Cluster{cluster_id: nil},
        %RegisterCluster{
          cluster_id: cluster_id,
          host_id: host_id,
          name: name,
          type: type,
          sid: sid
        }
      ) do
    [
      %ClusterRegistered{
        cluster_id: cluster_id,
        name: name,
        type: type,
        sid: sid
      },
      %HostAddedToCluster{
        cluster_id: cluster_id,
        host_id: host_id
      }
    ]
  end

  # Cluster exists but details didn't change
  def execute(
        %Cluster{
          cluster_id: cluster_id,
          name: name,
          type: type,
          sid: sid
        } = cluster,
        %RegisterCluster{
          cluster_id: cluster_id,
          host_id: host_id,
          name: name,
          type: type,
          sid: sid
        }
      ) do
    maybe_emit_host_added_to_cluster_event(cluster, host_id)
  end

  # Cluster exists but details changed
  def execute(
        %Cluster{} = cluster,
        %RegisterCluster{
          cluster_id: cluster_id,
          host_id: host_id,
          name: name,
          type: type,
          sid: sid
        }
      ) do
    [
      %ClusterDetailsUpdated{
        cluster_id: cluster_id,
        name: name,
        type: type,
        sid: sid
      }
    ] ++ maybe_emit_host_added_to_cluster_event(cluster, host_id)
  end

  # Cluster does not exist
  def execute(%Cluster{cluster_id: nil}, _), do: {:error, :cluster_does_not_exist}

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
      }
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
    %ChecksExecutionRequested{
      cluster_id: cluster_id,
      hosts: hosts,
      checks: selected_checks
    }
  end

  # Store checks results
  def execute(
        %Cluster{
          cluster_id: cluster_id
        },
        %StoreChecksResults{
          host_id: host_id,
          checks_results: checks_results
        }
      ) do
    %ChecksResultsStored{
      cluster_id: cluster_id,
      host_id: host_id,
      checks_results: checks_results
    }
  end

  def apply(
        %Cluster{} = cluster,
        %ClusterRegistered{
          cluster_id: cluster_id,
          name: name,
          type: type,
          sid: sid
        }
      ) do
    %Cluster{
      cluster
      | cluster_id: cluster_id,
        name: name,
        type: type,
        sid: sid
    }
  end

  def apply(
        %Cluster{} = cluster,
        %ClusterDetailsUpdated{
          name: name,
          type: type,
          sid: sid
        }
      ) do
    %Cluster{
      cluster
      | name: name,
        type: type,
        sid: sid
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
            %CheckResult{check_id: check_id, result: :running}
          end)
        )
      end)

    %Cluster{
      cluster
      | hosts_checks_results: hosts_checks_results
    }
  end

  def apply(
        %Cluster{hosts_checks_results: hosts_checks_results} = cluster,
        %ChecksResultsStored{host_id: host_id, checks_results: checks_results}
      ) do
    %Cluster{
      cluster
      | hosts_checks_results: Map.put(hosts_checks_results, host_id, checks_results)
    }
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
end
