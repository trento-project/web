defmodule Trento.ActivityLog.Parser.ActivityParser do
  @moduledoc """
  Activity parser extracts the activity relevant information from the context.
  """

  alias Trento.ActivityLog.ActivityCatalog
  alias Trento.ActivityLog.SeverityLevel
  alias Trento.ActivityLog.Logger.Parser.{EventParser, MetadataEnricher, PhoenixConnParser}

  @type activity_log :: %{
          type: String.t(),
          actor: String.t(),
          metadata: map()
        }

  @spec to_activity_log(ActivityCatalog.activity_type(), map()) ::
          {:ok, activity_log()} | {:error, :cannot_parse_activity}
  def to_activity_log(activity, activity_context) do
    with true <- activity in ActivityCatalog.supported_activities(),
         {:ok, actor} <- get_activity_info(:actor, activity, activity_context),
         {:ok, metadata} <- get_activity_info(:metadata, activity, activity_context),
         {:ok, enriched_metadata} <- MetadataEnricher.enrich(activity, metadata) do
      activity_type = Atom.to_string(activity)

      severity = map_severity_level(activity_type, enriched_metadata)

      {:ok,
       %{
         type: activity_type,
         actor: actor,
         severity: severity,
         metadata: enriched_metadata
       }}
    else
      _ -> {:error, :cannot_parse_activity}
    end
  end

  defp get_activity_info(info, activity, activity_context) do
    case ActivityCatalog.detect_activity_category(activity) do
      :connection_activity ->
        {:ok, parse_connection_activity_info(info, activity, activity_context)}

      :domain_event_activity ->
        {:ok, parse_domain_event_activity_info(info, activity, activity_context)}

      :unsupported_activity ->
        {:error, :unsupported_activity}
    end
  end

  defp parse_connection_activity_info(:actor, activity, activity_context),
    do: PhoenixConnParser.get_activity_actor(activity, activity_context)

  defp parse_connection_activity_info(:metadata, activity, activity_context),
    do: PhoenixConnParser.get_activity_metadata(activity, activity_context)

  defp parse_domain_event_activity_info(:actor, activity, activity_context),
    do: EventParser.get_activity_actor(activity, activity_context)

  defp parse_domain_event_activity_info(:metadata, activity, activity_context),
    do: EventParser.get_activity_metadata(activity, activity_context)

  defp map_severity_level(activity_type, metadata) do
    case SeverityLevel.severity_level_mapping()[activity_type] do
      nil ->
        # unmapped acitivity type found
        SeverityLevel.severity_level_to_integer(:warning)

      level when is_atom(level) ->
        SeverityLevel.severity_level_to_integer(level)

      condition when is_map(condition) ->
        condition
        |> map_metadata_to_severity_level(metadata)
        |> SeverityLevel.severity_level_to_integer()
    end
  end

  defp map_metadata_to_severity_level(mapping, metadata) do
    keys = Map.keys(metadata)
    condition = mapping.condition

    case condition do
      :map_value_to_severity ->
        health_key_suffix = mapping.key_suffix

        health_key =
          keys
          |> Enum.map(&Atom.to_string/1)
          |> Enum.find(fn e -> String.ends_with?(e, health_key_suffix) end)

        health_value = metadata[String.to_existing_atom(health_key)]
        health_value_downcased = health_value |> Atom.to_string() |> String.downcase()
        severity_default = Map.get(mapping.values, "*")
        Map.get(mapping.values, health_value_downcased, severity_default)

      :key_exists ->
        key = mapping.key

        case key in keys do
          true ->
            :warning

          false ->
            :info
        end
    end
  end
end
