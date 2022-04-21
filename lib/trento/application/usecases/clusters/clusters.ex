defmodule Trento.Clusters do
  @moduledoc """
  Provides a set of functions to interact with clusters.
  """

  import Ecto.Query

  alias Trento.{
    ClusterReadModel,
    HostConnectionSettings,
    HostReadModel
  }

  alias Trento.Domain.CheckResult

  alias Trento.Domain.Commands.{
    CompleteChecksExecution,
    RequestChecksExecution,
    SelectChecks
  }

  alias Trento.Repo

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

  @spec get_hosts_connection_settings(String.t()) :: [
          %{
            host_id: String.t(),
            hostname: String.t(),
            user: String.t()
          }
        ]
  def get_hosts_connection_settings(cluster_id) do
    query =
      from h in HostReadModel,
        left_join: s in HostConnectionSettings,
        on: h.id == s.id,
        select: %{host_id: h.id, hostname: h.hostname, user: s.user},
        where: h.cluster_id == ^cluster_id,
        order_by: [asc: h.hostname]

    Repo.all(query)
  end

  @spec save_hosts_connection_settings([
          %{
            host_id: String.t(),
            user: String.t()
          }
        ]) :: :ok
  def save_hosts_connection_settings(settings) do
    settings =
      Enum.map(settings, fn %{host_id: host_id, user: user} ->
        %{
          id: host_id,
          user: user
        }
      end)

    Repo.insert_all(HostConnectionSettings, settings,
      on_conflict: :replace_all,
      conflict_target: [:id]
    )

    :ok
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
