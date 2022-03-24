defmodule Trento.SapSystemProjector do
  @moduledoc """
  SAP System projector
  """

  use Commanded.Projections.Ecto,
    application: Trento.Commanded,
    repo: Trento.Repo,
    name: "sap_system_projector"

  alias Trento.Domain.Events.{
    ApplicationInstanceHealthChanged,
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
      instance_hostname: instance_hostname,
      features: features,
      http_port: http_port,
      https_port: https_port,
      start_priority: start_priority,
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
          instance_hostname: instance_hostname,
          features: features,
          http_port: http_port,
          https_port: https_port,
          start_priority: start_priority,
          host_id: host_id,
          health: health
        })

      Ecto.Multi.insert(multi, :application_instance, changeset)
    end
  )

  project(
    %ApplicationInstanceHealthChanged{
      sap_system_id: sap_system_id,
      host_id: host_id,
      instance_number: instance_number,
      health: health
    },
    fn multi ->
      changeset =
        %ApplicationInstanceReadModel{
          sap_system_id: sap_system_id,
          host_id: host_id,
          instance_number: instance_number
        }
        |> ApplicationInstanceReadModel.changeset(%{health: health})

      Ecto.Multi.update(multi, :application_instance, changeset)
    end
  )

  @sap_systems_topic "monitoring:sap_systems"

  @impl true
  def after_update(
        %SapSystemRegistered{},
        _,
        %{sap_system: %SapSystemReadModel{} = sap_system}
      ) do
    TrentoWeb.Endpoint.broadcast(
      @sap_systems_topic,
      "sap_system_registered",
      StructHelper.to_map(sap_system)
    )
  end

  @impl true
  def after_update(
        %SapSystemHealthChanged{},
        _,
        %{sap_system: %SapSystemReadModel{id: id, health: health}}
      ) do
    TrentoWeb.Endpoint.broadcast(
      @sap_systems_topic,
      "sap_system_health_changed",
      %{
        id: id,
        health: health
      }
    )
  end

  @impl true
  def after_update(
        %ApplicationInstanceRegistered{},
        _,
        %{application_instance: %ApplicationInstanceReadModel{} = instance}
      ) do
    TrentoWeb.Endpoint.broadcast(
      @sap_systems_topic,
      "application_instance_registered",
      StructHelper.to_map(instance)
    )
  end

  @impl true
  def after_update(
        %ApplicationInstanceHealthChanged{},
        _,
        %{
          application_instance: %ApplicationInstanceReadModel{
            sap_system_id: sap_system_id,
            host_id: host_id,
            instance_number: instance_number,
            health: health
          }
        }
      ) do
    TrentoWeb.Endpoint.broadcast(
      @sap_systems_topic,
      "application_instance_health_changed",
      %{
        sap_system_id: sap_system_id,
        host_id: host_id,
        instance_number: instance_number,
        health: health
      }
    )
  end

  @impl true
  def after_update(_, _, _), do: :ok
end
