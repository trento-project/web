defmodule Trento.Databases.Database do
  alias Commanded.Aggregate.Multi
  alias Trento.Services.HealthService

  alias Trento.SapSystems.Commands.{
    DeregisterApplicationInstance,
    DeregisterDatabaseInstance,
    MarkApplicationInstanceAbsent,
    MarkDatabaseInstanceAbsent,
    RegisterApplicationInstance,
    RegisterDatabaseInstance,
    RollUpSapSystem
  }

  alias Trento.SapSystems.Events.{
    ApplicationInstanceDeregistered,
    ApplicationInstanceHealthChanged,
    ApplicationInstanceMarkedAbsent,
    ApplicationInstanceMarkedPresent,
    ApplicationInstanceMoved,
    ApplicationInstanceRegistered,
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
    SapSystemDeregistered,
    SapSystemHealthChanged,
    SapSystemRegistered,
    SapSystemRestored,
    SapSystemRolledUp,
    SapSystemRollUpRequested,
    SapSystemTombstoned,
    SapSystemUpdated
  }

  require Trento.Enums.Health, as: Health

  alias Trento.SapSystems.Instance

  alias Trento.Databases.Database

  @required_fields []

  use Trento.Support.Type

  deftype do
    field :sid, :string
    embeds_many :instances, Instance
    field :deregistered_at, :utc_datetime_usec
    field :health, Ecto.Enum, values: Health.values()
  end

  ## Execute

  def execute(
        %Database{sid: nil},
        %RegisterDatabaseInstance{
          system_replication: "Secondary"
        }
      ),
      do: {:error, :sap_system_not_registered}

  # First time that a Database instance is registered, the SAP System starts its registration process.
  # Database instances are accepted when the system replication is disabled or when enabled, only if the database
  # has a primary role
  # When an Application is discovered, the SAP System completes the registration process.
  def execute(
        %Database{sid: nil},
        %RegisterDatabaseInstance{
          sap_system_id: sap_system_id,
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
        sap_system_id: sap_system_id,
        sid: sid,
        health: health
      },
      %DatabaseInstanceRegistered{
        sap_system_id: sap_system_id,
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
      do: {:error, :sap_system_not_registered}

  # When a deregistered database is present, we add the new database instance
  # and restore the database, the conditions are the same as registration
  def execute(
        %Database{deregistered_at: deregistered_at},
        %RegisterDatabaseInstance{
          sap_system_id: sap_system_id,
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
        sap_system_id: sap_system_id,
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
        sap_system_id: sap_system_id,
        health: health
      }
    ]
  end

  # When a RegisterDatabaseInstance command is received by an existing SAP System aggregate,
  # the SAP System aggregate registers the Database instance if it is not already registered
  # and updates the health when needed.
  def execute(
        %Database{instances: instances} = sap_system,
        %RegisterDatabaseInstance{host_id: host_id, instance_number: instance_number} = command
      ) do
    instance = get_instance(instances, host_id, instance_number)

    sap_system
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
    # |> Multi.execute(&maybe_emit_sap_system_health_changed_event/1) #TODO INVESTIGATE
  end

  def execute(
        %Database{instances: instances, sid: sid},
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
          sap_system_id: sid,
          absent_at: absent_at
        }

      _ ->
        nil
    end
  end

  # Deregister a database instance and emit a DatabaseInstanceDeregistered
  # also potentially emit SapSystemDeregistered and DatabaseDeregistered events
  def execute(
        %Database{sid: sap_system_id} = sap_system,
        %DeregisterDatabaseInstance{
          sap_system_id: sap_system_id,
          deregistered_at: deregistered_at
        } = instance
      ) do
    sap_system
    |> Multi.new()
    |> Multi.execute(fn _ ->
      maybe_emit_database_instance_deregistered_event(sap_system, instance)
    end)
    |> Multi.execute(fn sap_system ->
      maybe_emit_database_deregistered_event(sap_system, deregistered_at)
    end)
    # |> Multi.execute(fn sap_system ->
    #   maybe_emit_sap_system_deregistered_event(sap_system, deregistered_at)
    # end) #INVESTIGATE
    # |> Multi.execute(&maybe_emit_sap_system_tombstoned_event/1)
  end

  # Deregister an application instance and emit a ApplicationInstanceDeregistered
  # also emit SapSystemDeregistered event if this was the last application instance
  def execute(
        %Database{
          sid: sap_system_id
        } = sap_system,
        %DeregisterApplicationInstance{
          sap_system_id: sap_system_id,
          deregistered_at: deregistered_at
        } = instance
      ) do
    sap_system
    |> Multi.new()
    # |> Multi.execute(fn _ ->
    #   maybe_emit_application_instance_deregistered_event(sap_system, instance)
    # end)
    # |> Multi.execute(fn sap_system ->
    #   maybe_emit_sap_system_deregistered_event(
    #     sap_system,
    #     deregistered_at
    #   )
    # end) #INVESTIGATE
    # |> Multi.execute(&maybe_emit_sap_system_tombstoned_event/1)
  end

  ## Apply

  def apply(
        %Database{sid: nil},
        %DatabaseRegistered{
          sap_system_id: sap_system_id,
          sid: sid,
          health: health
        }
      ) do
    %Database{
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

    %Database{
      database
      | instances: instances
    }
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

    %Database{
      database
      | instances: instances
    }
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

    %Database{
      database
      | instances: instances
    }
  end

  def apply(%Database{} = database, %DatabaseHealthChanged{
        health: health
      }) do
    %Database{
      database
      | health: health
    }
  end

  def apply(
        %Database{instances: instances} = database,
        %DatabaseInstanceMarkedPresent{
          instance_number: instance_number,
          host_id: host_id
        }
      ) do
    instances = update_instance(instances, instance_number, host_id, %{absent_at: nil})

    %Database{
      database
      | instances: instances
    }
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

    %Database{
      database
      | instances: instances
    }
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

    %Database{
      database
      | instances: instances
    }
  end

  def apply(
        %Database{} = database,
        %DatabaseDeregistered{deregistered_at: deregistered_at}
      ) do
    %Database{
      database
      | deregistered_at: deregistered_at
    }
  end

  def apply(
        %Database{} = database,
        %DatabaseRestored{
          health: health
        }
      ) do
    %Database{
      database
      | deregistered_at: nil,
        health: health
    }
  end

  ## Funzioni private

  defp maybe_emit_database_instance_registered_event(
         nil,
         %RegisterDatabaseInstance{
           sap_system_id: sap_system_id,
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
      sap_system_id: sap_system_id,
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
         %RegisterDatabaseInstance{sap_system_id: sap_system_id}
       ) do
    %DatabaseInstanceMarkedPresent{
      instance_number: instance_number,
      host_id: host_id,
      sap_system_id: sap_system_id
    }
  end

  defp maybe_emit_database_instance_marked_present_event(_, _), do: nil

  defp maybe_emit_database_instance_system_replication_changed_event(
         %Instance{
           system_replication: system_replication,
           system_replication_status: system_replication_status
         },
         %RegisterDatabaseInstance{
           sap_system_id: sap_system_id,
           host_id: host_id,
           instance_number: instance_number,
           system_replication: new_system_replication,
           system_replication_status: new_system_replication_status
         }
       )
       when system_replication != new_system_replication or
              system_replication_status != new_system_replication_status do
    %DatabaseInstanceSystemReplicationChanged{
      sap_system_id: sap_system_id,
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
           sap_system_id: sap_system_id,
           host_id: host_id,
           instance_number: instance_number,
           health: new_health
         }
       )
       when health != new_health do
    %DatabaseInstanceHealthChanged{
      sap_system_id: sap_system_id,
      host_id: host_id,
      instance_number: instance_number,
      health: new_health
    }
  end

  defp maybe_emit_database_instance_health_changed_event(_, _), do: nil

  # Returns a DatabaseHealthChanged event if the newly computed aggregated health of all the instances
  # is different from the previous Database health.
  defp maybe_emit_database_health_changed_event(%Database{
         instances: instances,
         health: health,
         sid: sid
       }) do
    new_health =
      instances
      |> Enum.map(& &1.health)
      |> HealthService.compute_aggregated_health()

    if new_health != health do
      %DatabaseHealthChanged{
        sap_system_id: sid,
        health: new_health
      }
    end
  end

  defp maybe_emit_database_instance_deregistered_event(
         %Database{sid: nil},
         %DeregisterDatabaseInstance{}
       ),
       do: {:error, :database_instance_not_registered}

  defp maybe_emit_database_instance_deregistered_event(
         %Database{instances: []},
         %DeregisterDatabaseInstance{}
       ),
       do: {:error, :database_instance_not_registered}

  defp maybe_emit_database_instance_deregistered_event(
         %Database{instances: instances},
         %DeregisterDatabaseInstance{
           sap_system_id: sap_system_id,
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
          sap_system_id: sap_system_id,
          instance_number: instance_number,
          host_id: host_id,
          deregistered_at: deregistered_at
        }
    end
  end

  defp maybe_emit_database_deregistered_event(
         %Database{
           deregistered_at: nil,
           instances: [],
           sid: sid
         },
         deregistered_at
       ) do
    %DatabaseDeregistered{sap_system_id: sid, deregistered_at: deregistered_at}
  end

  defp maybe_emit_database_deregistered_event(
         %Database{
           instances: instances,
           deregistered_at: nil,
           sid: sid
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
        sap_system_id: sid,
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
