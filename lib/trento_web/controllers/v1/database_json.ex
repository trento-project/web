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
        |> add_system_replication_status_to_secondary_instance

  def database_instance(%{instance: %{database_id: database_id} = instance}),
    do:
      instance
      |> Map.from_struct()
      # keep backward compatibility
      |> Map.put(:sap_system_id, database_id)
      |> Map.delete(:__meta__)
      |> Map.delete(:host)

  def database_instance_with_sr_status(%{
        instance: instance,
        database_instances: database_instances
      }),
      do:
        %{instance: instance}
        |> database_instance()
        |> add_system_replication_status(database_instances)

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
          system_replication_status: system_replication_status
        }
      }),
      do: %{
        database_id: database_id,
        host_id: host_id,
        instance_number: instance_number,
        system_replication: system_replication,
        system_replication_status: system_replication_status
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

  def add_system_replication_status_to_secondary_instance(
        %{database_instances: database_instances} = sap_system
      ) do
    system_replication_status = get_system_replication_status(database_instances)

    database_instances =
      Enum.map(
        database_instances,
        &map_system_replication_status_to_secondary(&1, system_replication_status)
      )

    Map.put(sap_system, :database_instances, database_instances)
  end

  defp add_system_replication_status(instance, database_instances) do
    system_replication_status = get_system_replication_status(database_instances)
    map_system_replication_status_to_secondary(instance, system_replication_status)
  end

  defp get_system_replication_status(database_instances) do
    Enum.find_value(database_instances, fn
      %{
        system_replication: "Primary",
        system_replication_status: system_replication_status
      } ->
        system_replication_status

      _ ->
        false
    end)
  end

  defp map_system_replication_status_to_secondary(
         %{system_replication: "Secondary"} = instance,
         system_replication_status
       ),
       do: %{instance | system_replication_status: system_replication_status}

  defp map_system_replication_status_to_secondary(%{system_replication: "Primary"} = instance, _),
    do: %{instance | system_replication_status: ""}

  defp map_system_replication_status_to_secondary(instance, _), do: instance
end
