defmodule Tronto.Monitoring.SapSystemProjector do
  @moduledoc """
  SAP System projector
  """

  use Commanded.Projections.Ecto,
    application: Tronto.Commanded,
    repo: Tronto.Repo,
    name: "sap_system_projector"

  alias Tronto.Monitoring.Domain.Events.{
    ApplicationInstanceRegistered,
    SapSystemRegistered
  }

  alias Tronto.Monitoring.{
    ApplicationInstanceReadModel,
    SapSystemReadModel
  }

  project(
    %SapSystemRegistered{
      sap_system_id: sap_system_id,
      sid: sid,
      tenant: tenant,
      db_host: db_host,
      health: health
    },
    fn multi ->
      changeset =
        %SapSystemReadModel{}
        |> SapSystemReadModel.changeset(%{
          id: sap_system_id,
          sid: sid,
          tenant: tenant,
          db_host: db_host,
          health: health
        })

      Ecto.Multi.insert(multi, :sap_system, changeset)
    end
  )

  project(
    %ApplicationInstanceRegistered{
      sap_system_id: sap_system_id,
      sid: sid,
      instance_number: instance_number,
      features: features,
      host_id: host_id,
      health: health
    },
    fn multi ->
      changeset =
        %ApplicationInstanceReadModel{}
        |> ApplicationInstanceReadModel.changeset(%{
          sap_system_id: sap_system_id,
          sid: sid,
          instance_number: instance_number,
          features: features,
          host_id: host_id,
          health: health
        })

      Ecto.Multi.insert(multi, :application_instance, changeset)
    end
  )
end
