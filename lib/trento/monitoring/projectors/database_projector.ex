defmodule Trento.Monitoring.DatabaseProjector do
  @moduledoc """
  Database projector
  """

  use Commanded.Projections.Ecto,
    application: Trento.Commanded,
    repo: Trento.Repo,
    name: "database_projector"

  alias Trento.Monitoring.{
    DatabaseInstanceReadModel,
    DatabaseReadModel
  }

  alias Trento.Support.StructHelper

  alias Trento.Monitoring.Domain.Events.{
    DatabaseInstanceRegistered,
    DatabaseRegistered
  }

  project(
    %DatabaseRegistered{sap_system_id: sap_system_id, sid: sid, health: health},
    fn multi ->
      database_changeset =
        %DatabaseReadModel{}
        |> DatabaseReadModel.changeset(%{id: sap_system_id, sid: sid, health: health})

      Ecto.Multi.insert(multi, :database, database_changeset)
    end
  )

  project(
    %DatabaseInstanceRegistered{
      sap_system_id: sap_system_id,
      sid: sid,
      instance_number: instance_number,
      tenant: tenant,
      features: features,
      host_id: host_id,
      health: health
    },
    fn multi ->
      database_instance_changeset =
        %DatabaseInstanceReadModel{}
        |> DatabaseInstanceReadModel.changeset(%{
          sap_system_id: sap_system_id,
          sid: sid,
          instance_number: instance_number,
          tenant: tenant,
          features: features,
          host_id: host_id,
          health: health
        })

      Ecto.Multi.insert(multi, :database_instance, database_instance_changeset)
    end
  )

  @impl true
  def after_update(
        %DatabaseInstanceRegistered{},
        _,
        %{database_instance: instance}
      ) do
    TrentoWeb.Endpoint.broadcast(
      "monitoring:databases",
      "database_instance_registered",
      StructHelper.to_map(instance)
    )
  end

  def after_update(_, _, _), do: :ok
end
