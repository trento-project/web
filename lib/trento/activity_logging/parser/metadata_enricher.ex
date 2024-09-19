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
      |> maybe_enrich(:host, Hosts, :hostname)
      |> maybe_enrich(:cluster, Clusters, :name)
      |> maybe_enrich(:database, Databases, :sid)
      |> maybe_enrich(:sap_system, SapSystems, :sid)
      |> elem(1)

  defp maybe_enrich({activity, metadata}, entity_reference, context_module, enriching_field) do
    enriched_metadata =
      with {:ok, entity_id} <- detect_enrichment(entity_reference, {activity, metadata}),
           {:ok, entity} <- context_module.by_id(entity_id),
           {:ok, enriching_value} <- Map.fetch(entity, enriching_field) do
        Map.put(metadata, enriching_field, enriching_value)
      else
        _ -> metadata
      end

    {activity, enriched_metadata}
  end

  defp detect_enrichment(
         _target_entity,
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

  defp detect_enrichment(_target_entity, {_activity, _metadata}),
    do: {:error, :no_enrichment_needed}
end
