defmodule Tronto.Monitoring do
  @moduledoc """
  This module encapuslates the access to the monitoring bounded context
  """

  alias Tronto.Monitoring.{
    ClusterReadModel,
    HostReadModel
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

  @spec get_all_hosts :: [HostReadModel.t()]
  def get_all_hosts do
    Repo.all(HostReadModel)
  end

  @spec get_all_clusters :: [ClusterReadModel.t()]
  def get_all_clusters do
    Repo.all(ClusterReadModel)
  end
end
