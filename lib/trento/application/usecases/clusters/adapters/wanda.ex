defmodule Trento.Clusters.Wanda do
  @moduledoc """
  Wanda integration adapter
  """

  @behaviour Trento.Clusters.Gen

  import Ecto.Query

  require Logger

  alias Trento.{
    ClusterReadModel,
    HostReadModel
  }

  alias Trento.Integration.Checks

  alias Trento.Repo

  @impl true
  def request_checks_execution(cluster_id) do
    hosts_query =
      from h in HostReadModel,
        select: %{host_id: h.id},
        where: h.cluster_id == ^cluster_id

    with %{provider: provider, selected_checks: selected_checks} <-
           Repo.get(ClusterReadModel, cluster_id),
         hosts_data <- Repo.all(hosts_query) do
      Checks.request_execution(
        UUID.uuid4(),
        cluster_id,
        provider,
        hosts_data,
        selected_checks
      )
    else
      nil ->
        Logger.error("Cluster with ID #{cluster_id} not found")
        {:error, :cluster_not_found}

      {:error, reason} ->
        Logger.error("Failed to request checks execution for cluster #{cluster_id}: #{reason}",
          error: reason
        )

        {:error, reason}
    end
  end
end
