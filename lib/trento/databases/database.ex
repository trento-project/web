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
    RegisterDatabaseInstance
  }

  alias Trento.SapSystems.Events.{
    DatabaseDeregistered,
    DatabaseHealthChanged,
    DatabaseInstanceDeregistered,
    DatabaseInstanceHealthChanged,
    DatabaseInstanceMarkedAbsent,
    DatabaseInstanceMarkedPresent,
    DatabaseInstanceRegistered,
    DatabaseInstanceSystemReplicationChanged,
    DatabaseRegistered,
    DatabaseRestored
  }

  alias Trento.Services.HealthService

  @required_fields []

  use Trento.Support.Type

  deftype do
    field :database_id, Ecto.UUID
    field :sid, :string, default: nil
    field :health, Ecto.Enum, values: Health.values()
    field :deregistered_at, :utc_datetime_usec, default: nil

    embeds_many :instances, Instance
  end

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
          tenant: tenant,
          host_id: host_id,
          instance_number: instance_number,
          instance_hostname: instance_hostname,
          features: features,
          http_port: http_port,
          https_port: https_port,
          start_priority: start_priority,
          system_replication: system_replication,
          system_replication_status: system_replication_status,
          health: health
        }
      ) do
    [
      %DatabaseRegistered{
        sap_system_id: database_id,
        sid: sid,
        health: health
      },
      %DatabaseInstanceRegistered{
        sap_system_id: database_id,
        sid: sid,
        tenant: tenant,
        instance_number: instance_number,
        instance_hostname: instance_hostname,
        features: features,
        http_port: http_port,
        https_port: https_port,
        start_priority: start_priority,
        host_id: host_id,
        system_replication: system_replication,
        system_replication_status: system_replication_status,
        health: health
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
        %Database{deregistered_at: deregistered_at},
        %RegisterDatabaseInstance{
          database_id: database_id,
          sid: sid,
          tenant: tenant,
          host_id: host_id,
          instance_number: instance_number,
          instance_hostname: instance_hostname,
          features: features,
          http_port: http_port,
          https_port: https_port,
          start_priority: start_priority,
          system_replication: system_replication,
          system_replication_status: system_replication_status,
          health: health
        }
      )
      when not is_nil(deregistered_at) do
    [
      %DatabaseInstanceRegistered{
        sap_system_id: database_id,
        sid: sid,
        tenant: tenant,
        instance_number: instance_number,
        instance_hostname: instance_hostname,
        features: features,
        http_port: http_port,
        https_port: https_port,
        start_priority: start_priority,
        host_id: host_id,
        system_replication: system_replication,
        system_replication_status: system_replication_status,
        health: health
      },
      %DatabaseRestored{
        sap_system_id: database_id,
        health: health
      }
    ]
  end

  # When a RegisterDatabaseInstance command is received by an existing database aggregate,
  # the database aggregate registers the Database instance if it is not already registered
  # and updates the health when needed.
  def execute(
        %Database{instances: instances} = database,
        %RegisterDatabaseInstance{host_id: host_id, instance_number: instance_number} = command
      ) do
    instance = get_instance(instances, host_id, instance_number)

    database
    |> Multi.new()
    |> Multi.execute(fn _ ->
      maybe_emit_database_instance_system_replication_changed_event(instance, command)
    end)
    |> Multi.execute(fn _ ->
      maybe_emit_database_instance_health_changed_event(instance, command)
    end)
    |> Multi.execute(fn _ ->
      maybe_emit_database_instance_registered_event(instance, command)
    end)
    |> Multi.execute(fn _ ->
      maybe_emit_database_instance_marked_present_event(instance, command)
    end)
    |> Multi.execute(&maybe_emit_database_health_changed_event/1)
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
          sap_system_id: database_id,
          absent_at: absent_at
        }

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
    |> Multi.execute(fn database ->
      maybe_emit_database_deregistered_event(database, deregistered_at)
    end)
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
          sap_system_id: database_id,
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
          instance_number: instance_number,
          features: features,
          host_id: host_id,
          health: health
        }
      ) do
    instances = [
      %Instance{
        sid: sid,
        system_replication: system_replication,
        system_replication_status: system_replication_status,
        instance_number: instance_number,
        features: features,
        host_id: host_id,
        health: health,
        absent_at: nil
      }
      | instances
    ]

    %Database{database | instances: instances}
  end

  def apply(
        %Database{instances: instances} = database,
        %DatabaseInstanceSystemReplicationChanged{
          host_id: host_id,
          instance_number: instance_number,
          system_replication: system_replication,
          system_replication_status: system_replication_status
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
                system_replication_status: system_replication_status
            }

          instance ->
            instance
        end
      )

    %Database{database | instances: instances}
  end

  def apply(
        %Database{instances: instances} = database,
        %DatabaseInstanceHealthChanged{
          host_id: host_id,
          instance_number: instance_number,
          health: health
        }
      ) do
    instances =
      Enum.map(
        instances,
        fn
          %Instance{host_id: ^host_id, instance_number: ^instance_number} = instance ->
            %Instance{instance | health: health}

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

  defp maybe_emit_database_instance_registered_event(
         nil,
         %RegisterDatabaseInstance{
           database_id: database_id,
           sid: sid,
           tenant: tenant,
           instance_number: instance_number,
           instance_hostname: instance_hostname,
           features: features,
           http_port: http_port,
           https_port: https_port,
           start_priority: start_priority,
           host_id: host_id,
           system_replication: system_replication,
           system_replication_status: system_replication_status,
           health: health
         }
       ) do
    %DatabaseInstanceRegistered{
      sap_system_id: database_id,
      sid: sid,
      tenant: tenant,
      instance_number: instance_number,
      instance_hostname: instance_hostname,
      features: features,
      http_port: http_port,
      https_port: https_port,
      start_priority: start_priority,
      host_id: host_id,
      system_replication: system_replication,
      system_replication_status: system_replication_status,
      health: health
    }
  end

  defp maybe_emit_database_instance_registered_event(_, _), do: nil

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
      sap_system_id: database_id
    }
  end

  defp maybe_emit_database_instance_marked_present_event(_, _), do: nil

  defp maybe_emit_database_instance_system_replication_changed_event(
         %Instance{
           system_replication: system_replication,
           system_replication_status: system_replication_status
         },
         %RegisterDatabaseInstance{
           database_id: database_id,
           host_id: host_id,
           instance_number: instance_number,
           system_replication: new_system_replication,
           system_replication_status: new_system_replication_status
         }
       )
       when system_replication != new_system_replication or
              system_replication_status != new_system_replication_status do
    %DatabaseInstanceSystemReplicationChanged{
      sap_system_id: database_id,
      host_id: host_id,
      instance_number: instance_number,
      system_replication: new_system_replication,
      system_replication_status: new_system_replication_status
    }
  end

  defp maybe_emit_database_instance_system_replication_changed_event(_, _), do: nil

  defp maybe_emit_database_instance_health_changed_event(
         %Instance{
           health: health
         },
         %RegisterDatabaseInstance{
           database_id: database_id,
           host_id: host_id,
           instance_number: instance_number,
           health: new_health
         }
       )
       when health != new_health do
    %DatabaseInstanceHealthChanged{
      sap_system_id: database_id,
      host_id: host_id,
      instance_number: instance_number,
      health: new_health
    }
  end

  defp maybe_emit_database_instance_health_changed_event(_, _), do: nil

  # Returns a DatabaseHealthChanged event if the newly computed aggregated health of all the instances
  # is different from the previous Database health.
  defp maybe_emit_database_health_changed_event(%Database{
         database_id: database_id,
         instances: instances,
         health: health
       }) do
    new_health =
      instances
      |> Enum.map(& &1.health)
      |> HealthService.compute_aggregated_health()

    if new_health != health do
      %DatabaseHealthChanged{
        sap_system_id: database_id,
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
          sap_system_id: database_id,
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
    %DatabaseDeregistered{sap_system_id: database_id, deregistered_at: deregistered_at}
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
        sap_system_id: database_id,
        deregistered_at: deregistered_at
      }
    end
  end

  defp maybe_emit_database_deregistered_event(_, _), do: nil

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
