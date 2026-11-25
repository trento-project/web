# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.SapSystems.Projections.SapSystemProjector do
  @moduledoc """
  SAP System projector
  """

  use Commanded.Projections.Ecto,
    application: Trento.Commanded,
    repo: Trento.Repo,
    name: "sap_system_projector"

  alias Trento.SapSystems.Events.{
    ApplicationInstanceDataMarkedInSync,
    ApplicationInstanceDataMarkedStale,
    ApplicationInstanceDeregistered,
    ApplicationInstanceMarkedAbsent,
    ApplicationInstanceMarkedPresent,
    ApplicationInstanceMoved,
    ApplicationInstanceRegistered,
    ApplicationInstanceStatusChanged,
    SapSystemDatabaseHealthChanged,
    SapSystemDataMarkedInSync,
    SapSystemDataMarkedStale,
    SapSystemDeregistered,
    SapSystemHealthChanged,
    SapSystemRegistered,
    SapSystemRestored,
    SapSystemUpdated
  }

  alias TrentoWeb.V1.SapSystemJSON

  alias Trento.SapSystems.Projections.{
    ApplicationInstanceReadModel,
    SapSystemHealthDetails,
    SapSystemReadModel
  }

  alias Trento.Repo
  alias Trento.Services.HealthService

  import Ecto.Query

  project(
    %SapSystemRegistered{
      sap_system_id: sap_system_id,
      sid: sid,
      tenant: tenant,
      db_host: db_host,
      health: health,
      ensa_version: ensa_version,
      database_id: database_id,
      database_health: database_health
    },
    fn multi ->
      multi
      |> Ecto.Multi.run(:instances_health, fn repo, _changes ->
        {:ok, compute_instances_health(repo, sap_system_id)}
      end)
      |> Ecto.Multi.insert(:sap_system, fn %{instances_health: instances_health} ->
        SapSystemReadModel.changeset(%SapSystemReadModel{}, %{
          id: sap_system_id,
          sid: sid,
          tenant: tenant,
          db_host: db_host,
          health: health,
          health_details: %{
            instances_health: %{value: instances_health, reason: ""},
            database_health: %{value: database_health, reason: ""}
          },
          ensa_version: ensa_version,
          database_id: database_id
        })
      end)
    end
  )

  project(
    %SapSystemHealthChanged{
      sap_system_id: sap_system_id,
      health: health
    },
    fn multi ->
      changeset =
        SapSystemReadModel
        |> Repo.get!(sap_system_id)
        |> SapSystemReadModel.changeset(%{health: health})

      Ecto.Multi.update(multi, :sap_system, changeset)
    end
  )

  project(
    %SapSystemDatabaseHealthChanged{
      sap_system_id: sap_system_id,
      database_health: database_health
    },
    fn multi ->
      Ecto.Multi.run(multi, :health_details, fn repo, _changes ->
        update_health_details(repo, sap_system_id, %{
          database_health: %{value: database_health}
        })
      end)
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
      status: status
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
          status: status,
          stale_at: nil
        })

      multi
      |> Ecto.Multi.insert(:application_instance, changeset)
      |> Ecto.Multi.run(:health_details, fn repo, _changes ->
        update_instances_health_details(repo, sap_system_id)
      end)
    end
  )

  project(
    %ApplicationInstanceMoved{
      sap_system_id: sap_system_id,
      instance_number: instance_number,
      old_host_id: old_host_id,
      new_host_id: new_host_id
    },
    fn multi ->
      changeset =
        ApplicationInstanceReadModel
        |> Repo.get_by(
          sap_system_id: sap_system_id,
          instance_number: instance_number,
          host_id: old_host_id
        )
        |> ApplicationInstanceReadModel.changeset(%{host_id: new_host_id})

      Ecto.Multi.update(multi, :application_instance, changeset)
    end
  )

  project(
    %ApplicationInstanceStatusChanged{
      sap_system_id: sap_system_id,
      host_id: host_id,
      instance_number: instance_number,
      status: status
    },
    fn multi ->
      changeset =
        ApplicationInstanceReadModel
        |> Repo.get_by(
          sap_system_id: sap_system_id,
          instance_number: instance_number,
          host_id: host_id
        )
        |> ApplicationInstanceReadModel.changeset(%{status: status})

      multi
      |> Ecto.Multi.update(:application_instance, changeset)
      |> Ecto.Multi.run(:health_details, fn repo, _changes ->
        update_instances_health_details(repo, sap_system_id)
      end)
    end
  )

  project(
    %ApplicationInstanceMarkedAbsent{
      sap_system_id: sap_system_id,
      instance_number: instance_number,
      host_id: host_id,
      absent_at: absent_at
    },
    fn multi ->
      changeset =
        ApplicationInstanceReadModel
        |> Repo.get_by(
          sap_system_id: sap_system_id,
          instance_number: instance_number,
          host_id: host_id
        )
        |> ApplicationInstanceReadModel.changeset(%{
          absent_at: absent_at
        })

      Ecto.Multi.update(multi, :application_instance, changeset)
    end
  )

  project(
    %ApplicationInstanceMarkedPresent{
      sap_system_id: sap_system_id,
      instance_number: instance_number,
      host_id: host_id
    },
    fn multi ->
      changeset =
        ApplicationInstanceReadModel
        |> Repo.get_by(
          sap_system_id: sap_system_id,
          instance_number: instance_number,
          host_id: host_id
        )
        |> ApplicationInstanceReadModel.changeset(%{
          absent_at: nil
        })

      Ecto.Multi.update(multi, :application_instance, changeset)
    end
  )

  project(
    %ApplicationInstanceDataMarkedStale{
      sap_system_id: sap_system_id,
      instance_number: instance_number,
      host_id: host_id,
      stale_at: stale_at
    },
    fn multi ->
      changeset =
        ApplicationInstanceReadModel
        |> Repo.get_by(
          sap_system_id: sap_system_id,
          instance_number: instance_number,
          host_id: host_id
        )
        |> ApplicationInstanceReadModel.changeset(%{
          stale_at: stale_at
        })

      Ecto.Multi.update(multi, :application_instance, changeset)
    end
  )

  project(
    %ApplicationInstanceDataMarkedInSync{
      sap_system_id: sap_system_id,
      instance_number: instance_number,
      host_id: host_id
    },
    fn multi ->
      changeset =
        ApplicationInstanceReadModel
        |> Repo.get_by(
          sap_system_id: sap_system_id,
          instance_number: instance_number,
          host_id: host_id
        )
        |> ApplicationInstanceReadModel.changeset(%{
          stale_at: nil
        })

      Ecto.Multi.update(multi, :application_instance, changeset)
    end
  )

  project(
    %SapSystemDataMarkedStale{
      sap_system_id: sap_system_id,
      stale_at: stale_at
    },
    fn multi ->
      changeset =
        SapSystemReadModel
        |> Repo.get!(sap_system_id)
        |> SapSystemReadModel.changeset(%{stale_at: stale_at})

      Ecto.Multi.update(multi, :sap_system, changeset)
    end
  )

  project(
    %SapSystemDataMarkedInSync{
      sap_system_id: sap_system_id
    },
    fn multi ->
      changeset =
        SapSystemReadModel
        |> Repo.get!(sap_system_id)
        |> SapSystemReadModel.changeset(%{stale_at: nil})

      Ecto.Multi.update(multi, :sap_system, changeset)
    end
  )

  project(
    %SapSystemDeregistered{
      sap_system_id: sap_system_id,
      deregistered_at: deregistered_at
    },
    fn multi ->
      changeset =
        SapSystemReadModel
        |> Repo.get!(sap_system_id)
        |> SapSystemReadModel.changeset(%{deregistered_at: deregistered_at})

      Ecto.Multi.update(multi, :sap_system, changeset)
    end
  )

  project(
    %SapSystemRestored{
      sap_system_id: sap_system_id,
      tenant: tenant,
      db_host: db_host,
      health: health,
      database_health: database_health
    },
    fn multi ->
      multi
      |> Ecto.Multi.run(:instances_health, fn repo, _changes ->
        {:ok, compute_instances_health(repo, sap_system_id)}
      end)
      |> Ecto.Multi.update(:sap_system, fn %{instances_health: instances_health} ->
        SapSystemReadModel
        |> Repo.get!(sap_system_id)
        |> SapSystemReadModel.changeset(%{
          tenant: tenant,
          db_host: db_host,
          health: health,
          health_details: %{
            instances_health: %{value: instances_health, reason: ""},
            database_health: %{value: database_health, reason: ""}
          },
          deregistered_at: nil
        })
      end)
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

      multi
      |> Ecto.Multi.delete(:application_instance, deregistered_instance)
      |> Ecto.Multi.run(:health_details, fn repo, _changes ->
        update_instances_health_details(repo, sap_system_id)
      end)
    end
  )

  project(
    %SapSystemUpdated{
      sap_system_id: sap_system_id,
      ensa_version: ensa_version
    },
    fn multi ->
      changeset =
        SapSystemReadModel
        |> Repo.get!(sap_system_id)
        |> SapSystemReadModel.changeset(%{
          ensa_version: ensa_version
        })

      Ecto.Multi.update(multi, :sap_system, changeset)
    end
  )

  @sap_systems_topic "monitoring:sap_systems"

  @impl true
  @spec after_update(any, any, any) :: :ok | {:error, any}
  def after_update(
        %SapSystemRegistered{},
        _,
        %{sap_system: %SapSystemReadModel{} = sap_system}
      ) do
    enriched_sap_system =
      Repo.preload(sap_system, [:database])

    TrentoWeb.Endpoint.broadcast(
      @sap_systems_topic,
      "sap_system_registered",
      SapSystemJSON.sap_system_registered(%{sap_system: enriched_sap_system})
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
      SapSystemJSON.sap_system_health_changed(%{
        health: %{
          id: id,
          health: health
        }
      })
    )
  end

  @impl true
  def after_update(
        %SapSystemDatabaseHealthChanged{sap_system_id: sap_system_id},
        _,
        %{health_details: %SapSystemHealthDetails{} = health_details}
      ) do
    TrentoWeb.Endpoint.broadcast(
      @sap_systems_topic,
      "sap_system_health_details_changed",
      SapSystemJSON.sap_system_health_details_changed(%{
        id: sap_system_id,
        health_details: health_details
      })
    )
  end

  @impl true
  def after_update(
        %ApplicationInstanceRegistered{sap_system_id: sap_system_id},
        _,
        %{application_instance: %ApplicationInstanceReadModel{} = instance} = changes
      ) do
    TrentoWeb.Endpoint.broadcast(
      @sap_systems_topic,
      "application_instance_registered",
      SapSystemJSON.application_instance(%{instance: instance})
    )

    maybe_broadcast_health_details_changed(sap_system_id, changes)
  end

  @impl true
  def after_update(
        %ApplicationInstanceMoved{
          sap_system_id: sap_system_id,
          instance_number: instance_number,
          old_host_id: old_host_id,
          new_host_id: new_host_id
        },
        _,
        %{
          application_instance: %ApplicationInstanceReadModel{sid: sid}
        }
      ) do
    TrentoWeb.Endpoint.broadcast(
      @sap_systems_topic,
      "application_instance_moved",
      SapSystemJSON.application_instance_moved(%{
        instance_moved: %{
          sap_system_id: sap_system_id,
          instance_number: instance_number,
          old_host_id: old_host_id,
          new_host_id: new_host_id,
          sid: sid
        }
      })
    )
  end

  @impl true
  def after_update(
        %ApplicationInstanceStatusChanged{
          sap_system_id: sap_system_id,
          host_id: host_id,
          instance_number: instance_number,
          status: status
        },
        _,
        changes
      ) do
    TrentoWeb.Endpoint.broadcast(
      @sap_systems_topic,
      "application_instance_status_changed",
      SapSystemJSON.application_instance_status_changed(%{
        instance: %{
          sap_system_id: sap_system_id,
          host_id: host_id,
          instance_number: instance_number,
          status: status
        }
      })
    )

    maybe_broadcast_health_details_changed(sap_system_id, changes)
  end

  @impl true
  def after_update(
        %SapSystemDeregistered{sap_system_id: sap_system_id},
        _,
        %{sap_system: %SapSystemReadModel{sid: sid}}
      ) do
    TrentoWeb.Endpoint.broadcast(
      @sap_systems_topic,
      "sap_system_deregistered",
      SapSystemJSON.sap_system_deregistered(%{
        id: sap_system_id,
        sid: sid
      })
    )
  end

  @impl true
  def after_update(
        %SapSystemRestored{},
        _,
        %{sap_system: %SapSystemReadModel{} = sap_system}
      ) do
    enriched_sap_system =
      Repo.preload(sap_system, [:tags, :database, :database_instances, :application_instances])

    TrentoWeb.Endpoint.broadcast(
      @sap_systems_topic,
      "sap_system_restored",
      SapSystemJSON.sap_system_restored(%{sap_system: enriched_sap_system})
    )
  end

  @impl true
  def after_update(
        %ApplicationInstanceMarkedAbsent{
          instance_number: instance_number,
          host_id: host_id,
          sap_system_id: sap_system_id,
          absent_at: absent_at
        },
        _,
        %{application_instance: %ApplicationInstanceReadModel{sid: sid}}
      ) do
    TrentoWeb.Endpoint.broadcast(
      @sap_systems_topic,
      "application_instance_absent_at_changed",
      SapSystemJSON.application_instance_absent_at_changed(%{
        instance: %{
          instance_number: instance_number,
          host_id: host_id,
          sap_system_id: sap_system_id,
          sid: sid,
          absent_at: absent_at
        }
      })
    )
  end

  @impl true
  def after_update(
        %ApplicationInstanceMarkedPresent{
          instance_number: instance_number,
          host_id: host_id,
          sap_system_id: sap_system_id
        },
        _,
        %{application_instance: %ApplicationInstanceReadModel{sid: sid}}
      ) do
    TrentoWeb.Endpoint.broadcast(
      @sap_systems_topic,
      "application_instance_absent_at_changed",
      SapSystemJSON.application_instance_absent_at_changed(%{
        instance: %{
          instance_number: instance_number,
          host_id: host_id,
          sap_system_id: sap_system_id,
          sid: sid,
          absent_at: nil
        }
      })
    )
  end

  @impl true
  def after_update(
        %ApplicationInstanceDataMarkedStale{
          instance_number: instance_number,
          host_id: host_id,
          sap_system_id: sap_system_id,
          stale_at: stale_at
        },
        _,
        _
      ) do
    TrentoWeb.Endpoint.broadcast(
      @sap_systems_topic,
      "application_instance_stale_changed",
      SapSystemJSON.application_instance_stale_changed(%{
        instance: %{
          instance_number: instance_number,
          host_id: host_id,
          sap_system_id: sap_system_id,
          stale_at: stale_at
        }
      })
    )
  end

  @impl true
  def after_update(
        %ApplicationInstanceDataMarkedInSync{
          instance_number: instance_number,
          host_id: host_id,
          sap_system_id: sap_system_id
        },
        _,
        _
      ) do
    TrentoWeb.Endpoint.broadcast(
      @sap_systems_topic,
      "application_instance_stale_changed",
      SapSystemJSON.application_instance_stale_changed(%{
        instance: %{
          instance_number: instance_number,
          host_id: host_id,
          sap_system_id: sap_system_id,
          stale_at: nil
        }
      })
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
        %{
          application_instance: %ApplicationInstanceReadModel{sid: sid}
        } = changes
      ) do
    TrentoWeb.Endpoint.broadcast(
      @sap_systems_topic,
      "application_instance_deregistered",
      SapSystemJSON.application_instance_deregistered(%{
        sap_system_id: sap_system_id,
        instance_number: instance_number,
        host_id: host_id,
        sid: sid
      })
    )

    maybe_broadcast_health_details_changed(sap_system_id, changes)
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
      SapSystemJSON.sap_system_updated(%{id: sap_system_id, ensa_version: ensa_version})
    )
  end

  @impl true
  def after_update(
        %SapSystemDataMarkedStale{},
        _,
        %{sap_system: %SapSystemReadModel{} = sap_system}
      ) do
    TrentoWeb.Endpoint.broadcast(
      @sap_systems_topic,
      "sap_system_stale_changed",
      SapSystemJSON.sap_system_stale_changed(%{
        sap_system: sap_system
      })
    )
  end

  @impl true
  def after_update(
        %SapSystemDataMarkedInSync{},
        _,
        %{sap_system: %SapSystemReadModel{} = sap_system}
      ) do
    TrentoWeb.Endpoint.broadcast(
      @sap_systems_topic,
      "sap_system_stale_changed",
      SapSystemJSON.sap_system_stale_changed(%{
        sap_system: sap_system
      })
    )
  end

  @impl true
  def after_update(_, _, _), do: :ok

  defp update_health_details(repo, sap_system_id, health_details_attrs) do
    case repo.get(SapSystemReadModel, sap_system_id) do
      nil ->
        {:ok, nil}

      %SapSystemReadModel{} = sap_system ->
        changeset =
          SapSystemReadModel.changeset(sap_system, %{
            health_details: health_details_attrs
          })

        if changeset.changes != %{} do
          {:ok, updated_sap_system} = repo.update(changeset)
          {:ok, updated_sap_system.health_details}
        else
          {:ok, nil}
        end
    end
  end

  defp compute_instances_health(repo, sap_system_id) do
    instance_statuses =
      repo.all(
        from(ai in ApplicationInstanceReadModel,
          where: ai.sap_system_id == ^sap_system_id,
          select: %{status: ai.status}
        )
      )

    HealthService.compute_instances_health(instance_statuses)
  end

  defp update_instances_health_details(repo, sap_system_id) do
    instances_health = compute_instances_health(repo, sap_system_id)

    update_health_details(repo, sap_system_id, %{
      instances_health: %{value: instances_health}
    })
  end

  defp maybe_broadcast_health_details_changed(sap_system_id, %{
         health_details: %SapSystemHealthDetails{} = health_details
       }) do
    TrentoWeb.Endpoint.broadcast(
      @sap_systems_topic,
      "sap_system_health_details_changed",
      SapSystemJSON.sap_system_health_details_changed(%{
        id: sap_system_id,
        health_details: health_details
      })
    )
  end

  defp maybe_broadcast_health_details_changed(_, _), do: :ok
end
