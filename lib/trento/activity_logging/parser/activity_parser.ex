defmodule Trento.ActivityLog.Parser.ActivityParser do
  @moduledoc """
  Activity parser extracts the activity relevant information from the context.
  """

  alias Trento.ActivityLog.ActivityCatalog
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
         {:ok, enriched_metadata} <- MetadataEnricher.enrich(metadata, activity) do
      {:ok,
       %{
         type: Atom.to_string(activity),
         actor: actor,
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
end
