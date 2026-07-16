# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Infrastructure.Commanded.EventHandlers.SapSystemDatabaseStaleAtEventHandler do
  @moduledoc """
  This event handler is responsible to forward update database stale_at commands to the SAP systems
  related to a database that has a new stale_at state.

  Once the resulting event is emitted, the event handler broadcasts its results.
  """

  use Commanded.Event.Handler,
    application: Trento.Commanded,
    name: "sap_system_database_stale_at_event_handler"

  alias Trento.Databases.Events.{DatabaseDataMarkedInSync, DatabaseDataMarkedStale}
  alias Trento.Databases.Projections.DatabaseReadModel
  alias Trento.Repo
  alias Trento.SapSystems.Commands.UpdateDatabaseStaleAt
  alias Trento.SapSystems.Events.SapSystemDatabaseStaleAtChanged

  alias TrentoWeb.V1.SapSystemJSON

  import Ecto.Query, only: [from: 2]

  require Logger

  def handle(%DatabaseDataMarkedStale{database_id: database_id, stale_at: stale_at}, metadata) do
    update_sap_systems_database_stale_at(database_id, stale_at, metadata)
  end

  def handle(%DatabaseDataMarkedInSync{database_id: database_id}, metadata) do
    update_sap_systems_database_stale_at(database_id, nil, metadata)
  end

  def handle(
        %SapSystemDatabaseStaleAtChanged{
          sap_system_id: sap_system_id,
          database_stale_at: database_stale_at
        },
        _metadata
      ) do
    TrentoWeb.Endpoint.broadcast(
      "monitoring:sap_systems",
      "sap_system_updated",
      SapSystemJSON.sap_system_database_stale_at_changed(%{
        sap_system: %{
          id: sap_system_id,
          database_stale_at: database_stale_at
        }
      })
    )
  end

  defp update_sap_systems_database_stale_at(
         database_id,
         database_stale_at,
         %{correlation_id: correlation_id, causation_id: causation_id}
       ) do
    %{sap_systems: sap_systems} =
      Repo.one!(
        from(d in DatabaseReadModel,
          where: d.id == ^database_id,
          preload: [:sap_systems],
          select: [:id]
        )
      )

    for %{id: sap_system_id, sid: sid} <- sap_systems do
      stale_at_message = if database_stale_at, do: database_stale_at, else: "nil (in-sync)"
      Logger.info("Updating database stale_at of #{sid} SAP system to #{stale_at_message}")

      commanded().dispatch(
        %UpdateDatabaseStaleAt{
          sap_system_id: sap_system_id,
          database_stale_at: database_stale_at
        },
        correlation_id: correlation_id,
        causation_id: causation_id
      )
    end

    :ok
  end

  defp commanded,
    do: Application.fetch_env!(:trento, Trento.Commanded)[:adapter]
end
