defmodule Trento.ActivityLog.Logger.Parser.MetadataEnricher do
  @moduledoc """
  Metadata enricher enriches metadata extracted by activity parser.
  """
  alias Trento.ActivityLog.ActivityCatalog

  alias Trento.Clusters.Projections.ClusterReadModel
  alias Trento.Databases.Projections.DatabaseReadModel
  alias Trento.Hosts.Projections.HostReadModel
  alias Trento.SapSystems.Projections.SapSystemReadModel

  alias Trento.{Clusters, Databases, Hosts, SapSystems}

  def enrich(
        %{
          resource_id: resource_id,
          resource_type: resource_type
        } = metadata,
        activity
      )
      when activity in [:resource_tagging, :resource_untagging] do
    component_name =
      case resource_type do
        :host -> get_hostname(resource_id)
        :cluster -> get_cluster_name(resource_id)
        :database -> get_database_sid(resource_id)
        :sap_system -> get_sap_system_sid(resource_id)
        _ -> nil
      end

    {:ok,
     case component_name do
       {:ok, name} ->
         Map.put(metadata, :resource_name, name)

       nil ->
         metadata
     end}
  end

  def enrich(metadata, activity) do
    case ActivityCatalog.detect_activity_category(activity) do
      supported_activities
      when supported_activities in [:connection_activity, :domain_event_activity] ->
        {:ok, enrich_medatata(activity, metadata)}

      _ ->
        {:ok, metadata}
    end
  end

  defp enrich_medatata(activity, metadata),
    do:
      {activity, metadata}
      |> enrich_with_hostname()
      |> enrich_with_cluster_name()
      |> enrich_with_database_sid()
      |> enrich_with_sap_system_sid()
      |> elem(1)

  # |> Map.delete(:version)

  defp enrich_with_hostname({activity, metadata}) do
    enriched_metadata =
      with true <- needs_hostname?({activity, metadata}),
           %{host_id: host_id} <- metadata,
           {:ok, hostname} <- get_hostname(host_id) do
        Map.put(metadata, :hostname, hostname)
      else
        _ -> metadata
      end

    {activity, enriched_metadata}
  end

  defp enrich_with_cluster_name({activity, metadata}) do
    enriched_metadata =
      with true <- needs_cluster_name?({activity, metadata}),
           %{cluster_id: cluster_id} <- metadata,
           {:ok, cluster_name} <- get_cluster_name(cluster_id) do
        Map.put(metadata, :name, cluster_name)
      else
        _ -> metadata
      end

    {activity, enriched_metadata}
  end

  defp enrich_with_database_sid({activity, metadata}) do
    enriched_metadata =
      with true <- needs_database_sid?({activity, metadata}),
           %{database_id: database_id} <- metadata,
           {:ok, sid} <- get_database_sid(database_id) do
        Map.put(metadata, :sid, sid)
      else
        _ -> metadata
      end

    {activity, enriched_metadata}
  end

  defp enrich_with_sap_system_sid({activity, metadata}) do
    enriched_metadata =
      with true <- needs_sap_system_sid?({activity, metadata}),
           %{sap_system_id: sap_system_id} <- metadata,
           {:ok, sid} <- get_sap_system_sid(sap_system_id) do
        Map.put(metadata, :sid, sid)
      else
        _ -> metadata
      end

    {activity, enriched_metadata}
  end

  defp needs_hostname?({:host_checks_execution_request, _}), do: true

  defp needs_hostname?({_, metadata}),
    do: Map.has_key?(metadata, :host_id) && !Map.has_key?(metadata, :hostname)

  defp needs_cluster_name?({:cluster_checks_execution_request, _}), do: true

  defp needs_cluster_name?({_, metadata}),
    do: Map.has_key?(metadata, :cluster_id) && !Map.has_key?(metadata, :name)

  defp needs_database_sid?({_, metadata}),
    do: Map.has_key?(metadata, :database_id) && !Map.has_key?(metadata, :sid)

  defp needs_sap_system_sid?({_, metadata}),
    do: Map.has_key?(metadata, :sap_system_id) && !Map.has_key?(metadata, :sid)

  defp get_hostname(id) do
    case Hosts.by_host_id(id) do
      {:ok, %HostReadModel{hostname: hostname}} -> {:ok, hostname}
      {:error, :not_found} -> nil
    end
  end

  defp get_cluster_name(id) do
    case Clusters.by_cluster_id(id) do
      {:ok, %ClusterReadModel{name: cluster_name}} -> {:ok, cluster_name}
      {:error, :not_found} -> nil
    end
  end

  defp get_database_sid(id) do
    case Databases.by_database_id(id) do
      {:ok, %DatabaseReadModel{sid: sid}} -> {:ok, sid}
      {:error, :not_found} -> nil
    end
  end

  defp get_sap_system_sid(id) do
    case SapSystems.by_sap_system_id(id) do
      {:ok, %SapSystemReadModel{sid: sid}} -> {:ok, sid}
      {:error, :not_found} -> nil
    end
  end

  defp get_application_instance_number(id) do
  end

  defp get_database_instance_number(id) do
  end
end
