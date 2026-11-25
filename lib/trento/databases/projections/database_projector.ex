# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Databases.Projections.DatabaseProjector do
  @moduledoc """
  Database projector
  """

  use Commanded.Projections.Ecto,
    application: Trento.Commanded,
    repo: Trento.Repo,
    name: "database_projector"

  alias Trento.Databases.Projections.{
    DatabaseHealthDetails,
    DatabaseInstanceReadModel,
    DatabaseReadModel
  }

  alias TrentoWeb.V1.DatabaseJSON

  alias Trento.Databases.Events.{
    DatabaseDataMarkedInSync,
    DatabaseDataMarkedStale,
    DatabaseDeregistered,
    DatabaseHealthChanged,
    DatabaseInstanceDataMarkedInSync,
    DatabaseInstanceDataMarkedStale,
    DatabaseInstanceDeregistered,
    DatabaseInstanceMarkedAbsent,
    DatabaseInstanceMarkedPresent,
    DatabaseInstanceRegistered,
    DatabaseInstanceStatusChanged,
    DatabaseInstanceSystemReplicationChanged,
    DatabaseRegistered,
    DatabaseRestored,
    DatabaseTenantsUpdated
  }

  alias Trento.Repo
  alias Trento.Services.HealthService

  require Trento.Enums.Health, as: Health

  import Ecto.Query

  @databases_topic "monitoring:databases"

  project(
    %DatabaseRegistered{database_id: database_id, sid: sid, health: health},
    fn multi ->
      multi
      |> Ecto.Multi.run(:instances_health, fn repo, _changes ->
        {:ok, compute_instances_health(repo, database_id)}
      end)
      |> Ecto.Multi.insert(:database, fn %{instances_health: instances_health} ->
        DatabaseReadModel.changeset(%DatabaseReadModel{}, %{
          id: database_id,
          sid: sid,
          health: health,
          health_details: %{
            instances_health: %{value: instances_health, reason: ""}
          }
        })
      end)
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
      system_replication_site_id: system_replication_site_id,
      system_replication_mode: system_replication_mode,
      system_replication_operation_mode: system_replication_operation_mode,
      system_replication_source_site: system_replication_source_site,
      system_replication_tier: system_replication_tier,
      status: status
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
          system_replication_site_id: system_replication_site_id,
          system_replication_mode: system_replication_mode,
          system_replication_operation_mode: system_replication_operation_mode,
          system_replication_source_site: system_replication_source_site,
          system_replication_tier: system_replication_tier,
          status: status,
          stale_at: nil
        })

      multi
      |> Ecto.Multi.insert(:database_instance, database_instance_changeset)
      |> Ecto.Multi.run(:health_details, fn repo, _changes ->
        update_instances_health_details(repo, database_id)
      end)
    end
  )

  project(
    %DatabaseInstanceStatusChanged{
      database_id: database_id,
      host_id: host_id,
      instance_number: instance_number,
      status: status
    },
    fn multi ->
      changeset =
        DatabaseInstanceReadModel
        |> Repo.get_by(
          database_id: database_id,
          instance_number: instance_number,
          host_id: host_id
        )
        |> DatabaseInstanceReadModel.changeset(%{status: status})

      multi
      |> Ecto.Multi.update(:database_instance, changeset)
      |> Ecto.Multi.run(:health_details, fn repo, _changes ->
        update_instances_health_details(repo, database_id)
      end)
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
      system_replication_site_id: system_replication_site_id,
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
          system_replication_site_id: system_replication_site_id,
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
    %DatabaseInstanceDataMarkedStale{
      database_id: database_id,
      instance_number: instance_number,
      host_id: host_id,
      stale_at: stale_at
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
          stale_at: stale_at
        })

      Ecto.Multi.update(multi, :database_instance, changeset)
    end
  )

  project(
    %DatabaseInstanceDataMarkedInSync{
      database_id: database_id,
      instance_number: instance_number,
      host_id: host_id
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
          stale_at: nil
        })

      Ecto.Multi.update(multi, :database_instance, changeset)
    end
  )

  project(
    %DatabaseDataMarkedStale{
      database_id: database_id,
      stale_at: stale_at
    },
    fn multi ->
      changeset =
        DatabaseReadModel
        |> Repo.get!(database_id)
        |> DatabaseReadModel.changeset(%{stale_at: stale_at})

      Ecto.Multi.update(multi, :database, changeset)
    end
  )

  project(
    %DatabaseDataMarkedInSync{
      database_id: database_id
    },
    fn multi ->
      changeset =
        DatabaseReadModel
        |> Repo.get!(database_id)
        |> DatabaseReadModel.changeset(%{stale_at: nil})

      Ecto.Multi.update(multi, :database, changeset)
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
      multi
      |> Ecto.Multi.run(:instances_health, fn repo, _changes ->
        {:ok, compute_instances_health(repo, database_id)}
      end)
      |> Ecto.Multi.update(:database, fn %{instances_health: instances_health} ->
        DatabaseReadModel
        |> Repo.get!(database_id)
        |> DatabaseReadModel.changeset(%{
          deregistered_at: nil,
          health: health,
          health_details: %{
            instances_health: %{value: instances_health, reason: ""}
          }
        })
      end)
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

      multi
      |> Ecto.Multi.delete(:database_instance, deregistered_instance)
      |> Ecto.Multi.run(:health_details, fn repo, _changes ->
        update_instances_health_details(repo, database_id)
      end)
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
        %DatabaseInstanceRegistered{database_id: database_id},
        _,
        %{database_instance: %DatabaseInstanceReadModel{} = instance} = changes
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

    maybe_broadcast_health_details_changed(database_id, changes)
  end

  @impl true
  def after_update(
        %DatabaseInstanceStatusChanged{database_id: database_id},
        _,
        %{
          database_instance: %DatabaseInstanceReadModel{
            database_id: database_id,
            host_id: host_id,
            instance_number: instance_number,
            status: status
          }
        } = changes
      ) do
    TrentoWeb.Endpoint.broadcast(
      @databases_topic,
      "database_instance_status_changed",
      DatabaseJSON.database_instance_status_changed(%{
        instance: %{
          database_id: database_id,
          host_id: host_id,
          instance_number: instance_number,
          status: status
        }
      })
    )

    maybe_broadcast_health_details_changed(database_id, changes)
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
            system_replication_site_id: system_replication_site_id,
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
          system_replication_site_id: system_replication_site_id,
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
        %DatabaseInstanceDataMarkedStale{
          instance_number: instance_number,
          host_id: host_id,
          database_id: database_id,
          stale_at: stale_at
        },
        _,
        _
      ) do
    TrentoWeb.Endpoint.broadcast(
      @databases_topic,
      "database_instance_stale_changed",
      DatabaseJSON.database_instance_stale_changed(%{
        instance: %{
          instance_number: instance_number,
          host_id: host_id,
          database_id: database_id,
          stale_at: stale_at
        }
      })
    )
  end

  @impl true
  def after_update(
        %DatabaseInstanceDataMarkedInSync{
          instance_number: instance_number,
          host_id: host_id,
          database_id: database_id
        },
        _,
        _
      ) do
    TrentoWeb.Endpoint.broadcast(
      @databases_topic,
      "database_instance_stale_changed",
      DatabaseJSON.database_instance_stale_changed(%{
        instance: %{
          instance_number: instance_number,
          host_id: host_id,
          database_id: database_id,
          stale_at: nil
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
        } = changes
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

    maybe_broadcast_health_details_changed(database_id, changes)
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
  def after_update(
        %DatabaseDataMarkedStale{
          database_id: database_id,
          stale_at: stale_at
        },
        _,
        _
      ) do
    TrentoWeb.Endpoint.broadcast(
      @databases_topic,
      "database_stale_changed",
      DatabaseJSON.database_stale_changed(%{
        database: %{
          id: database_id,
          stale_at: stale_at
        }
      })
    )
  end

  @impl true
  def after_update(
        %DatabaseDataMarkedInSync{
          database_id: database_id
        },
        _,
        _
      ) do
    TrentoWeb.Endpoint.broadcast(
      @databases_topic,
      "database_stale_changed",
      DatabaseJSON.database_stale_changed(%{
        database: %{
          id: database_id,
          stale_at: nil
        }
      })
    )
  end

  @impl true
  def after_update(_, _, _), do: :ok

  defp update_health_details(repo, database_id, health_details_attrs) do
    case repo.get(DatabaseReadModel, database_id) do
      nil ->
        {:ok, nil}

      %DatabaseReadModel{} = database ->
        changeset =
          DatabaseReadModel.changeset(database, %{
            health_details: health_details_attrs
          })

        if changeset.changes != %{} do
          {:ok, updated_database} = repo.update(changeset)
          {:ok, updated_database.health_details}
        else
          {:ok, nil}
        end
    end
  end

  defp compute_instances_health(repo, database_id) do
    instance_statuses =
      repo.all(
        from(di in DatabaseInstanceReadModel,
          where: di.database_id == ^database_id,
          select: %{status: di.status}
        )
      )

    HealthService.compute_instances_health(instance_statuses)
  end

  defp update_instances_health_details(repo, database_id) do
    instances_health = compute_instances_health(repo, database_id)

    update_health_details(repo, database_id, %{
      instances_health: %{value: instances_health}
    })
  end

  defp maybe_broadcast_health_details_changed(database_id, %{
         health_details: %DatabaseHealthDetails{} = health_details
       }) do
    TrentoWeb.Endpoint.broadcast(
      @databases_topic,
      "database_health_details_changed",
      DatabaseJSON.database_health_details_changed(%{
        id: database_id,
        health_details: health_details
      })
    )
  end

  defp maybe_broadcast_health_details_changed(_, _), do: :ok
end
