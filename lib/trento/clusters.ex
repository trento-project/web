defmodule Trento.Clusters do
  @moduledoc """
  Provides a set of functions to interact with clusters.
  """

  import Ecto.Query

  require Logger
  require Trento.Clusters.Enums.ClusterType, as: ClusterType
  require Trento.Clusters.Enums.FilesystemType, as: FilesystemType
  require Trento.Clusters.Enums.ClusterEnsaVersion, as: ClusterEnsaVersion
  require Trento.Clusters.Enums.HanaArchitectureType, as: HanaArchitectureType

  alias Trento.Hosts.Projections.HostReadModel

  alias Trento.SapSystems.Projections.ApplicationInstanceReadModel

  alias Trento.Clusters.Projections.ClusterReadModel

  alias Trento.Clusters.ClusterEnrichmentData

  alias Trento.Clusters.Commands.SelectChecks

  alias Trento.SapSystems.Projections.SapSystemReadModel

  alias Trento.Infrastructure.Checks

  alias Trento.Repo

  @spec by_id(String.t()) :: {:ok, ClusterReadModel.t()} | {:error, :not_found}
  def by_id(id) do
    case Repo.get(ClusterReadModel, id) do
      %ClusterReadModel{} = cluster -> {:ok, cluster}
      nil -> {:error, :not_found}
    end
  end

  @spec select_checks(String.t(), [String.t()]) :: :ok | {:error, any}
  def select_checks(cluster_id, checks) do
    Logger.debug("Selecting checks, cluster: #{cluster_id}")

    with {:ok, command} <- SelectChecks.new(%{cluster_id: cluster_id, checks: checks}) do
      commanded().dispatch(command)
    end
  end

  @spec request_checks_execution(String.t()) ::
          :ok | {:error, any}
  def request_checks_execution(cluster_id) do
    query =
      from(c in ClusterReadModel,
        where: is_nil(c.deregistered_at) and c.id == ^cluster_id
      )

    case Repo.one(query) do
      %ClusterReadModel{} = cluster ->
        Logger.debug("Requesting checks execution, cluster: #{cluster_id}")

        maybe_request_checks_execution(cluster)

      nil ->
        Logger.error("Requested checks execution for a non-existing cluster: #{cluster_id}")

        {:error, :not_found}
    end
  end

  @spec get_all_clusters :: [ClusterReadModel.t()]
  def get_all_clusters do
    from(c in ClusterReadModel,
      order_by: [asc: c.name, asc: c.id],
      preload: [:tags],
      where: is_nil(c.deregistered_at)
    )
    |> enrich_cluster_model_query()
    |> Repo.all()
    |> Enum.map(&enrich_cluster_details/1)
  end

  @spec get_cluster_id_by_host_id(String.t()) :: String.t() | nil
  def get_cluster_id_by_host_id(host_id) do
    query =
      from c in ClusterReadModel,
        join: h in HostReadModel,
        on: h.cluster_id == c.id,
        where: h.id == ^host_id,
        select: c.id

    Repo.one(query)
  end

  @spec enrich_cluster_model(ClusterReadModel.t()) :: ClusterReadModel.t()
  def enrich_cluster_model(%ClusterReadModel{id: id} = cluster) do
    case Repo.get(ClusterEnrichmentData, id) do
      nil ->
        cluster

      %{cib_last_written: cib_last_written, details: enriching_details} ->
        enrich_cluster_details(%ClusterReadModel{
          cluster
          | cib_last_written: cib_last_written,
            enriching_details: enriching_details
        })
    end
  end

  @spec request_clusters_checks_execution :: :ok | {:error, any}
  def request_clusters_checks_execution do
    query =
      from(c in ClusterReadModel,
        select: c.id,
        where:
          (c.type == ^ClusterType.hana_scale_up() or
             c.type == ^ClusterType.hana_scale_out()) and is_nil(c.deregistered_at)
      )

    query
    |> Repo.all()
    |> Enum.each(fn cluster_id ->
      case request_checks_execution(cluster_id) do
        :ok ->
          :ok

        {:error, reason} ->
          Logger.error(
            "Failed to request checks execution, cluster: #{cluster_id}, reason: #{reason}"
          )
      end
    end)
  end

  @spec update_enrichment_data(String.t(), map()) :: {:ok, Ecto.Schema.t()} | {:error, any}
  def update_enrichment_data(cluster_id, enriching_changeset) do
    case Repo.get(ClusterEnrichmentData, cluster_id) do
      nil -> %ClusterEnrichmentData{cluster_id: cluster_id}
      enriched_cluster -> enriched_cluster
    end
    |> ClusterEnrichmentData.changeset(enriching_changeset)
    |> Repo.insert_or_update()
  end

  defp commanded,
    do: Application.fetch_env!(:trento, Trento.Commanded)[:adapter]

  @spec enrich_cluster_model_query(Ecto.Query.t()) :: Ecto.Query.t()
  defp enrich_cluster_model_query(query) do
    query
    |> join(:left, [c], e in ClusterEnrichmentData, on: c.id == e.cluster_id)
    |> select_merge([c, e], %{cib_last_written: e.cib_last_written, enriching_details: e.details})
  end

  defp enrich_cluster_details(
         %ClusterReadModel{
           type: ClusterType.hana_scale_up(),
           details: %{"nodes" => initial_nodes} = initial_details,
           enriching_details: %{"nodes" => enriching_nodes} = enriching_details
         } = cluster
       )
       when is_map(initial_details) and is_map(enriching_details) do
    %ClusterReadModel{
      cluster
      | details: %{
          initial_details
          | "nodes" => enrich_hana_scale_up_nodes(initial_nodes, enriching_nodes)
        }
    }
  end

  defp enrich_cluster_details(cluster), do: cluster

  defp enrich_hana_scale_up_nodes(initial_nodes, enriching_nodes) do
    Enum.map(initial_nodes, fn %{
                                 "name" => node_name,
                                 "attributes" => initial_attributes
                               } = node ->
      enriching_attributes =
        enriching_nodes
        |> Enum.find(%{}, &(Map.get(&1, "name") == node_name))
        |> Map.get("attributes", %{})

      %{
        node
        | "attributes" =>
            Map.merge(
              initial_attributes,
              enriching_attributes
            )
      }
    end)
  end

  defp get_filesystem_type(cluster_id) do
    query =
      from(c in ClusterReadModel,
        where:
          c.id == ^cluster_id and c.type == ^ClusterType.ascs_ers() and is_nil(c.deregistered_at)
      )

    filesystems_list =
      query
      |> Repo.one!()
      |> Map.get(:details, %{})
      |> Map.get("sap_systems", [])
      |> Enum.map(fn %{"filesystem_resource_based" => filesystem_resource_based} ->
        filesystem_resource_based
      end)
      |> Enum.uniq()

    case filesystems_list do
      [true] -> FilesystemType.resource_managed()
      [false] -> FilesystemType.simple_mount()
      _ -> FilesystemType.mixed_fs_types()
    end
  end

  defp maybe_request_checks_execution(%ClusterReadModel{selected_checks: []}),
    do: {:error, :no_checks_selected}

  defp maybe_request_checks_execution(%ClusterReadModel{
         id: cluster_id,
         provider: provider,
         type: ClusterType.ascs_ers(),
         additional_sids: cluster_sids,
         selected_checks: selected_checks
       }) do
    hosts_data =
      Repo.all(
        from h in HostReadModel,
          join: a in ApplicationInstanceReadModel,
          on: h.id == a.host_id,
          where:
            h.cluster_id == ^cluster_id and is_nil(h.deregistered_at) and
              a.sid in ^cluster_sids,
          select: %{host_id: h.id, sap_system_id: a.sap_system_id}
      )

    aggregated_ensa_version =
      hosts_data
      |> Enum.map(fn %{sap_system_id: sap_system_id} -> sap_system_id end)
      |> Enum.uniq()
      |> get_cluster_ensa_version()

    env = %Checks.ClusterExecutionEnv{
      provider: provider,
      cluster_type: ClusterType.ascs_ers(),
      ensa_version: aggregated_ensa_version,
      filesystem_type: get_filesystem_type(cluster_id)
    }

    Checks.request_execution(
      UUID.uuid4(),
      cluster_id,
      env,
      hosts_data,
      selected_checks,
      :cluster
    )
  end

  defp maybe_request_checks_execution(%ClusterReadModel{
         id: cluster_id,
         provider: provider,
         type: cluster_type,
         selected_checks: selected_checks,
         details: details
       }) do
    hosts_data =
      Repo.all(
        from h in HostReadModel,
          select: %{host_id: h.id},
          where: h.cluster_id == ^cluster_id and is_nil(h.deregistered_at)
      )

    env = %Checks.ClusterExecutionEnv{
      provider: provider,
      cluster_type: cluster_type,
      architecture_type: parse_architecture_type(details)
    }

    Checks.request_execution(
      UUID.uuid4(),
      cluster_id,
      env,
      hosts_data,
      selected_checks,
      :cluster
    )
  end

  defp maybe_request_checks_execution(error), do: error

  @spec get_cluster_ensa_version([String.t()]) :: ClusterEnsaVersion.t()
  defp get_cluster_ensa_version(sap_system_ids) do
    ensa_versions =
      Repo.all(
        from(s in SapSystemReadModel,
          select: s.ensa_version,
          where: s.id in ^sap_system_ids and is_nil(s.deregistered_at),
          distinct: true
        )
      )

    case ensa_versions do
      [ensa_version] -> ensa_version
      _ -> ClusterEnsaVersion.mixed_versions()
    end
  end

  defp parse_architecture_type(%{"architecture_type" => "angi"}),
    do: HanaArchitectureType.angi()

  defp parse_architecture_type(_), do: HanaArchitectureType.classic()
end
