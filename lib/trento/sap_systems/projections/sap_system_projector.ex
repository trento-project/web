defmodule Trento.SapSystems.Projections.SapSystemProjector do
  @moduledoc """
  SAP System projector
  """

  use Commanded.Projections.Ecto,
    application: Trento.Commanded,
    repo: Trento.Repo,
    name: "sap_system_projector"

  alias Trento.SapSystems.Events.{
    ApplicationInstanceDeregistered,
    ApplicationInstanceHealthChanged,
    ApplicationInstanceMarkedAbsent,
    ApplicationInstanceMarkedPresent,
    ApplicationInstanceMoved,
    ApplicationInstanceRegistered,
    SapSystemDeregistered,
    SapSystemHealthChanged,
    SapSystemRegistered,
    SapSystemRestored,
    SapSystemUpdated
  }

  alias TrentoWeb.V1.SapSystemJSON

  alias Trento.SapSystems.Projections.{
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
      ensa_version: ensa_version,
      database_id: database_id
    },
    fn multi ->
      changeset =
        SapSystemReadModel.changeset(%SapSystemReadModel{}, %{
          id: sap_system_id,
          sid: sid,
          tenant: tenant,
          db_host: db_host,
          health: health,
          ensa_version: ensa_version,
          database_id: database_id
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
        SapSystemReadModel
        |> Repo.get!(sap_system_id)
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
    %ApplicationInstanceHealthChanged{
      sap_system_id: sap_system_id,
      host_id: host_id,
      instance_number: instance_number,
      health: health
    },
    fn multi ->
      changeset =
        ApplicationInstanceReadModel
        |> Repo.get_by(
          sap_system_id: sap_system_id,
          instance_number: instance_number,
          host_id: host_id
        )
        |> ApplicationInstanceReadModel.changeset(%{health: health})

      Ecto.Multi.update(multi, :application_instance, changeset)
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
      health: health
    },
    fn multi ->
      changeset =
        SapSystemReadModel
        |> Repo.get!(sap_system_id)
        |> SapSystemReadModel.changeset(%{
          tenant: tenant,
          db_host: db_host,
          health: health,
          deregistered_at: nil
        })

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
        %ApplicationInstanceRegistered{},
        _,
        %{application_instance: %ApplicationInstanceReadModel{} = instance}
      ) do
    TrentoWeb.Endpoint.broadcast(
      @sap_systems_topic,
      "application_instance_registered",
      SapSystemJSON.application_instance(%{instance: instance})
    )
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
      SapSystemJSON.application_instance_health_changed(%{
        health: %{
          sap_system_id: sap_system_id,
          host_id: host_id,
          instance_number: instance_number,
          health: health
        }
      })
    )
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
        %ApplicationInstanceDeregistered{
          instance_number: instance_number,
          host_id: host_id,
          sap_system_id: sap_system_id
        },
        _,
        %{
          application_instance: %ApplicationInstanceReadModel{sid: sid}
        }
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
  def after_update(_, _, _), do: :ok
end
