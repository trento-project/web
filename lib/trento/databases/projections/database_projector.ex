defmodule Trento.Databases.Projections.DatabaseProjector do
  @moduledoc """
  Database projector
  """

  use Commanded.Projections.Ecto,
    application: Trento.Commanded,
    repo: Trento.Repo,
    name: "database_projector"

  alias Trento.Databases.Projections.{
    DatabaseInstanceReadModel,
    DatabaseReadModel
  }

  alias TrentoWeb.V1.DatabaseJSON

  alias Trento.Databases.Events.{
    DatabaseDeregistered,
    DatabaseHealthChanged,
    DatabaseInstanceDeregistered,
    DatabaseInstanceHealthChanged,
    DatabaseInstanceMarkedAbsent,
    DatabaseInstanceMarkedPresent,
    DatabaseInstanceRegistered,
    DatabaseInstanceSystemReplicationChanged,
    DatabaseRegistered,
    DatabaseRestored,
    DatabaseTenantsUpdated
  }

  alias Trento.Repo

  @databases_topic "monitoring:databases"

  project(
    %DatabaseRegistered{database_id: database_id, sid: sid, health: health},
    fn multi ->
      changeset =
        DatabaseReadModel.changeset(%DatabaseReadModel{}, %{
          id: database_id,
          sid: sid,
          health: health
        })

      Ecto.Multi.insert(multi, :database, changeset)
    end
  )

  project(
    %DatabaseHealthChanged{
      database_id: database_id,
      health: health
    },
    fn multi ->
      changeset =
        DatabaseReadModel
        |> Repo.get!(database_id)
        |> DatabaseReadModel.changeset(%{health: health})

      Ecto.Multi.update(multi, :database, changeset)
    end
  )

  project(
    %DatabaseTenantsUpdated{
      database_id: database_id,
      tenants: tenants
    },
    fn multi ->
      changeset =
        DatabaseReadModel
        |> Repo.get!(database_id)
        |> DatabaseReadModel.changeset(%{tenants: Enum.map(tenants, &Map.from_struct/1)})

      Ecto.Multi.update(multi, :database, changeset)
    end
  )

  project(
    %DatabaseInstanceRegistered{
      database_id: database_id,
      sid: sid,
      instance_number: instance_number,
      instance_hostname: instance_hostname,
      features: features,
      http_port: http_port,
      https_port: https_port,
      start_priority: start_priority,
      host_id: host_id,
      system_replication: system_replication,
      system_replication_status: system_replication_status,
      system_replication_site: system_replication_site,
      system_replication_mode: system_replication_mode,
      system_replication_operation_mode: system_replication_operation_mode,
      system_replication_source_site: system_replication_source_site,
      system_replication_tier: system_replication_tier,
      health: health
    },
    fn multi ->
      database_instance_changeset =
        DatabaseInstanceReadModel.changeset(%DatabaseInstanceReadModel{}, %{
          database_id: database_id,
          sid: sid,
          instance_number: instance_number,
          instance_hostname: instance_hostname,
          features: features,
          http_port: http_port,
          https_port: https_port,
          start_priority: start_priority,
          host_id: host_id,
          system_replication: system_replication,
          system_replication_status: system_replication_status,
          system_replication_site: system_replication_site,
          system_replication_mode: system_replication_mode,
          system_replication_operation_mode: system_replication_operation_mode,
          system_replication_source_site: system_replication_source_site,
          system_replication_tier: system_replication_tier,
          health: health
        })

      Ecto.Multi.insert(multi, :database_instance, database_instance_changeset)
    end
  )

  project(
    %DatabaseInstanceHealthChanged{
      database_id: database_id,
      host_id: host_id,
      instance_number: instance_number,
      health: health
    },
    fn multi ->
      changeset =
        DatabaseInstanceReadModel
        |> Repo.get_by(
          database_id: database_id,
          instance_number: instance_number,
          host_id: host_id
        )
        |> DatabaseInstanceReadModel.changeset(%{health: health})

      Ecto.Multi.update(multi, :database_instance, changeset)
    end
  )

  project(
    %DatabaseInstanceSystemReplicationChanged{
      database_id: database_id,
      host_id: host_id,
      instance_number: instance_number,
      system_replication: system_replication,
      system_replication_status: system_replication_status,
      system_replication_site: system_replication_site,
      system_replication_mode: system_replication_mode,
      system_replication_operation_mode: system_replication_operation_mode,
      system_replication_source_site: system_replication_source_site,
      system_replication_tier: system_replication_tier
    },
    fn multi ->
      changeset =
        DatabaseInstanceReadModel
        |> Repo.get_by(
          database_id: database_id,
          instance_number: instance_number,
          host_id: host_id
        )
        |> DatabaseInstanceReadModel.changeset(%{
          system_replication: system_replication,
          system_replication_status: system_replication_status,
          system_replication_site: system_replication_site,
          system_replication_mode: system_replication_mode,
          system_replication_operation_mode: system_replication_operation_mode,
          system_replication_source_site: system_replication_source_site,
          system_replication_tier: system_replication_tier
        })

      Ecto.Multi.update(multi, :database_instance, changeset)
    end
  )

  project(
    %DatabaseInstanceMarkedAbsent{
      instance_number: instance_number,
      host_id: host_id,
      database_id: database_id,
      absent_at: absent_at
    },
    fn multi ->
      changeset =
        DatabaseInstanceReadModel
        |> Repo.get_by(
          database_id: database_id,
          instance_number: instance_number,
          host_id: host_id
        )
        |> DatabaseInstanceReadModel.changeset(%{
          absent_at: absent_at
        })

      Ecto.Multi.update(multi, :database_instance, changeset)
    end
  )

  project(
    %DatabaseInstanceMarkedPresent{
      instance_number: instance_number,
      host_id: host_id,
      database_id: database_id
    },
    fn multi ->
      changeset =
        DatabaseInstanceReadModel
        |> Repo.get_by(
          database_id: database_id,
          instance_number: instance_number,
          host_id: host_id
        )
        |> DatabaseInstanceReadModel.changeset(%{
          absent_at: nil
        })

      Ecto.Multi.update(multi, :database_instance, changeset)
    end
  )

  project(
    %DatabaseDeregistered{
      database_id: database_id,
      deregistered_at: deregistered_at
    },
    fn multi ->
      changeset =
        DatabaseReadModel
        |> Repo.get!(database_id)
        |> DatabaseReadModel.changeset(%{deregistered_at: deregistered_at})

      Ecto.Multi.update(multi, :database, changeset)
    end
  )

  project(
    %DatabaseRestored{
      database_id: database_id,
      health: health
    },
    fn multi ->
      changeset =
        DatabaseReadModel
        |> Repo.get!(database_id)
        |> DatabaseReadModel.changeset(%{deregistered_at: nil, health: health})

      Ecto.Multi.update(multi, :database, changeset)
    end
  )

  project(
    %DatabaseInstanceDeregistered{
      instance_number: instance_number,
      host_id: host_id,
      database_id: database_id
    },
    fn multi ->
      deregistered_instance =
        Repo.get_by(DatabaseInstanceReadModel,
          database_id: database_id,
          instance_number: instance_number,
          host_id: host_id
        )

      Ecto.Multi.delete(multi, :database_instance, deregistered_instance)
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
      DatabaseJSON.database_registered(%{database: database})
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
      DatabaseJSON.database_health_changed(%{
        health: %{
          id: id,
          health: health
        }
      })
    )
  end

  @impl true
  def after_update(
        %DatabaseInstanceRegistered{},
        _,
        %{database_instance: %DatabaseInstanceReadModel{database_id: database_id} = instance}
      ) do
    # All database instances are required to compute the system replication status in the current instance
    database_instances =
      DatabaseInstanceReadModel
      |> where([i], i.database_id == ^database_id)
      |> Repo.all()

    TrentoWeb.Endpoint.broadcast(
      @databases_topic,
      "database_instance_registered",
      DatabaseJSON.database_instance(%{
        instance: instance,
        database_instances: database_instances
      })
    )
  end

  @impl true
  def after_update(
        %DatabaseInstanceHealthChanged{},
        _,
        %{
          database_instance: %DatabaseInstanceReadModel{
            database_id: database_id,
            host_id: host_id,
            instance_number: instance_number,
            health: health
          }
        }
      ) do
    TrentoWeb.Endpoint.broadcast(
      @databases_topic,
      "database_instance_health_changed",
      DatabaseJSON.database_instance_health_changed(%{
        instance: %{
          database_id: database_id,
          host_id: host_id,
          instance_number: instance_number,
          health: health
        }
      })
    )
  end

  @impl true
  def after_update(
        %DatabaseInstanceSystemReplicationChanged{},
        _,
        %{
          database_instance: %DatabaseInstanceReadModel{
            database_id: database_id,
            host_id: host_id,
            instance_number: instance_number,
            system_replication: system_replication,
            system_replication_status: system_replication_status,
            system_replication_site: system_replication_site,
            system_replication_mode: system_replication_mode,
            system_replication_operation_mode: system_replication_operation_mode,
            system_replication_source_site: system_replication_source_site,
            system_replication_tier: system_replication_tier
          }
        }
      ) do
    TrentoWeb.Endpoint.broadcast(
      @databases_topic,
      "database_instance_system_replication_changed",
      DatabaseJSON.database_instance_system_replication_changed(%{
        instance: %{
          database_id: database_id,
          host_id: host_id,
          instance_number: instance_number,
          system_replication: system_replication,
          system_replication_status: system_replication_status,
          system_replication_site: system_replication_site,
          system_replication_mode: system_replication_mode,
          system_replication_operation_mode: system_replication_operation_mode,
          system_replication_source_site: system_replication_source_site,
          system_replication_tier: system_replication_tier
        }
      })
    )
  end

  @impl true
  def after_update(
        %DatabaseInstanceMarkedAbsent{
          instance_number: instance_number,
          host_id: host_id,
          database_id: database_id,
          absent_at: absent_at
        },
        _,
        %{database_instance: %DatabaseInstanceReadModel{sid: sid}}
      ) do
    TrentoWeb.Endpoint.broadcast(
      @databases_topic,
      "database_instance_absent_at_changed",
      DatabaseJSON.database_instance_absent_at_changed(%{
        instance: %{
          instance_number: instance_number,
          host_id: host_id,
          database_id: database_id,
          sid: sid,
          absent_at: absent_at
        }
      })
    )
  end

  @impl true
  def after_update(
        %DatabaseInstanceMarkedPresent{
          instance_number: instance_number,
          host_id: host_id,
          database_id: database_id
        },
        _,
        %{database_instance: %DatabaseInstanceReadModel{sid: sid}}
      ) do
    TrentoWeb.Endpoint.broadcast(
      @databases_topic,
      "database_instance_absent_at_changed",
      DatabaseJSON.database_instance_absent_at_changed(%{
        instance: %{
          instance_number: instance_number,
          host_id: host_id,
          database_id: database_id,
          sid: sid,
          absent_at: nil
        }
      })
    )
  end

  @impl true
  def after_update(
        %DatabaseRestored{database_id: database_id},
        _,
        _
      ) do
    database =
      DatabaseReadModel
      |> Repo.get!(database_id)
      |> Repo.preload([:tags, :database_instances])

    TrentoWeb.Endpoint.broadcast(
      @databases_topic,
      "database_restored",
      DatabaseJSON.database_restored(%{database: database})
    )
  end

  @impl true
  def after_update(
        %DatabaseDeregistered{
          database_id: database_id
        },
        _,
        %{
          database: %DatabaseReadModel{
            sid: sid
          }
        }
      ) do
    TrentoWeb.Endpoint.broadcast(
      @databases_topic,
      "database_deregistered",
      DatabaseJSON.database_deregistered(%{
        id: database_id,
        sid: sid
      })
    )
  end

  @impl true
  def after_update(
        %DatabaseInstanceDeregistered{
          instance_number: instance_number,
          host_id: host_id,
          database_id: database_id
        },
        _,
        %{
          database_instance: %DatabaseInstanceReadModel{
            sid: sid
          }
        }
      ) do
    TrentoWeb.Endpoint.broadcast(
      @databases_topic,
      "database_instance_deregistered",
      DatabaseJSON.database_instance_deregistered(%{
        database_id: database_id,
        instance_number: instance_number,
        host_id: host_id,
        sid: sid
      })
    )
  end

  @impl true
  def after_update(
        %DatabaseTenantsUpdated{
          database_id: database_id
        },
        _,
        %{
          database: %DatabaseReadModel{
            tenants: tenants
          }
        }
      ) do
    TrentoWeb.Endpoint.broadcast(
      @databases_topic,
      "database_tenants_updated",
      DatabaseJSON.database_tenants_updated(%{tenants: tenants, database_id: database_id})
    )
  end

  @impl true
  def after_update(_, _, _), do: :ok
end
