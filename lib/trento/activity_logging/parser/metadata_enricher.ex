defmodule Trento.ActivityLog.Logger.Parser.MetadataEnricher do
  @moduledoc """
  Metadata enricher enriches metadata extracted by activity parser.
  """

  alias Trento.ActivityLog.ActivityCatalog

  alias Trento.{Clusters, Databases, Hosts, SapSystems}

  @spec enrich(activity :: ActivityCatalog.activity_type(), metadata :: map()) ::
          {:ok, maybe_enriched_metadata :: map()}
  def enrich(activity, metadata) do
    case ActivityCatalog.detect_activity_category(activity) do
      supported_activities
      when supported_activities in [:connection_activity, :domain_event_activity] ->
        {:ok, enrich_metadata(activity, metadata)}

      _ ->
        {:ok, metadata}
    end
  end

  defp enrich_metadata(activity, metadata),
    do:
      {activity, metadata}
      |> maybe_enrich_with_hostname()
      |> maybe_enrich_with_cluster_name()
      |> maybe_enrich_with_database_sid()
      |> maybe_enrich_with_sap_system_sid()
      |> elem(1)

  defp maybe_enrich_with_hostname({activity, metadata}) do
    enriched_metadata =
      with {:ok, host_id} <- detect_enrichment(:host, {activity, metadata}),
           {:ok, %{hostname: hostname}} <- Hosts.by_id(host_id) do
        Map.put(metadata, :hostname, hostname)
      else
        _ -> metadata
      end

    {activity, enriched_metadata}
  end

  defp maybe_enrich_with_cluster_name({activity, metadata}) do
    enriched_metadata =
      with {:ok, cluster_id} <- detect_enrichment(:cluster, {activity, metadata}),
           {:ok, %{name: cluster_name}} <- Clusters.by_id(cluster_id) do
        Map.put(metadata, :name, cluster_name)
      else
        _ -> metadata
      end

    {activity, enriched_metadata}
  end

  defp maybe_enrich_with_database_sid({activity, metadata}) do
    enriched_metadata =
      with {:ok, database_id} <- detect_enrichment(:database, {activity, metadata}),
           {:ok, %{sid: sid}} <- Databases.by_id(database_id) do
        Map.put(metadata, :sid, sid)
      else
        _ -> metadata
      end

    {activity, enriched_metadata}
  end

  defp maybe_enrich_with_sap_system_sid({activity, metadata}) do
    enriched_metadata =
      with {:ok, sap_system_id} <- detect_enrichment(:sap_system, {activity, metadata}),
           {:ok, %{sid: sid}} <- SapSystems.by_id(sap_system_id) do
        Map.put(metadata, :sid, sid)
      else
        _ -> metadata
      end

    {activity, enriched_metadata}
  end

  defp detect_enrichment(
         _target_resource,
         {activity,
          %{
            resource_id: resource_id,
            resource_type: resource_type
          }}
       )
       when activity in [:resource_tagging, :resource_untagging] and
              resource_type in [:host, :cluster, :database, :sap_system],
       do: {:ok, resource_id}

  defp detect_enrichment(:host, {:host_checks_execution_request, %{host_id: host_id}}),
    do: {:ok, host_id}

  defp detect_enrichment(
         :cluster,
         {:cluster_checks_execution_request, %{cluster_id: cluster_id}}
       ),
       do: {:ok, cluster_id}

  defp detect_enrichment(:host, {_, %{host_id: _, hostname: _}}),
    do: {:error, :no_enrichment_needed}

  defp detect_enrichment(:cluster, {_, %{cluster_id: _, name: _}}),
    do: {:error, :no_enrichment_needed}

  defp detect_enrichment(:database, {_, %{database_id: _, sid: _}}),
    do: {:error, :no_enrichment_needed}

  defp detect_enrichment(:sap_system, {_, %{sap_system_id: _, sid: _}}),
    do: {:error, :no_enrichment_needed}

  defp detect_enrichment(:host, {_, %{host_id: id}}), do: {:ok, id}
  defp detect_enrichment(:cluster, {_, %{cluster_id: id}}), do: {:ok, id}
  defp detect_enrichment(:database, {_, %{database_id: id}}), do: {:ok, id}
  defp detect_enrichment(:sap_system, {_, %{sap_system_id: id}}), do: {:ok, id}

  defp detect_enrichment(_target_resource, {_activity, _metadata}),
    do: {:error, :no_enrichment_needed}
end
