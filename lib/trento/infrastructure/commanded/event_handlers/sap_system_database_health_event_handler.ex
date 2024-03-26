defmodule Trento.Infrastructure.Commanded.EventHandlers.SapSystemDatabaseHealthEventHandler do
  @moduledoc """
  This event handler is responsible to forward update database health commands to the SAP systems
  related to a database that has a new health state
  """

  use Commanded.Event.Handler,
    application: Trento.Commanded,
    name: "sap_system_database_health_event_handler"

  alias Trento.Databases.Events.DatabaseHealthChanged
  alias Trento.Databases.Projections.DatabaseReadModel
  alias Trento.Repo
  alias Trento.SapSystems.Commands.UpdateDatabaseHealth

  import Ecto.Query, only: [from: 2]

  require Logger

  def handle(
        %DatabaseHealthChanged{database_id: database_id, health: health},
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

    for %{id: sap_system_id, sid: sid} <- sap_systems do
      Logger.info("Updating database health of #{sid} SAP system to #{health}")

      commanded().dispatch(
        %UpdateDatabaseHealth{sap_system_id: sap_system_id, database_health: health},
        consistency: :strong
      )
    end

    :ok
  end

  defp commanded,
    do: Application.fetch_env!(:trento, Trento.Commanded)[:adapter]
end
