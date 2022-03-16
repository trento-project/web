defmodule Tronto.Monitoring do
  @moduledoc """
  This module encapuslates the access to the monitoring bounded context
  """

  import Ecto.Query

  alias Tronto.Monitoring.{
    ClusterReadModel,
    DatabaseReadModel,
    HostReadModel,
    SapSystemReadModel,
    SlesSubscriptionReadModel
  }

  alias Tronto.Monitoring.Domain.CheckResult

  alias Tronto.Monitoring.Domain.Commands.{
    RequestChecksExecution,
    SelectChecks,
    StoreChecksResults
  }

  alias Tronto.Repo

  def store_checks_results(cluster_id, host_id, checks_results) do
    with {:ok, checks_results} <- build_check_results(checks_results),
         {:ok, command} <-
           StoreChecksResults.new(
             cluster_id: cluster_id,
             host_id: host_id,
             checks_results: build_check_results(checks_results)
           ) do
      Tronto.Commanded.dispatch(command)
    end
  end

  @spec select_checks(String.t(), [String.t()]) :: :ok | {:error, any}
  def select_checks(cluster_id, checks) do
    with {:ok, command} <- SelectChecks.new(cluster_id: cluster_id, checks: checks) do
      Tronto.Commanded.dispatch(command)
    end
  end

  @spec request_checks_execution(String.t()) :: :ok | {:error, any}
  def request_checks_execution(cluster_id) do
    with {:ok, command} <- RequestChecksExecution.new(cluster_id: cluster_id) do
      Tronto.Commanded.dispatch(command)
    end
  end

  @spec get_all_hosts :: [HostReadModel.t()]
  def get_all_hosts do
    HostReadModel
    |> where([h], not is_nil(h.hostname))
    |> order_by(asc: :hostname)
    |> Repo.all()
    |> Repo.preload([:tags, cluster: :checks_results])
  end

  @spec get_all_tags :: [TagReadModel.t()]
  def get_all_tags do
    TagReadModel
    |> Repo.all()
  end

  @spec get_all_clusters :: [ClusterReadModel.t()]
  def get_all_clusters do
    ClusterReadModel
    |> order_by(asc: :name)
    |> Repo.all()
    |> Repo.preload([:tags, checks_results: :host])
  end

  @spec get_all_sles_subscriptions :: non_neg_integer()
  def get_all_sles_subscriptions do
    query =
      from s in SlesSubscriptionReadModel,
        where: s.identifier == "SLES_SAP",
        select: count()

    case Repo.one(query) do
      nil ->
        0

      subscription_count ->
        subscription_count
    end
  end

  @spec get_all_sap_systems :: [SapSystemReadModel.t()]
  def get_all_sap_systems do
    SapSystemReadModel
    |> Repo.all()
    |> Repo.preload(application_instances: [host: :cluster])
    |> Repo.preload(database_instances: [host: :cluster])
    |> Repo.preload(:tags)
  end

  @spec get_all_databases :: [map]
  def get_all_databases do
    DatabaseReadModel
    |> Repo.all()
    |> Repo.preload(database_instances: [host: :cluster])
  end

  @spec build_check_results([String.t()]) :: {:ok, [CheckResult.t()]} | {:error, any}
  defp build_check_results(checks_results) do
    Enum.map(checks_results, fn c ->
      case CheckResult.new(c) do
        {:ok, check_result} ->
          check_result

        {:error, _} = error ->
          throw(error)
      end
    end)
  catch
    {:error, _} = error -> error
  else
    results ->
      {:ok, results}
  end
end
