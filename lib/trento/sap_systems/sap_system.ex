defmodule Trento.SapSystems.SapSystem do
  @moduledoc """
  The SAP system aggregate manages all the domain logic related to
  deployed SAP systems, which is composed by the application layer.

  In order to have a fully registered SAP system, the database aggregate containing
  this application tenant and application must be registered in the database aggregate.
  The minimum set of application features is ABAP and MESSAGESERVER. Otherwise, a complete SAP system cannot exist.
  This means that a SAP system aggregate state can have multiple application instances.

  ## SAP instance

  A SAP instance can be seen as a single SAP workload installation running in a
  particular host. So the instance runs entirely in one host, but on the other hand
  multiple different SAP instances might be running in the same host.

  For example, a ABAP and MESSAGESERVER applications.

  ## SAP system registration process

  The SAP system registration process has some caveats, so let's see them in more details.

  As a main concept, the SAP system is uniquely identified by the database ID plus application tenant.
  This means that there cannot exist any SAP system without a database, so Trento agents must be running
  in those hosts in order to start the registration.

  That being said, this is the logical order of events in order to register a full system:

  1. A database aggregate containing the tenant for this application must be already registered (check the database aggregate).
  2. When a SAP system discovery with a new application instance is received, and the database associated to
     this application exists:
      - Instances that are not MESSAGESERVER or ABAP will be added without completing a SAP system registration
      - To have a fully registered SAP system, a MESSAGESERVER instance and one ABAP instance are required
  3. New application instances/updates coming from already registered application instances are registered/applied.

  Find additional information about the application association in `Trento.SapSystems.Commands.RegisterApplicationInstance`.
  """

  require Trento.SapSystems.Enums.EnsaVersion, as: EnsaVersion
  require Trento.Enums.Health, as: Health

  alias Commanded.Aggregate.Multi

  alias Trento.SapSystems.{
    Instance,
    SapSystem
  }

  alias Trento.SapSystems.Commands.{
    DeregisterApplicationInstance,
    DeregisterSapSystem,
    MarkApplicationInstanceAbsent,
    RegisterApplicationInstance,
    RestoreSapSystem,
    RollUpSapSystem,
    UpdateDatabaseHealth
  }

  alias Trento.SapSystems.Events.{
    ApplicationInstanceDeregistered,
    ApplicationInstanceHealthChanged,
    ApplicationInstanceMarkedAbsent,
    ApplicationInstanceMarkedPresent,
    ApplicationInstanceMoved,
    ApplicationInstanceRegistered,
    SapSystemDatabaseHealthChanged,
    SapSystemDeregistered,
    SapSystemHealthChanged,
    SapSystemRegistered,
    SapSystemRestored,
    SapSystemRolledUp,
    SapSystemRollUpRequested,
    SapSystemTombstoned,
    SapSystemUpdated
  }

  alias Trento.Services.HealthService

  @required_fields []

  use Trento.Support.Type

  deftype do
    field :sap_system_id, Ecto.UUID
    field :sid, :string, default: nil
    field :health, Ecto.Enum, values: Health.values()
    field :database_health, Ecto.Enum, values: Health.values()
    field :tenant, :string
    field :ensa_version, Ecto.Enum, values: EnsaVersion.values(), default: EnsaVersion.no_ensa()
    field :rolling_up, :boolean, default: false
    field :deregistered_at, :utc_datetime_usec, default: nil

    embeds_many :instances, Instance
  end

  # Stop everything during the rollup process
  def execute(%SapSystem{rolling_up: true}, _), do: {:error, :sap_system_rolling_up}

  # Restore sap system
  # Same registration rules
  def execute(
        %SapSystem{deregistered_at: deregistered_at} = sap_system,
        %RegisterApplicationInstance{} = instance
      )
      when not is_nil(deregistered_at) do
    sap_system
    |> Multi.new()
    |> Multi.execute(fn sap_system ->
      maybe_emit_application_instance_registered_or_moved_event(
        sap_system,
        instance
      )
    end)
    |> Multi.execute(fn sap_system ->
      maybe_emit_application_instance_marked_present_event(sap_system, instance)
    end)
    |> Multi.execute(fn sap_system ->
      maybe_emit_sap_system_restored_event(sap_system, instance)
    end)
    |> Multi.execute(&maybe_emit_sap_system_health_changed_event/1)
  end

  # SAP system not registered, application already present
  # If the instance is not one of MESSAGESERVER or ABAP we discard.
  # Otherwise if the instance we want register together with already present instances
  # have one MESSAGESERVER and one ABAP, we register the instance and the SAP system
  # OR
  # When a RegisterApplicationInstance command is received by an existing SAP System aggregate,
  # the SAP System aggregate registers the Application instance if it is not already registered
  # and updates the health when needed.
  def execute(
        %SapSystem{} = sap_system,
        %RegisterApplicationInstance{} = instance
      ) do
    sap_system
    |> Multi.new()
    |> Multi.execute(fn sap_system ->
      maybe_emit_application_instance_registered_or_moved_event(
        sap_system,
        instance
      )
    end)
    |> Multi.execute(fn _ ->
      maybe_emit_application_instance_marked_present_event(sap_system, instance)
    end)
    |> Multi.execute(fn sap_system ->
      maybe_emit_application_instance_health_changed_event(
        sap_system,
        instance
      )
    end)
    |> Multi.execute(fn sap_system ->
      maybe_emit_sap_system_registered_or_updated_event(sap_system, instance)
    end)
    |> Multi.execute(&maybe_emit_sap_system_health_changed_event/1)
  end

  def execute(
        %SapSystem{sap_system_id: nil},
        _
      ) do
    {:error, :sap_system_not_registered}
  end

  def execute(
        %SapSystem{sap_system_id: sap_system_id, instances: instances},
        %MarkApplicationInstanceAbsent{
          instance_number: instance_number,
          host_id: host_id,
          absent_at: absent_at
        }
      ) do
    case get_instance(instances, host_id, instance_number) do
      %Instance{absent_at: nil} ->
        %ApplicationInstanceMarkedAbsent{
          instance_number: instance_number,
          host_id: host_id,
          sap_system_id: sap_system_id,
          absent_at: absent_at
        }

      _ ->
        nil
    end
  end

  # Deregister an application instance and emit a ApplicationInstanceDeregistered
  # also emit SapSystemDeregistered event if this was the last application instance
  def execute(
        %SapSystem{
          sap_system_id: sap_system_id
        } = sap_system,
        %DeregisterApplicationInstance{
          sap_system_id: sap_system_id,
          deregistered_at: deregistered_at
        } = instance
      ) do
    sap_system
    |> Multi.new()
    |> Multi.execute(fn _ ->
      maybe_emit_application_instance_deregistered_event(sap_system, instance)
    end)
    |> Multi.execute(fn sap_system ->
      maybe_emit_sap_system_deregistered_event(
        sap_system,
        deregistered_at
      )
    end)
    |> Multi.execute(&maybe_emit_sap_system_tombstoned_event/1)
  end

  def execute(
        %SapSystem{sap_system_id: sap_system_id} = snapshot,
        %RollUpSapSystem{}
      ) do
    %SapSystemRollUpRequested{
      sap_system_id: sap_system_id,
      snapshot: snapshot
    }
  end

  def execute(
        %SapSystem{sap_system_id: sap_system_id, deregistered_at: nil},
        %DeregisterSapSystem{deregistered_at: deregistered_at}
      ) do
    %SapSystemDeregistered{sap_system_id: sap_system_id, deregistered_at: deregistered_at}
  end

  def execute(
        %SapSystem{deregistered_at: nil},
        %RestoreSapSystem{}
      ),
      do: nil

  def execute(
        %SapSystem{} = sap_system,
        %RestoreSapSystem{} = restore_command
      ) do
    sap_system
    |> Multi.new()
    |> Multi.execute(fn sap_system ->
      maybe_emit_sap_system_restored_event(sap_system, restore_command)
    end)
    |> Multi.execute(&maybe_emit_sap_system_health_changed_event/1)
  end

  def execute(
        %SapSystem{database_health: database_health},
        %UpdateDatabaseHealth{database_health: database_health}
      ) do
    nil
  end

  def execute(
        %SapSystem{sap_system_id: sap_system_id} = sap_system,
        %UpdateDatabaseHealth{database_health: database_health}
      ) do
    sap_system
    |> Multi.new()
    |> Multi.execute(fn _ ->
      %SapSystemDatabaseHealthChanged{
        sap_system_id: sap_system_id,
        database_health: database_health
      }
    end)
    |> Multi.execute(&maybe_emit_sap_system_health_changed_event/1)
  end

  def execute(
        %SapSystem{deregistered_at: deregistered_at},
        _
      )
      when not is_nil(deregistered_at) do
    {:error, :sap_system_not_registered}
  end

  def apply(
        %SapSystem{instances: []} = sap_system,
        %ApplicationInstanceRegistered{
          sap_system_id: sap_system_id,
          sid: sid,
          tenant: tenant,
          instance_number: instance_number,
          features: features,
          host_id: host_id,
          health: health
        }
      ) do
    %SapSystem{
      sap_system
      | sap_system_id: sap_system_id,
        tenant: tenant,
        instances: [
          %Instance{
            sid: sid,
            instance_number: instance_number,
            features: features,
            host_id: host_id,
            health: health,
            absent_at: nil
          }
        ]
    }
  end

  def apply(
        %SapSystem{tenant: tenant, instances: instances} = sap_system,
        %ApplicationInstanceRegistered{
          sid: sid,
          tenant: new_tenant,
          instance_number: instance_number,
          features: features,
          host_id: host_id,
          health: health
        }
      ) do
    instances = [
      %Instance{
        sid: sid,
        instance_number: instance_number,
        features: features,
        host_id: host_id,
        health: health,
        absent_at: nil
      }
      | instances
    ]

    %SapSystem{sap_system | tenant: tenant || new_tenant, instances: instances}
  end

  def apply(
        %SapSystem{instances: instances} = sap_system,
        %ApplicationInstanceMoved{
          instance_number: instance_number,
          old_host_id: old_host_id,
          new_host_id: new_host_id
        }
      ) do
    instances =
      Enum.map(instances, fn
        %Instance{
          instance_number: ^instance_number,
          host_id: ^old_host_id
        } = instance ->
          %Instance{instance | host_id: new_host_id}

        instance ->
          instance
      end)

    %SapSystem{sap_system | instances: instances}
  end

  def apply(
        %SapSystem{instances: instances} = sap_system,
        %ApplicationInstanceHealthChanged{
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

    %SapSystem{sap_system | instances: instances}
  end

  # Update tenant field on SapSystemRegistered for old scenarios
  # where the tenant was not stored in the aggregate
  def apply(%SapSystem{} = sap_system, %SapSystemRegistered{
        sap_system_id: sap_system_id,
        sid: sid,
        tenant: tenant,
        health: health,
        database_health: database_health,
        ensa_version: ensa_version
      }) do
    %SapSystem{
      sap_system
      | sap_system_id: sap_system_id,
        sid: sid,
        tenant: tenant,
        health: health,
        database_health: database_health,
        ensa_version: ensa_version
    }
  end

  def apply(%SapSystem{} = sap_system, %SapSystemHealthChanged{health: health}) do
    %SapSystem{
      sap_system
      | health: health
    }
  end

  def apply(%SapSystem{} = sap_system, %SapSystemDatabaseHealthChanged{
        database_health: database_health
      }) do
    %SapSystem{
      sap_system
      | database_health: database_health
    }
  end

  def apply(%SapSystem{} = sap_system, %SapSystemUpdated{
        ensa_version: ensa_version
      }) do
    %SapSystem{
      sap_system
      | ensa_version: ensa_version
    }
  end

  # Aggregate to rolling up state
  def apply(%SapSystem{} = sap_system, %SapSystemRollUpRequested{}) do
    %SapSystem{sap_system | rolling_up: true}
  end

  # Hydrate the aggregate with a rollup snapshot after rollup ends
  def apply(%SapSystem{}, %SapSystemRolledUp{
        snapshot: snapshot
      }) do
    snapshot
  end

  def apply(
        %SapSystem{instances: instances} = sap_system,
        %ApplicationInstanceMarkedPresent{
          instance_number: instance_number,
          host_id: host_id
        }
      ) do
    instances = update_instance(instances, instance_number, host_id, %{absent_at: nil})

    %SapSystem{sap_system | instances: instances}
  end

  def apply(
        %SapSystem{instances: instances} = sap_system,
        %ApplicationInstanceMarkedAbsent{
          instance_number: instance_number,
          host_id: host_id,
          absent_at: absent_at
        }
      ) do
    instances = update_instance(instances, instance_number, host_id, %{absent_at: absent_at})

    %SapSystem{sap_system | instances: instances}
  end

  def apply(
        %SapSystem{instances: instances} = sap_system,
        %ApplicationInstanceDeregistered{instance_number: instance_number, host_id: host_id}
      ) do
    instances =
      Enum.reject(instances, fn
        %Instance{instance_number: ^instance_number, host_id: ^host_id} ->
          true

        _ ->
          false
      end)

    %SapSystem{sap_system | instances: instances}
  end

  def apply(
        %SapSystem{} = sap_system,
        %SapSystemDeregistered{
          deregistered_at: deregistered_at
        }
      ) do
    %SapSystem{
      sap_system
      | deregistered_at: deregistered_at
    }
  end

  def apply(%SapSystem{} = sap_system, %SapSystemRestored{
        health: health,
        database_health: database_health
      }) do
    %SapSystem{
      sap_system
      | health: health,
        database_health: database_health,
        deregistered_at: nil
    }
  end

  def apply(%SapSystem{} = sap_system, %SapSystemTombstoned{}), do: sap_system

  defp maybe_emit_application_instance_registered_or_moved_event(
         %SapSystem{instances: []},
         %RegisterApplicationInstance{
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
           health: health
         }
       ) do
    %ApplicationInstanceRegistered{
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
      health: health
    }
  end

  defp maybe_emit_application_instance_registered_or_moved_event(
         %SapSystem{instances: instances},
         %RegisterApplicationInstance{
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
           health: health,
           clustered: clustered
         }
       ) do
    moving_instance =
      Enum.find(instances, fn instance ->
        instance.instance_number == instance_number and instance.features == features and
          instance.host_id != host_id
      end)

    instance_in_same_host? =
      Enum.any?(instances, fn instance ->
        instance.instance_number == instance_number and instance.features == features and
          instance.host_id == host_id
      end)

    cond do
      instance_in_same_host? ->
        nil

      clustered and moving_instance != nil ->
        %ApplicationInstanceMoved{
          sap_system_id: sap_system_id,
          instance_number: instance_number,
          old_host_id: moving_instance.host_id,
          new_host_id: host_id
        }

      true ->
        %ApplicationInstanceRegistered{
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
          health: health
        }
    end
  end

  defp maybe_emit_application_instance_marked_present_event(
         %SapSystem{
           sap_system_id: sap_system_id,
           instances: instances
         },
         %RegisterApplicationInstance{
           instance_number: instance_number,
           host_id: host_id
         }
       ) do
    case get_instance(instances, host_id, instance_number) do
      %Instance{absent_at: nil} ->
        nil

      %Instance{} ->
        %ApplicationInstanceMarkedPresent{
          instance_number: instance_number,
          host_id: host_id,
          sap_system_id: sap_system_id
        }

      _ ->
        nil
    end
  end

  defp maybe_emit_application_instance_marked_present_event(_, _), do: nil

  defp maybe_emit_application_instance_health_changed_event(
         %SapSystem{instances: instances},
         %RegisterApplicationInstance{
           sap_system_id: sap_system_id,
           instance_number: instance_number,
           host_id: host_id,
           health: health
         }
       ) do
    instance = get_instance(instances, host_id, instance_number)

    if instance && instance.health != health do
      %ApplicationInstanceHealthChanged{
        sap_system_id: sap_system_id,
        host_id: host_id,
        instance_number: instance_number,
        health: health
      }
    end
  end

  # Restore a SAP system when the all the requires instances are registered
  defp maybe_emit_sap_system_restored_event(
         %SapSystem{tenant: tenant, instances: instances},
         %RegisterApplicationInstance{
           sap_system_id: sap_system_id,
           db_host: db_host,
           health: health,
           database_health: database_health
         }
       ) do
    if instances_have_abap_or_java?(instances) and instances_have_messageserver?(instances) do
      %SapSystemRestored{
        db_host: db_host,
        health: health,
        sap_system_id: sap_system_id,
        tenant: tenant,
        database_health: database_health
      }
    end
  end

  # Restore a SAP system when the restore command is received, check for the required instances
  defp maybe_emit_sap_system_restored_event(
         %SapSystem{instances: instances, health: health},
         %RestoreSapSystem{
           sap_system_id: sap_system_id,
           db_host: db_host,
           tenant: tenant,
           database_health: database_health
         }
       ) do
    if instances_have_abap_or_java?(instances) and instances_have_messageserver?(instances) do
      %SapSystemRestored{
        health: health,
        db_host: db_host,
        tenant: tenant,
        sap_system_id: sap_system_id,
        database_health: database_health
      }
    end
  end

  defp maybe_emit_sap_system_registered_or_updated_event(
         %SapSystem{sid: nil, tenant: tenant, instances: instances},
         %RegisterApplicationInstance{
           sap_system_id: sap_system_id,
           sid: sid,
           db_host: db_host,
           health: health,
           ensa_version: ensa_version,
           database_id: database_id,
           database_health: database_health
         }
       ) do
    if instances_have_abap_or_java?(instances) and instances_have_messageserver?(instances) do
      %SapSystemRegistered{
        sap_system_id: sap_system_id,
        sid: sid,
        tenant: tenant,
        db_host: db_host,
        health: health,
        ensa_version: ensa_version,
        database_id: database_id,
        database_health: database_health
      }
    end
  end

  # Values didn't update
  defp maybe_emit_sap_system_registered_or_updated_event(
         %SapSystem{ensa_version: ensa_version},
         %RegisterApplicationInstance{
           ensa_version: ensa_version
         }
       ),
       do: nil

  # Don't update if ensa_version is no_ensa, as this means that the coming app is not
  # message or enqueue replicator type
  defp maybe_emit_sap_system_registered_or_updated_event(
         %SapSystem{},
         %RegisterApplicationInstance{
           ensa_version: :no_ensa
         }
       ),
       do: nil

  defp maybe_emit_sap_system_registered_or_updated_event(
         %SapSystem{},
         %RegisterApplicationInstance{
           sap_system_id: sap_system_id,
           ensa_version: ensa_version
         }
       ),
       do: %SapSystemUpdated{sap_system_id: sap_system_id, ensa_version: ensa_version}

  # Do not emit health changed event as the SAP system is not completely registered yet
  defp maybe_emit_sap_system_health_changed_event(%SapSystem{instances: []}), do: nil
  defp maybe_emit_sap_system_health_changed_event(%SapSystem{sid: nil}), do: nil

  # Returns a SapSystemHealthChanged event when the aggregated health of the application instances
  # and database is different from the previous SAP system health.
  defp maybe_emit_sap_system_health_changed_event(%SapSystem{
         sap_system_id: sap_system_id,
         health: health,
         database_health: database_health,
         instances: instances
       }) do
    new_health =
      instances
      |> Enum.map(& &1.health)
      |> Kernel.++([database_health])
      |> HealthService.compute_aggregated_health()

    if new_health != health do
      %SapSystemHealthChanged{
        sap_system_id: sap_system_id,
        health: new_health
      }
    end
  end

  defp maybe_emit_application_instance_deregistered_event(
         %SapSystem{instances: []},
         %DeregisterApplicationInstance{}
       ),
       do: {:error, :application_instance_not_registered}

  defp maybe_emit_application_instance_deregistered_event(
         %SapSystem{instances: instances},
         %DeregisterApplicationInstance{
           sap_system_id: sap_system_id,
           host_id: host_id,
           instance_number: instance_number,
           deregistered_at: deregistered_at
         }
       ) do
    case get_instance(instances, host_id, instance_number) do
      nil ->
        {:error, :application_instance_not_registered}

      _ ->
        %ApplicationInstanceDeregistered{
          sap_system_id: sap_system_id,
          instance_number: instance_number,
          host_id: host_id,
          deregistered_at: deregistered_at
        }
    end
  end

  defp maybe_emit_sap_system_deregistered_event(
         %SapSystem{sid: nil},
         _deregistered_at
       ),
       do: []

  defp maybe_emit_sap_system_deregistered_event(
         %SapSystem{
           sap_system_id: sap_system_id,
           deregistered_at: nil,
           instances: instances
         },
         deregistered_at
       ) do
    unless instances_have_abap_or_java?(instances) and instances_have_messageserver?(instances) do
      %SapSystemDeregistered{sap_system_id: sap_system_id, deregistered_at: deregistered_at}
    end
  end

  defp maybe_emit_sap_system_deregistered_event(_, _), do: nil

  defp maybe_emit_sap_system_tombstoned_event(%SapSystem{
         sap_system_id: sap_system_id,
         instances: []
       }) do
    %SapSystemTombstoned{sap_system_id: sap_system_id}
  end

  defp maybe_emit_sap_system_tombstoned_event(_), do: nil

  defp instances_have_abap?(instances) do
    Enum.any?(instances, fn %{features: features} -> features =~ "ABAP" end)
  end

  defp instances_have_java?(instances) do
    Enum.any?(instances, fn %{features: features} -> features =~ "J2EE" end)
  end

  defp instances_have_abap_or_java?(instances) do
    instances_have_abap?(instances) or instances_have_java?(instances)
  end

  def instances_have_messageserver?(instances) do
    Enum.any?(instances, fn %{features: features} -> features =~ "MESSAGESERVER" end)
  end

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
