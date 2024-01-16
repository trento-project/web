defmodule Trento.Clusters do
  @moduledoc """
  Provides a set of functions to interact with clusters.
  """

  import Ecto.Query

  require Logger
  require Trento.Clusters.Enums.ClusterType, as: ClusterType
  require Trento.Clusters.Enums.FilesystemType, as: FilesystemType
  require Trento.Clusters.Enums.EnsaVersion, as: EnsaVersion

  alias Trento.Hosts.Projections.HostReadModel

  alias Trento.Clusters.Projections.ClusterReadModel

  alias Trento.Clusters.ClusterEnrichmentData

  alias Trento.Clusters.Commands.SelectChecks

  alias Trento.SapSystems.Projections.SapSystemReadModel

  alias Trento.Infrastructure.Checks

  alias Trento.Repo

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

      enriched_data ->
        %ClusterReadModel{cluster | cib_last_written: enriched_data.cib_last_written}
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

  @spec update_cib_last_written(String.t(), String.t()) :: {:ok, Ecto.Schema.t()} | {:error, any}
  def update_cib_last_written(cluster_id, cib_last_written) do
    case Repo.get(ClusterEnrichmentData, cluster_id) do
      nil -> %ClusterEnrichmentData{cluster_id: cluster_id}
      enriched_cluster -> enriched_cluster
    end
    |> ClusterEnrichmentData.changeset(%{cib_last_written: cib_last_written})
    |> Repo.insert_or_update()
  end

  defp commanded,
    do: Application.fetch_env!(:trento, Trento.Commanded)[:adapter]

  @spec enrich_cluster_model_query(Ecto.Query.t()) :: Ecto.Query.t()
  defp enrich_cluster_model_query(query) do
    query
    |> join(:left, [c], e in ClusterEnrichmentData, on: c.id == e.cluster_id)
    |> select_merge([c, e], %{cib_last_written: e.cib_last_written})
  end

  @spec get_sids(map()) :: [String.t()]
  defp get_sids(details) do
    Enum.map(details["sap_systems"], fn s -> s["sid"] end)
  end

  @spec get_ensa_version([String.t()]) :: EnsaVersion.t()
  defp get_ensa_version(sap_system_sids) do
    query =
      from(s in SapSystemReadModel,
        select: s.ensa_version,
        where: s.sid in ^sap_system_sids
      )

    ensa_versions =
      query
      |> Repo.all()
      |> Enum.uniq()

    case ensa_versions do
      [ensa_version] -> ensa_version
      _ -> EnsaVersion.mixed_versions()
    end
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

  defp maybe_request_checks_execution(%{selected_checks: []}), do: :ok

  defp maybe_request_checks_execution(%{
         id: cluster_id,
         provider: provider,
         type: cluster_type,
         details: details,
         selected_checks: selected_checks
       }) do
    hosts_data =
      Repo.all(
        from h in HostReadModel,
          select: %{host_id: h.id},
          where: h.cluster_id == ^cluster_id and is_nil(h.deregistered_at)
      )

    env =
      case cluster_type do
        :ascs_ers ->
          %Checks.ClusterExecutionEnv{
            provider: provider,
            cluster_type: cluster_type,
            ensa_version: details |> get_sids |> get_ensa_version,
            filesystem_type: get_filesystem_type(cluster_id)
          }

        _ ->
          %Checks.ClusterExecutionEnv{
            provider: provider,
            cluster_type: cluster_type
          }
      end

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
end
