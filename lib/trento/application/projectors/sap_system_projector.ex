defmodule Trento.SapSystemProjector do
  @moduledoc """
  SAP System projector
  """

  use Commanded.Projections.Ecto,
    application: Trento.Commanded,
    repo: Trento.Repo,
    name: "sap_system_projector"

  alias Trento.Domain.Events.{
    ApplicationInstanceDeregistered,
    ApplicationInstanceHealthChanged,
    ApplicationInstanceRegistered,
    SapSystemDeregistered,
    SapSystemHealthChanged,
    SapSystemRegistered,
    SapSystemUpdated
  }

  alias TrentoWeb.V1.SapSystemView

  alias Trento.{
    ApplicationInstanceReadModel,
    SapSystemReadModel
  }

  alias Trento.Repo

  project(
    %SapSystemRegistered{
      sap_system_id: sap_system_id,
      sid: sid,
      tenant: tenant,
      db_host: db_host,
      health: health,
      ensa_version: ensa_version
    },
    fn multi ->
      changeset =
        SapSystemReadModel.changeset(%SapSystemReadModel{}, %{
          id: sap_system_id,
          sid: sid,
          tenant: tenant,
          db_host: db_host,
          health: health,
          ensa_version: ensa_version
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
        SapSystemReadModel.changeset(%SapSystemReadModel{id: sap_system_id}, %{health: health})

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
        ApplicationInstanceReadModel.changeset(%ApplicationInstanceReadModel{}, %{
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
        ApplicationInstanceReadModel.changeset(
          %ApplicationInstanceReadModel{
            sap_system_id: sap_system_id,
            host_id: host_id,
            instance_number: instance_number
          },
          %{health: health}
        )

      Ecto.Multi.update(multi, :application_instance, changeset)
    end
  )

  project(
    %SapSystemDeregistered{
      sap_system_id: sap_system_id,
      deregistered_at: deregistered_at
    },
    fn multi ->
      changeset =
        SapSystemReadModel.changeset(
          %SapSystemReadModel{id: sap_system_id},
          %{deregistered_at: deregistered_at}
        )

      Ecto.Multi.update(multi, :sap_system, changeset)
    end
  )

  project(
    %ApplicationInstanceDeregistered{
      instance_number: instance_number,
      host_id: host_id,
      sap_system_id: sap_system_id
    },
    fn multi ->
      deregistered_instance =
        Repo.get_by(ApplicationInstanceReadModel,
          sap_system_id: sap_system_id,
          instance_number: instance_number,
          host_id: host_id
        )

      Ecto.Multi.delete(multi, :application_instance, deregistered_instance)
    end
  )

  project(
    %SapSystemUpdated{
      sap_system_id: sap_system_id,
      ensa_version: ensa_version
    },
    fn multi ->
      changeset =
        SapSystemReadModel.changeset(%SapSystemReadModel{id: sap_system_id}, %{
          ensa_version: ensa_version
        })

      Ecto.Multi.update(multi, :sap_system, changeset)
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
      SapSystemView.render("sap_system_registered.json", sap_system: sap_system)
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
      SapSystemView.render("sap_system_health_changed.json",
        health: %{
          id: id,
          health: health
        }
      )
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
      SapSystemView.render("application_instance.json", instance: instance)
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
      SapSystemView.render("application_instance_health_changed.json",
        health: %{
          sap_system_id: sap_system_id,
          host_id: host_id,
          instance_number: instance_number,
          health: health
        }
      )
    )
  end

  @impl true
  def after_update(
        %SapSystemDeregistered{sap_system_id: sap_system_id},
        _,
        _
      ) do
    %SapSystemReadModel{sid: sid} = Repo.get!(SapSystemReadModel, sap_system_id)

    TrentoWeb.Endpoint.broadcast(
      @sap_systems_topic,
      "sap_system_deregistered",
      SapSystemView.render("sap_system_deregistered.json",
        id: sap_system_id,
        sid: sid
      )
    )
  end

  @impl true
  def after_update(
        %ApplicationInstanceDeregistered{
          instance_number: instance_number,
          host_id: host_id,
          sap_system_id: sap_system_id
        },
        _,
        _
      ) do
    TrentoWeb.Endpoint.broadcast(
      @sap_systems_topic,
      "application_instance_deregistered",
      SapSystemView.render("instance_deregistered.json",
        sap_system_id: sap_system_id,
        instance_number: instance_number,
        host_id: host_id
      )
    )
  end

  @impl true
  def after_update(
        %SapSystemUpdated{sap_system_id: sap_system_id, ensa_version: ensa_version},
        _,
        _
      ) do
    TrentoWeb.Endpoint.broadcast(
      @sap_systems_topic,
      "sap_system_updated",
      SapSystemView.render("sap_system_updated.json",
        id: sap_system_id,
        ensa_version: ensa_version
      )
    )
  end

  @impl true
  def after_update(_, _, _), do: :ok
end
