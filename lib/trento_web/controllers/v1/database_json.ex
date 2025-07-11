defmodule TrentoWeb.V1.DatabaseJSON do
  def databases(%{databases: databases}), do: Enum.map(databases, &database(%{database: &1}))

  def database(%{
        database:
          %{
            database_instances: database_instances
          } = database
      }),
      do:
        database
        |> Map.from_struct()
        |> Map.delete(:__meta__)
        |> Map.delete(:deregistered_at)
        |> Map.delete(:sap_systems)
        |> Map.delete(:tenants)
        |> Map.put(
          :database_instances,
          Enum.map(database_instances, &database_instance(%{instance: &1}))
        )

  def database_instance(%{instance: %{database_id: database_id} = instance}),
    do:
      instance
      |> Map.from_struct()
      # keep backward compatibility
      |> Map.put(:sap_system_id, database_id)
      |> Map.delete(:__meta__)
      |> Map.delete(:host)

  def database_registered(%{database: database}) do
    database
    |> Map.from_struct()
    |> Map.delete(:__meta__)
    |> Map.delete(:tags)
    |> Map.delete(:database_instances)
    |> Map.delete(:sap_systems)
  end

  def database_tenant(%{tenant: tenant}) do
    tenant
    |> Map.from_struct()
    |> Map.delete(:__meta__)
  end

  def database_restored(%{database: database}) do
    database(%{database: database})
  end

  def database_health_changed(%{health: health}), do: health

  def database_instance_health_changed(%{
        instance: %{
          database_id: database_id,
          host_id: host_id,
          instance_number: instance_number,
          health: health
        }
      }),
      do: %{
        database_id: database_id,
        host_id: host_id,
        instance_number: instance_number,
        health: health
      }

  def database_instance_system_replication_changed(%{
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
      }),
      do: %{
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

  def database_deregistered(%{id: id, sid: sid}), do: %{id: id, sid: sid}

  def database_instance_deregistered(%{
        database_id: id,
        instance_number: instance_number,
        host_id: host_id,
        sid: sid
      }),
      do: %{database_id: id, instance_number: instance_number, host_id: host_id, sid: sid}

  def database_instance_absent_at_changed(%{
        instance: %{
          instance_number: instance_number,
          host_id: host_id,
          database_id: database_id,
          sid: sid,
          absent_at: absent_at
        }
      }),
      do: %{
        instance_number: instance_number,
        host_id: host_id,
        database_id: database_id,
        sid: sid,
        absent_at: absent_at
      }

  def database_tenants_updated(%{tenants: tenants, database_id: database_id}) do
    rendered_tenants = Enum.map(tenants, &database_tenant(%{tenant: &1}))

    %{
      tenants: rendered_tenants,
      database_id: database_id
    }
  end
end
