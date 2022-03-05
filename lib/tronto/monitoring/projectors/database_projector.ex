defmodule Tronto.Monitoring.DatabaseProjector do
  @moduledoc """
  Database projector
  """

  use Commanded.Projections.Ecto,
    application: Tronto.Commanded,
    repo: Tronto.Repo,
    name: "database_projector"

  alias Tronto.Monitoring.{
    DatabaseInstanceReadModel,
    DatabaseReadModel
  }

  alias Tronto.Monitoring.Domain.Events.DatabaseInstanceRegistered

  project(
    %DatabaseInstanceRegistered{
      sap_system_id: sap_system_id,
      sid: sid,
      instance_number: instance_number,
      tenant: tenant,
      features: features,
      host_id: host_id
    },
    fn multi ->
      database_changeset =
        %DatabaseReadModel{}
        |> DatabaseReadModel.changeset(%{id: sap_system_id, sid: sid})

      database_instance_changeset =
        %DatabaseInstanceReadModel{}
        |> DatabaseInstanceReadModel.changeset(%{
          sap_system_id: sap_system_id,
          sid: sid,
          instance_number: instance_number,
          tenant: tenant,
          features: features,
          host_id: host_id
        })

      multi
      |> Ecto.Multi.insert(:database, database_changeset, on_conflict: :nothing)
      |> Ecto.Multi.insert(:database_instance, database_instance_changeset)
    end
  )
end
