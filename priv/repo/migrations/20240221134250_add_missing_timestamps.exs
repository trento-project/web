defmodule Trento.Repo.Migrations.AddMissingTimestamps do
  use Ecto.Migration

  def change do
    [
      :heartbeats,
      :hosts,
      :clusters,
      :database_instances,
      :sap_systems,
      :application_instances,
      :databases,
      :tags,
      :settings,
      :clusters_enrichment_data
    ]
    |> Enum.each(fn table ->
      alter table(table) do
        # We add the default value to deal with already existing records, otherwise the not-null constraint of timestamps is triggered
        timestamps(default: "NOW()", type: :utc_datetime_usec)
      end
    end)

    [
      :users,
      :projection_versions,
      :sles_subscriptions,
      :discovery_events,
      :hosts_telemetry,
      :discarded_discovery_events
    ]
    |> Enum.each(fn table ->
      alter table(table) do
        modify :inserted_at, :utc_datetime_usec, default: "NOW()"
        modify :updated_at, :utc_datetime_usec, default: "NOW()"
      end
    end)
  end
end
