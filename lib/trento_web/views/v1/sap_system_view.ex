defmodule TrentoWeb.V1.SapSystemView do
  use TrentoWeb, :view

  import TrentoWeb.V1.DatabaseView, only: [add_system_replication_status_to_secondary_instance: 1]

  alias TrentoWeb.V1.DatabaseView

  def render("application_instance.json", %{instance: instance}) do
    instance
    |> Map.from_struct()
    |> Map.delete(:__meta__)
    |> Map.delete(:host)
  end

  def render("application_instance_moved.json", %{instance_moved: instance_moved}),
    do: instance_moved

  def render("application_instance_health_changed.json", %{health: health}), do: health

  def render("sap_systems.json", %{sap_systems: sap_systems}) do
    render_many(sap_systems, __MODULE__, "sap_system.json")
  end

  def render("sap_system.json", %{
        sap_system:
          %{
            application_instances: application_instances,
            database_instances: database_instances
          } = sap_system
      }) do
    rendered_application_instances =
      render_many(application_instances, __MODULE__, "application_instance.json", as: :instance)

    rendered_database_instances =
      render_many(database_instances, DatabaseView, "database_instance.json", as: :instance)

    sap_system
    |> Map.from_struct()
    |> Map.delete(:__meta__)
    |> Map.delete(:deregistered_at)
    |> Map.delete(:database)
    |> Map.put(
      :database_instances,
      rendered_database_instances
    )
    |> Map.put(
      :application_instances,
      rendered_application_instances
    )
    |> add_system_replication_status_to_secondary_instance()
  end

  def render("sap_system_registered.json", %{sap_system: sap_system}) do
    sap_system
    |> Map.from_struct()
    |> Map.delete(:__meta__)
    |> Map.delete(:database)
    |> Map.delete(:database_instances)
    |> Map.delete(:application_instances)
    |> Map.delete(:tags)
  end

  def render("sap_system_restored.json", %{sap_system: sap_system}) do
    render("sap_system.json", sap_system: sap_system)
  end

  def render("sap_system_updated.json", %{id: id, ensa_version: ensa_version}),
    do: %{id: id, ensa_version: ensa_version}

  def render("sap_system_health_changed.json", %{health: health}), do: health

  def render("sap_system_deregistered.json", %{id: id, sid: sid}), do: %{id: id, sid: sid}

  def render("application_instance_deregistered.json", %{
        sap_system_id: id,
        instance_number: instance_number,
        host_id: host_id,
        sid: sid
      }),
      do: %{sap_system_id: id, instance_number: instance_number, host_id: host_id, sid: sid}

  def render("application_instance_absent_at_changed.json", %{
        instance: %{
          instance_number: instance_number,
          host_id: host_id,
          sap_system_id: sap_system_id,
          sid: sid,
          absent_at: absent_at
        }
      }),
      do: %{
        instance_number: instance_number,
        host_id: host_id,
        sap_system_id: sap_system_id,
        sid: sid,
        absent_at: absent_at
      }
end
