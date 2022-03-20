defmodule Trento.SapSystemProjector do
  @moduledoc """
  SAP System projector
  """

  use Commanded.Projections.Ecto,
    application: Trento.Commanded,
    repo: Trento.Repo,
    name: "sap_system_projector"

  alias Trento.Domain.Events.{
    ApplicationInstanceRegistered,
    SapSystemHealthChanged,
    SapSystemRegistered
  }

  alias Trento.Support.StructHelper

  alias Trento.{
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
    %SapSystemHealthChanged{
      sap_system_id: sap_system_id,
      health: health
    },
    fn multi ->
      changeset =
        %SapSystemReadModel{id: sap_system_id}
        |> SapSystemReadModel.changeset(%{health: health})

      Ecto.Multi.update(multi, :sap_system, changeset)
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

  @impl true
  def after_update(
        %SapSystemRegistered{},
        _,
        %{sap_system: sap_system}
      ) do
    TrentoWeb.Endpoint.broadcast(
      "monitoring:sap_systems",
      "sap_system_registered",
      StructHelper.to_map(sap_system)
    )
  end

  def after_update(
        %ApplicationInstanceRegistered{},
        _,
        %{application_instance: instance}
      ) do
    TrentoWeb.Endpoint.broadcast(
      "monitoring:sap_systems",
      "application_instance_registered",
      StructHelper.to_map(instance)
    )
  end

  def after_update(_, _, _), do: :ok
end
