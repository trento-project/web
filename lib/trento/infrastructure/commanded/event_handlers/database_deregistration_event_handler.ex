defmodule Trento.Infrastructure.Commanded.EventHandlers.DatabaseDeregistrationEventHandler do
  @moduledoc """
  This event handler is responsible to forward deregistration commands to the SAP systems
  related to a deregistered database
  """

  use Commanded.Event.Handler,
    application: Trento.Commanded,
    name: "database_deregistration_event_handler"

  alias Trento.Databases.Events.{
    DatabaseDeregistered,
    DatabaseTenantsUpdated
  }

  alias Trento.Databases.Projections.DatabaseReadModel
  alias Trento.Databases.ValueObjects.Tenant
  alias Trento.Repo
  alias Trento.SapSystems.Commands.DeregisterSapSystem
  alias Trento.SapSystems.Projections.SapSystemReadModel

  import Ecto.Query, only: [from: 2]

  require Logger

  def handle(
        %DatabaseDeregistered{database_id: database_id, deregistered_at: deregistered_at},
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
      Logger.info("Deregistering sap system #{sid} attached to database #{database_id}")

      commanded().dispatch(
        %DeregisterSapSystem{sap_system_id: sap_system_id, deregistered_at: deregistered_at},
        consistency: :strong
      )
    end

    :ok
  end

  def handle(
        %DatabaseTenantsUpdated{
          database_id: database_id,
          tenants: tenants,
          previous_tenants: previous_tenants
        },
        %{
          created_at: dereregistered_at
        }
      ) do
    removed_tenants = previous_tenants -- tenants

    for %Tenant{name: tenant_name} <- removed_tenants do
      from(s in SapSystemReadModel,
        where: s.database_id == ^database_id and s.tenant == ^tenant_name,
        select: [:id, :sid]
      )
      |> Repo.all()
      |> Enum.each(fn %SapSystemReadModel{id: sap_system_id, sid: sid} ->
        Logger.info(
          "Deregistering sap system #{sid} attached to database #{database_id} with tenant #{tenant_name}"
        )

        commanded().dispatch(
          %DeregisterSapSystem{sap_system_id: sap_system_id, deregistered_at: dereregistered_at},
          consistency: :strong
        )
      end)
    end

    :ok
  end

  defp commanded,
    do: Application.fetch_env!(:trento, Trento.Commanded)[:adapter]
end
