defmodule Trento.DatabaseProjector do
  @moduledoc """
  Database projector
  """

  use Commanded.Projections.Ecto,
    application: Trento.Commanded,
    repo: Trento.Repo,
    name: "database_projector"

  alias Trento.{
    DatabaseInstanceReadModel,
    DatabaseReadModel
  }

  alias Trento.Support.StructHelper

  alias Trento.Domain.Events.{
    DatabaseHealthChanged,
    DatabaseInstanceHealthChanged,
    DatabaseInstanceRegistered,
    DatabaseInstanceSystemReplicationChanged,
    DatabaseRegistered
  }

  @databases_topic "monitoring:databases"

  project(
    %DatabaseRegistered{sap_system_id: sap_system_id, sid: sid, health: health},
    fn multi ->
      changeset =
        %DatabaseReadModel{}
        |> DatabaseReadModel.changeset(%{id: sap_system_id, sid: sid, health: health})

      Ecto.Multi.insert(multi, :database, changeset)
    end
  )

  project(
    %DatabaseHealthChanged{
      sap_system_id: sap_system_id,
      health: health
    },
    fn multi ->
      changeset =
        %DatabaseReadModel{id: sap_system_id}
        |> DatabaseReadModel.changeset(%{health: health})

      Ecto.Multi.update(multi, :database, changeset)
    end
  )

  project(
    %DatabaseInstanceRegistered{
      sap_system_id: sap_system_id,
      sid: sid,
      instance_number: instance_number,
      instance_hostname: instance_hostname,
      tenant: tenant,
      features: features,
      http_port: http_port,
      https_port: https_port,
      start_priority: start_priority,
      host_id: host_id,
      system_replication: system_replication,
      system_replication_status: system_replication_status,
      health: health
    },
    fn multi ->
      database_instance_changeset =
        %DatabaseInstanceReadModel{}
        |> DatabaseInstanceReadModel.changeset(%{
          sap_system_id: sap_system_id,
          sid: sid,
          instance_number: instance_number,
          instance_hostname: instance_hostname,
          tenant: tenant,
          features: features,
          http_port: http_port,
          https_port: https_port,
          start_priority: start_priority,
          host_id: host_id,
          system_replication: system_replication,
          system_replication_status: system_replication_status,
          health: health
        })

      Ecto.Multi.insert(multi, :database_instance, database_instance_changeset)
    end
  )

  project(
    %DatabaseInstanceHealthChanged{
      sap_system_id: sap_system_id,
      host_id: host_id,
      instance_number: instance_number,
      health: health
    },
    fn multi ->
      changeset =
        %DatabaseInstanceReadModel{
          sap_system_id: sap_system_id,
          host_id: host_id,
          instance_number: instance_number
        }
        |> DatabaseInstanceReadModel.changeset(%{health: health})

      Ecto.Multi.update(multi, :database_instance, changeset)
    end
  )

  project(
    %DatabaseInstanceSystemReplicationChanged{
      sap_system_id: sap_system_id,
      host_id: host_id,
      instance_number: instance_number,
      system_replication: system_replication,
      system_replication_status: system_replication_status
    },
    fn multi ->
      changeset =
        %DatabaseInstanceReadModel{
          sap_system_id: sap_system_id,
          host_id: host_id,
          instance_number: instance_number
        }
        |> DatabaseInstanceReadModel.changeset(%{
          system_replication: system_replication,
          system_replication_status: system_replication_status
        })

      Ecto.Multi.update(multi, :database_instance, changeset)
    end
  )

  @impl true
  def after_update(
        %DatabaseRegistered{},
        _,
        %{database: %DatabaseReadModel{} = database}
      ) do
    TrentoWeb.Endpoint.broadcast(
      @databases_topic,
      "database_registered",
      StructHelper.to_map(database)
    )
  end

  @impl true
  def after_update(
        %DatabaseHealthChanged{},
        _,
        %{database: %DatabaseReadModel{id: id, health: health}}
      ) do
    TrentoWeb.Endpoint.broadcast(
      @databases_topic,
      "database_health_changed",
      %{
        id: id,
        health: health
      }
    )
  end

  @impl true
  def after_update(
        %DatabaseInstanceRegistered{},
        _,
        %{database_instance: %DatabaseInstanceReadModel{} = instance}
      ) do
    TrentoWeb.Endpoint.broadcast(
      @databases_topic,
      "database_instance_registered",
      StructHelper.to_map(instance)
    )
  end

  @impl true
  def after_update(
        %DatabaseInstanceHealthChanged{},
        _,
        %{
          database_instance: %DatabaseInstanceReadModel{
            sap_system_id: sap_system_id,
            host_id: host_id,
            instance_number: instance_number,
            health: health
          }
        }
      ) do
    TrentoWeb.Endpoint.broadcast(
      @databases_topic,
      "database_instance_health_changed",
      %{
        sap_system_id: sap_system_id,
        host_id: host_id,
        instance_number: instance_number,
        health: health
      }
    )
  end

  @impl true
  def after_update(
        %DatabaseInstanceSystemReplicationChanged{},
        _,
        %{
          database_instance: %DatabaseInstanceReadModel{
            sap_system_id: sap_system_id,
            host_id: host_id,
            instance_number: instance_number,
            system_replication: system_replication,
            system_replication_status: system_replication_status
          }
        }
      ) do
    TrentoWeb.Endpoint.broadcast(
      @databases_topic,
      "database_instance_system_replication_changed",
      %{
        sap_system_id: sap_system_id,
        host_id: host_id,
        instance_number: instance_number,
        system_replication: system_replication,
        system_replication_status: system_replication_status
      }
    )
  end

  @impl true
  def after_update(_, _, _), do: :ok
end
