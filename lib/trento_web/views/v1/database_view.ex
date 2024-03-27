defmodule TrentoWeb.V1.DatabaseView do
  use TrentoWeb, :view

  def render("databases.json", %{databases: databases}) do
    render_many(databases, __MODULE__, "database.json", as: :database)
  end

  def render("database.json", %{
        database:
          %{
            database_instances: database_instances
          } = database
      }) do
    rendered_database_instances =
      render_many(database_instances, __MODULE__, "database_instance.json", as: :instance)

    database
    |> Map.from_struct()
    |> Map.delete(:__meta__)
    |> Map.delete(:deregistered_at)
    |> Map.delete(:sap_systems)
    |> Map.put(:database_instances, rendered_database_instances)
    |> add_system_replication_status_to_secondary_instance
  end

  def render("database_instance.json", %{instance: %{database_id: database_id} = instance}) do
    instance
    |> Map.from_struct()
    # keep backward compatibility
    |> Map.put(:sap_system_id, database_id)
    |> Map.delete(:__meta__)
    |> Map.delete(:host)
  end

  def render("database_instance_with_sr_status.json", %{
        instance: instance,
        database_instances: database_instances
      }) do
    "database_instance.json"
    |> render(%{instance: instance})
    |> add_system_replication_status(database_instances)
  end

  def render("database_registered.json", %{database: database}) do
    database
    |> Map.from_struct()
    |> Map.delete(:__meta__)
    |> Map.delete(:tags)
    |> Map.delete(:database_instances)
    |> Map.delete(:sap_systems)
  end

  def render("database_restored.json", %{database: database}) do
    render("database.json", database: database)
  end

  def render("database_health_changed.json", %{health: health}), do: health

  def render("database_instance_health_changed.json", %{
        instance: %{
          database_id: database_id,
          host_id: host_id,
          instance_number: instance_number,
          health: health
        }
      }) do
    %{
      database_id: database_id,
      host_id: host_id,
      instance_number: instance_number,
      health: health
    }
  end

  def render("database_instance_system_replication_changed.json", %{
        instance: %{
          database_id: database_id,
          host_id: host_id,
          instance_number: instance_number,
          system_replication: system_replication,
          system_replication_status: system_replication_status
        }
      }) do
    %{
      database_id: database_id,
      host_id: host_id,
      instance_number: instance_number,
      system_replication: system_replication,
      system_replication_status: system_replication_status
    }
  end

  def render("database_deregistered.json", %{id: id, sid: sid}), do: %{id: id, sid: sid}

  def render("database_instance_deregistered.json", %{
        database_id: id,
        instance_number: instance_number,
        host_id: host_id,
        sid: sid
      }),
      do: %{database_id: id, instance_number: instance_number, host_id: host_id, sid: sid}

  def render("database_instance_absent_at_changed.json", %{
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
