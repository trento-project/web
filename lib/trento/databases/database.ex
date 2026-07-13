# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Databases.Database do
  @moduledoc """
  The database aggregate manages all the domain logic related to
  deployed HANA database.

  In order to have a fully registered database one of the next two conditions must exist:
  - A HANA instance without system replication is discovered
  - A HANA instance running as primary system replication instance is discovered

  Once any of these conditions are met the Database is registered and all the events related
  to it are available now.
  """

  require Trento.Enums.Health, as: Health

  alias Commanded.Aggregate.Multi

  alias Trento.Databases.Database

  alias Trento.SapSystems.Instance

  alias Trento.Databases.Commands.{
    DeregisterDatabaseInstance,
    MarkDatabaseInstanceAbsent,
    MarkDatabaseInstanceDataStale,
    RegisterDatabaseInstance,
    RollUpDatabase
  }

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
    DatabaseRolledUp,
    DatabaseRollUpRequested,
    DatabaseTenantsUpdated,
    DatabaseTombstoned
  }

  alias Trento.Databases.ValueObjects.Tenant
  alias Trento.SapSystems.Services.HealthService, as: SapSystemsHealthService
  alias Trento.Services.HealthService

  alias Trento.SapSystems.Events, as: SapSystemEvents

  @required_fields []

  @legacy_events [
    SapSystemEvents.ApplicationInstanceDeregistered,
    SapSystemEvents.ApplicationInstanceStatusChanged,
    SapSystemEvents.ApplicationInstanceMarkedAbsent,
    SapSystemEvents.ApplicationInstanceMarkedPresent,
    SapSystemEvents.ApplicationInstanceMoved,
    SapSystemEvents.ApplicationInstanceRegistered,
    SapSystemEvents.SapSystemDeregistered,
    SapSystemEvents.SapSystemHealthChanged,
    SapSystemEvents.SapSystemRegistered,
    SapSystemEvents.SapSystemRestored,
    SapSystemEvents.SapSystemUpdated,
    SapSystemEvents.SapSystemRollUpRequested,
    SapSystemEvents.SapSystemRolledUp,
    SapSystemEvents.SapSystemTombstoned
  ]

  use Trento.Support.Type

  deftype do
    field :database_id, Ecto.UUID
    field :sid, :string, default: nil
    field :health, Ecto.Enum, values: Health.values()
    field :rolling_up, :boolean, default: false
    field :stale_at, :utc_datetime_usec
    field :deregistered_at, :utc_datetime_usec, default: nil

    embeds_many :instances, Instance
    embeds_many :tenants, Tenant
  end

  # Stop everything during the rollup process
  def execute(%Database{rolling_up: true}, _), do: {:error, :database_rolling_up}

  def execute(
        %Database{database_id: nil},
        %RegisterDatabaseInstance{
          system_replication: "Secondary"
        }
      ),
      do: {:error, :database_not_registered}

  # First time that a Database instance is registered, the Database starts its registration process.
  # Database instances are accepted when the system replication is disabled or when enabled, only if the database
  # has a primary role
  def execute(
        %Database{database_id: nil},
        %RegisterDatabaseInstance{
          database_id: database_id,
          sid: sid,
          tenants: tenants,
          host_id: host_id,
          instance_number: instance_number,
          instance_hostname: instance_hostname,
          features: features,
          http_port: http_port,
          https_port: https_port,
          start_priority: start_priority,
          system_replication: system_replication,
          system_replication_status: system_replication_status,
          system_replication_site: system_replication_site,
          system_replication_site_id: system_replication_site_id,
          system_replication_mode: system_replication_mode,
          system_replication_operation_mode: system_replication_operation_mode,
          system_replication_source_site: system_replication_source_site,
          system_replication_tier: system_replication_tier,
          status: status
        }
      ) do
    [
      %DatabaseRegistered{
        database_id: database_id,
        sid: sid,
        health: SapSystemsHealthService.derive_health_from_status(status)
      },
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
      %DatabaseTenantsUpdated{
        database_id: database_id,
        tenants: tenants,
        previous_tenants: []
      }
    ]
  end

  # Database restore
  def execute(
        %Database{deregistered_at: deregistered_at},
        %RegisterDatabaseInstance{
          system_replication: "Secondary"
        }
      )
      when not is_nil(deregistered_at),
      do: {:error, :database_not_registered}

  # When a deregistered database is present, we add the new database instance
  # and restore the database, the conditions are the same as registration
  def execute(
        %Database{deregistered_at: deregistered_at} = database,
        %RegisterDatabaseInstance{
          database_id: database_id,
          sid: sid,
          host_id: host_id,
          instance_number: instance_number,
          instance_hostname: instance_hostname,
          features: features,
          http_port: http_port,
          https_port: https_port,
          start_priority: start_priority,
          system_replication: system_replication,
          system_replication_status: system_replication_status,
          system_replication_site: system_replication_site,
          system_replication_site_id: system_replication_site_id,
          system_replication_mode: system_replication_mode,
          system_replication_operation_mode: system_replication_operation_mode,
          system_replication_source_site: system_replication_source_site,
          system_replication_tier: system_replication_tier,
          status: status,
          tenants: tenants
        }
      )
      when not is_nil(deregistered_at) do
    database
    |> Multi.new()
    |> Multi.execute(fn _ ->
      [
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
        %DatabaseRestored{
          database_id: database_id,
          health: SapSystemsHealthService.derive_health_from_status(status)
        }
      ]
    end)
    |> Multi.execute(fn database ->
      maybe_emit_database_tenants_updated_event(database, tenants)
    end)
  end

  # When a RegisterDatabaseInstance command is received by an existing database aggregate,
  # the database aggregate registers the Database instance if it is not already registered
  # and updates the health when needed.
  def execute(
        %Database{instances: instances} = database,
        %RegisterDatabaseInstance{
          host_id: host_id,
          instance_number: instance_number,
          tenants: tenants
        } = command
      ) do
    instance = get_instance(instances, host_id, instance_number)

    database
    |> Multi.new()
    |> Multi.execute(fn _ ->
      maybe_emit_database_instance_system_replication_changed_event(instance, command)
    end)
    |> Multi.execute(fn _ ->
      maybe_emit_database_instance_status_changed_event(instance, command)
    end)
    |> Multi.execute(fn _ ->
      maybe_emit_database_instance_registered_event(instance, command)
    end)
    |> Multi.execute(fn _ ->
      maybe_emit_database_instance_marked_present_event(instance, command)
    end)
    |> Multi.execute(fn _ ->
      maybe_emit_database_instance_data_marked_in_sync_event(instance, command)
    end)
    |> Multi.execute(&maybe_emit_database_data_marked_in_sync_event/1)
    |> Multi.execute(&maybe_emit_database_health_changed_event/1)
    |> Multi.execute(fn database ->
      maybe_emit_database_tenants_updated_event(database, tenants)
    end)
  end

  def execute(
        %Database{database_id: nil},
        _
      ) do
    {:error, :database_not_registered}
  end

  def execute(
        %Database{database_id: database_id, instances: instances},
        %MarkDatabaseInstanceAbsent{
          instance_number: instance_number,
          host_id: host_id,
          absent_at: absent_at
        }
      ) do
    case get_instance(instances, host_id, instance_number) do
      %Instance{absent_at: nil} ->
        %DatabaseInstanceMarkedAbsent{
          instance_number: instance_number,
          host_id: host_id,
          database_id: database_id,
          absent_at: absent_at
        }

      _ ->
        nil
    end
  end

  def execute(
        %Database{database_id: database_id, instances: instances} = database,
        %MarkDatabaseInstanceDataStale{
          instance_number: instance_number,
          host_id: host_id,
          stale_at: stale_at
        }
      ) do
    case get_instance(instances, host_id, instance_number) do
      %Instance{stale_at: nil} ->
        [
          %DatabaseInstanceDataMarkedStale{
            database_id: database_id,
            instance_number: instance_number,
            host_id: host_id,
            stale_at: stale_at
          }
        ] ++ maybe_emit_database_data_marked_stale_event(database, stale_at)

      _ ->
        nil
    end
  end

  # Deregister a database instance and emit a DatabaseInstanceDeregistered
  # also potentially emit DatabaseDeregistered events
  def execute(
        %Database{database_id: database_id} = database,
        %DeregisterDatabaseInstance{
          database_id: database_id,
          deregistered_at: deregistered_at
        } = instance
      ) do
    database
    |> Multi.new()
    |> Multi.execute(fn _ ->
      maybe_emit_database_instance_deregistered_event(database, instance)
    end)
    |> Multi.execute(&maybe_emit_database_data_marked_in_sync_event/1)
    |> Multi.execute(fn database ->
      maybe_emit_database_deregistered_event(database, deregistered_at)
    end)
    |> Multi.execute(&maybe_emit_database_tombstoned_event/1)
  end

  def execute(
        %Database{database_id: database_id} = snapshot,
        %RollUpDatabase{}
      ) do
    %DatabaseRollUpRequested{
      database_id: database_id,
      snapshot: snapshot
    }
  end

  def execute(
        %Database{deregistered_at: deregistered_at},
        _
      )
      when not is_nil(deregistered_at) do
    {:error, :database_not_registered}
  end

  def apply(
        %Database{database_id: nil},
        %DatabaseRegistered{
          database_id: database_id,
          sid: sid,
          health: health
        }
      ) do
    %Database{
      database_id: database_id,
      sid: sid,
      health: health
    }
  end

  def apply(
        %Database{instances: instances} = database,
        %DatabaseInstanceRegistered{
          sid: sid,
          system_replication: system_replication,
          system_replication_status: system_replication_status,
          system_replication_site: system_replication_site,
          system_replication_site_id: system_replication_site_id,
          system_replication_mode: system_replication_mode,
          system_replication_operation_mode: system_replication_operation_mode,
          system_replication_source_site: system_replication_source_site,
          system_replication_tier: system_replication_tier,
          instance_number: instance_number,
          features: features,
          host_id: host_id,
          status: status
        }
      ) do
    instances = [
      %Instance{
        sid: sid,
        system_replication: system_replication,
        system_replication_status: system_replication_status,
        system_replication_site: system_replication_site,
        system_replication_site_id: system_replication_site_id,
        system_replication_mode: system_replication_mode,
        system_replication_operation_mode: system_replication_operation_mode,
        system_replication_source_site: system_replication_source_site,
        system_replication_tier: system_replication_tier,
        instance_number: instance_number,
        features: features,
        host_id: host_id,
        status: status,
        absent_at: nil,
        stale_at: nil
      }
      | instances
    ]

    %Database{database | instances: instances}
  end

  def apply(%Database{} = database, %DatabaseTenantsUpdated{tenants: tenants}) do
    %Database{database | tenants: tenants}
  end

  def apply(
        %Database{instances: instances} = database,
        %DatabaseInstanceSystemReplicationChanged{
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
      ) do
    instances =
      Enum.map(
        instances,
        fn
          %Instance{host_id: ^host_id, instance_number: ^instance_number} = instance ->
            %Instance{
              instance
              | system_replication: system_replication,
                system_replication_status: system_replication_status,
                system_replication_site: system_replication_site,
                system_replication_site_id: system_replication_site_id,
                system_replication_mode: system_replication_mode,
                system_replication_operation_mode: system_replication_operation_mode,
                system_replication_source_site: system_replication_source_site,
                system_replication_tier: system_replication_tier
            }

          instance ->
            instance
        end
      )

    %Database{database | instances: instances}
  end

  def apply(
        %Database{instances: instances} = database,
        %DatabaseInstanceStatusChanged{
          host_id: host_id,
          instance_number: instance_number,
          status: status
        }
      ) do
    instances =
      Enum.map(
        instances,
        fn
          %Instance{host_id: ^host_id, instance_number: ^instance_number} = instance ->
            %Instance{instance | status: status}

          instance ->
            instance
        end
      )

    %Database{database | instances: instances}
  end

  def apply(%Database{} = database, %DatabaseHealthChanged{
        health: health
      }) do
    %Database{database | health: health}
  end

  def apply(
        %Database{instances: instances} = database,
        %DatabaseInstanceMarkedPresent{
          instance_number: instance_number,
          host_id: host_id
        }
      ) do
    instances = update_instance(instances, instance_number, host_id, %{absent_at: nil})

    %Database{database | instances: instances}
  end

  def apply(
        %Database{instances: instances} = database,
        %DatabaseInstanceMarkedAbsent{
          instance_number: instance_number,
          host_id: host_id,
          absent_at: absent_at
        }
      ) do
    instances = update_instance(instances, instance_number, host_id, %{absent_at: absent_at})

    %Database{database | instances: instances}
  end

  def apply(
        %Database{instances: instances} = database,
        %DatabaseInstanceDataMarkedInSync{
          instance_number: instance_number,
          host_id: host_id
        }
      ) do
    instances = update_instance(instances, instance_number, host_id, %{stale_at: nil})

    %Database{database | instances: instances}
  end

  def apply(
        %Database{instances: instances} = database,
        %DatabaseInstanceDataMarkedStale{
          instance_number: instance_number,
          host_id: host_id,
          stale_at: stale_at
        }
      ) do
    instances = update_instance(instances, instance_number, host_id, %{stale_at: stale_at})

    %Database{database | instances: instances}
  end

  def apply(
        %Database{instances: instances} = database,
        %DatabaseInstanceDeregistered{
          instance_number: instance_number,
          host_id: host_id
        }
      ) do
    instances =
      Enum.reject(instances, fn
        %Instance{instance_number: ^instance_number, host_id: ^host_id} ->
          true

        _ ->
          false
      end)

    %Database{database | instances: instances}
  end

  def apply(
        %Database{} = database,
        %DatabaseDeregistered{deregistered_at: deregistered_at}
      ) do
    %Database{database | deregistered_at: deregistered_at}
  end

  def apply(
        %Database{} = database,
        %DatabaseRestored{
          health: health
        }
      ) do
    %Database{
      database
      | health: health,
        deregistered_at: nil
    }
  end

  def apply(
        %Database{} = database,
        %DatabaseDataMarkedStale{stale_at: stale_at}
      ) do
    %Database{database | stale_at: stale_at}
  end

  def apply(%Database{} = database, %DatabaseDataMarkedInSync{}) do
    %Database{database | stale_at: nil}
  end

  # Aggregate to rolling up state
  def apply(%Database{} = database, %DatabaseRollUpRequested{}) do
    %Database{database | rolling_up: true}
  end

  # Hydrate the aggregate with a rollup snapshot after rollup ends
  def apply(%Database{}, %DatabaseRolledUp{
        snapshot: snapshot
      }) do
    snapshot
  end

  def apply(%Database{} = database, %DatabaseTombstoned{}), do: database

  # Handle legacy events
  def apply(database, %legacy_event{}) when legacy_event in @legacy_events, do: database

  defp maybe_emit_database_instance_registered_event(
         nil,
         %RegisterDatabaseInstance{
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
         }
       ) do
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
    }
  end

  defp maybe_emit_database_instance_registered_event(_, _), do: nil

  defp maybe_emit_database_tenants_updated_event(
         %Database{database_id: database_id, tenants: current_tenants},
         new_tenants
       ) do
    sorted_current_tenants = Enum.sort_by(current_tenants, & &1.name)
    sorted_new_tenants = Enum.sort_by(new_tenants, & &1.name)

    if sorted_current_tenants != sorted_new_tenants do
      %DatabaseTenantsUpdated{
        database_id: database_id,
        tenants: new_tenants,
        previous_tenants: current_tenants
      }
    end
  end

  defp maybe_emit_database_instance_marked_present_event(
         %Instance{absent_at: nil},
         %RegisterDatabaseInstance{}
       ),
       do: nil

  defp maybe_emit_database_instance_marked_present_event(
         %Instance{
           instance_number: instance_number,
           host_id: host_id
         },
         %RegisterDatabaseInstance{database_id: database_id}
       ) do
    %DatabaseInstanceMarkedPresent{
      instance_number: instance_number,
      host_id: host_id,
      database_id: database_id
    }
  end

  defp maybe_emit_database_instance_marked_present_event(_, _), do: nil

  defp maybe_emit_database_instance_data_marked_in_sync_event(
         %Instance{stale_at: stale_at},
         %RegisterDatabaseInstance{
           database_id: database_id,
           instance_number: instance_number,
           host_id: host_id
         }
       )
       when not is_nil(stale_at) do
    %DatabaseInstanceDataMarkedInSync{
      database_id: database_id,
      instance_number: instance_number,
      host_id: host_id
    }
  end

  defp maybe_emit_database_instance_data_marked_in_sync_event(_, _), do: nil

  defp maybe_emit_database_data_marked_stale_event(
         %Database{
           database_id: database_id,
           stale_at: nil
         },
         stale_at
       ) do
    [
      %DatabaseDataMarkedStale{
        database_id: database_id,
        stale_at: stale_at
      }
    ]
  end

  defp maybe_emit_database_data_marked_stale_event(_, _), do: []

  defp maybe_emit_database_data_marked_in_sync_event(%Database{stale_at: nil}), do: nil

  defp maybe_emit_database_data_marked_in_sync_event(%Database{
         database_id: database_id,
         instances: instances
       }) do
    all_in_sync? = Enum.all?(instances, fn %{stale_at: stale_at} -> is_nil(stale_at) end)

    if all_in_sync? do
      %DatabaseDataMarkedInSync{
        database_id: database_id
      }
    end
  end

  defp maybe_emit_database_instance_system_replication_changed_event(nil, _), do: nil

  defp maybe_emit_database_instance_system_replication_changed_event(
         %Instance{
           system_replication: system_replication,
           system_replication_status: system_replication_status,
           system_replication_site: system_replication_site,
           system_replication_site_id: system_replication_site_id,
           system_replication_mode: system_replication_mode,
           system_replication_operation_mode: system_replication_operation_mode,
           system_replication_source_site: system_replication_source_site,
           system_replication_tier: system_replication_tier
         },
         %RegisterDatabaseInstance{
           system_replication: system_replication,
           system_replication_status: system_replication_status,
           system_replication_site: system_replication_site,
           system_replication_site_id: system_replication_site_id,
           system_replication_mode: system_replication_mode,
           system_replication_operation_mode: system_replication_operation_mode,
           system_replication_source_site: system_replication_source_site,
           system_replication_tier: system_replication_tier
         }
       ),
       do: nil

  defp maybe_emit_database_instance_system_replication_changed_event(_, %RegisterDatabaseInstance{
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
       }) do
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
    }
  end

  defp maybe_emit_database_instance_status_changed_event(
         %Instance{
           status: status
         },
         %RegisterDatabaseInstance{
           database_id: database_id,
           host_id: host_id,
           instance_number: instance_number,
           status: new_status
         }
       )
       when status != new_status do
    %DatabaseInstanceStatusChanged{
      database_id: database_id,
      host_id: host_id,
      instance_number: instance_number,
      status: new_status
    }
  end

  defp maybe_emit_database_instance_status_changed_event(_, _), do: nil

  # Returns a DatabaseHealthChanged event if the newly computed aggregated health of all the instances
  # is different from the previous Database health.
  defp maybe_emit_database_health_changed_event(%Database{
         database_id: database_id,
         instances: instances,
         health: health
       }) do
    new_health =
      instances
      |> Enum.map(fn %{status: status} ->
        SapSystemsHealthService.derive_health_from_status(status)
      end)
      |> HealthService.compute_aggregated_health()

    if new_health != health do
      %DatabaseHealthChanged{
        database_id: database_id,
        health: new_health
      }
    end
  end

  defp maybe_emit_database_instance_deregistered_event(
         %Database{instances: []},
         %DeregisterDatabaseInstance{}
       ),
       do: {:error, :database_instance_not_registered}

  defp maybe_emit_database_instance_deregistered_event(
         %Database{instances: instances},
         %DeregisterDatabaseInstance{
           database_id: database_id,
           host_id: host_id,
           instance_number: instance_number,
           deregistered_at: deregistered_at
         }
       ) do
    case get_instance(instances, host_id, instance_number) do
      nil ->
        {:error, :database_instance_not_registered}

      _ ->
        %DatabaseInstanceDeregistered{
          database_id: database_id,
          instance_number: instance_number,
          host_id: host_id,
          deregistered_at: deregistered_at
        }
    end
  end

  defp maybe_emit_database_deregistered_event(
         %Database{
           database_id: database_id,
           deregistered_at: nil,
           instances: []
         },
         deregistered_at
       ) do
    %DatabaseDeregistered{database_id: database_id, deregistered_at: deregistered_at}
  end

  defp maybe_emit_database_deregistered_event(
         %Database{
           database_id: database_id,
           instances: instances,
           deregistered_at: nil
         },
         deregistered_at
       ) do
    has_primary? =
      Enum.any?(instances, fn %{system_replication: system_replication} ->
        system_replication == "Primary"
      end)

    has_secondary? =
      Enum.any?(instances, fn %{system_replication: system_replication} ->
        system_replication == "Secondary"
      end)

    if has_secondary? and !has_primary? do
      %DatabaseDeregistered{
        database_id: database_id,
        deregistered_at: deregistered_at
      }
    end
  end

  defp maybe_emit_database_deregistered_event(_, _), do: nil

  defp maybe_emit_database_tombstoned_event(%Database{database_id: database_id, instances: []}) do
    %DatabaseTombstoned{database_id: database_id}
  end

  defp maybe_emit_database_tombstoned_event(_), do: nil

  defp get_instance(instances, host_id, instance_number) do
    Enum.find(instances, fn
      %Instance{host_id: ^host_id, instance_number: ^instance_number} ->
        true

      _ ->
        false
    end)
  end

  defp update_instance(instances, instance_number, host_id, fields) do
    Enum.map(
      instances,
      fn
        %Instance{instance_number: ^instance_number, host_id: ^host_id} = instance ->
          Kernel.struct(instance, fields)

        instance ->
          instance
      end
    )
  end
end
