defmodule Trento.Infrastructure.Commanded.EventHandlers.DatabaseRestoreEventHandler do
  @moduledoc """
  This event handler is responsible to forward restore commands to the SAP systems
  related to a restored database
  """

  use Commanded.Event.Handler,
    application: Trento.Commanded,
    name: "database_restore_event_handler"

  alias Trento.Databases.Events.DatabaseRestored
  alias Trento.Databases.Projections.DatabaseReadModel
  alias Trento.Repo
  alias Trento.SapSystems.Commands.RestoreSapSystem

  import Ecto.Query, only: [from: 2]

  require Logger

  def handle(
        %DatabaseRestored{database_id: database_id},
        _metadata
      ) do
    %{sap_systems: sap_systems} =
      Repo.one!(
        from(d in DatabaseReadModel,
          where: d.id == ^database_id,
          preload: [:sap_systems],
          select: [:id]
        )
      )

    for %{id: sap_system_id, tenant: tenant, db_host: db_host, sid: sid} <- sap_systems do
      Logger.info("Restoring sap system #{sid} attached to database #{database_id}")

      commanded().dispatch(
        %RestoreSapSystem{sap_system_id: sap_system_id, db_host: db_host, tenant: tenant},
        consistency: :strong
      )
    end

    :ok
  end

  defp commanded,
    do: Application.fetch_env!(:trento, Trento.Commanded)[:adapter]
end
