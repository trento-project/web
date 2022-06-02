defmodule Trento.Clusters do
  @moduledoc """
  Provides a set of functions to interact with clusters.
  """

  import Ecto.Query

  alias Trento.ClusterReadModel

  alias Trento.Domain.CheckResult

  alias Trento.Domain.Commands.{
    CompleteChecksExecution,
    RequestChecksExecution,
    SelectChecks
  }

  alias Trento.Repo

  require Logger

  def store_checks_results(cluster_id, host_id, checks_results) do
    with {:ok, checks_results} <- build_check_results(checks_results),
         {:ok, command} <-
           CompleteChecksExecution.new(%{
             cluster_id: cluster_id,
             host_id: host_id,
             checks_results: build_check_results(checks_results)
           }) do
      Trento.Commanded.dispatch(command)
    end
  end

  @spec select_checks(String.t(), [String.t()]) :: :ok | {:error, any}
  def select_checks(cluster_id, checks) do
    with {:ok, command} <- SelectChecks.new(%{cluster_id: cluster_id, checks: checks}) do
      Trento.Commanded.dispatch(command)
    end
  end

  @spec request_checks_execution(String.t()) :: :ok | {:error, any}
  def request_checks_execution(cluster_id) do
    with {:ok, command} <- RequestChecksExecution.new(%{cluster_id: cluster_id}) do
      Trento.Commanded.dispatch(command)
    end
  end

  @spec get_all_clusters :: [ClusterReadModel.t()]
  def get_all_clusters do
    ClusterReadModel
    |> order_by(asc: :name)
    |> Repo.all()
    |> Repo.preload([:tags, :hosts_executions, :checks_results])
  end

  @spec request_clusters_checks_execution :: :ok | {:error, any}
  def request_clusters_checks_execution do
    query =
      from(c in ClusterReadModel,
        select: c.id,
        where: c.type == :hana_scale_up or c.type == :hana_scale_out
      )

    query
    |> Repo.all()
    |> Enum.each(fn cluster_id ->
      case request_checks_execution(cluster_id) do
        :ok ->
          :ok

        {:error, reason} ->
          Logger.error("Failed to request checks execution for cluster #{cluster_id}: #{reason}")
      end
    end)
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

  @spec update_cib_last_written(String.t(), String.t()) :: {:ok, Ecto.Schema.t()} | {:error, any}
  def update_cib_last_written(cluster_id, cib_last_written) do
    case Repo.get(ClusterReadModel, cluster_id) do
      nil ->
        {:error, :cluster_not_found}

      cluster ->
        cluster
        |> ClusterReadModel.changeset(%{cib_last_written: cib_last_written})
        |> Repo.update()
    end
  end
end
