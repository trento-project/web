defmodule Tronto.Monitoring do
  @moduledoc """
  This module encapuslates the access to the monitoring bounded context
  """

  import Ecto.Query

  alias Tronto.Monitoring.{
    ClusterReadModel,
    HostReadModel,
    SlesSubscriptionReadModel
  }

  alias Tronto.Monitoring.Domain.CheckResult

  alias Tronto.Monitoring.Domain.Commands.{
    RequestChecksExecution,
    SelectChecks,
    StoreChecksResults
  }

  alias Tronto.Monitoring.Integration.Discovery

  alias Tronto.Repo

  def handle_discovery_event(event) do
    case Discovery.handle_discovery_event(event) do
      {:ok, command} ->
        Tronto.Commanded.dispatch(command)

      {:error, _} = error ->
        error
    end
  end

  def store_checks_results(cluster_id, host_id, checks_results) do
    %{
      cluster_id: cluster_id,
      host_id: host_id,
      checks_results: Enum.map(checks_results, &CheckResult.new!/1)
    }
    |> StoreChecksResults.new!()
    |> Tronto.Commanded.dispatch()
  end

  def select_checks(cluster_id, checks) do
    %{
      cluster_id: cluster_id,
      checks: checks
    }
    |> SelectChecks.new!()
    |> Tronto.Commanded.dispatch()
  end

  def request_checks_execution(cluster_id) do
    %{
      cluster_id: cluster_id
    }
    |> RequestChecksExecution.new!()
    |> Tronto.Commanded.dispatch()
  end

  @spec get_all_hosts :: [HostReadModel.t()]
  def get_all_hosts do
    HostReadModel
    |> where([h], not is_nil(h.hostname))
    |> Repo.all()
    |> Repo.preload(cluster: :checks_results)
  end

  @spec get_all_clusters :: [ClusterReadModel.t()]
  def get_all_clusters do
    ClusterReadModel
    |> Repo.all()
    |> Repo.preload(checks_results: :host)
  end

  @spec get_all_sles_subscriptions :: [SlesSubscriptionReadModel.t()]
  def get_all_sles_subscriptions,
    do: SlesSubscriptionReadModel |> Repo.all() |> Repo.preload(:host)
end
