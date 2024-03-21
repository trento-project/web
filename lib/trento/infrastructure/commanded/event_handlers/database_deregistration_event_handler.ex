defmodule Trento.Infrastructure.Commanded.EventHandlers.DatabaseDeregistrationEventHandler do
  @moduledoc """
  This event handler is responsible to forward deregistration commands to the SAP systems
  related to a deregistered database
  """

  use Commanded.Event.Handler,
    application: Trento.Commanded,
    name: "database_deregistration_event_handler"

  alias Trento.SapSystems.Commands.DeregisterSapSystem
  alias Trento.Databases.Events.DatabaseDeregistered
  alias Trento.Repo
  alias Trento.SapSystems.Projections.DatabaseReadModel

  import Ecto.Query, only: [from: 2]

  require Logger

  def handle(
        %DatabaseDeregistered{database_id: database_id, deregistered_at: deregistered_at},
        _metadata
      ) do
    database =
      from(d in DatabaseReadModel,
        where: d.id == ^database_id,
        preload: [:sap_systems],
        select: [:id]
      )
      |> Repo.one!()

    for %{id: sap_system_id} <- database.sap_systems do
      Logger.info(
        "Deregistering sap system: #{sap_system_id} attached to database: #{database_id}"
      )

      commanded().dispatch(
        %DeregisterSapSystem{sap_system_id: sap_system_id, deregistered_at: deregistered_at},
        consistency: :strong
      )
    end

    :ok
  end

  defp commanded,
    do: Application.fetch_env!(:trento, Trento.Commanded)[:adapter]
end
