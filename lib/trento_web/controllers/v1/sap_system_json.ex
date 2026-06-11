# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule TrentoWeb.V1.SapSystemJSON do
  import TrentoWeb.V1.DatabaseJSON,
    only: [database_instance: 1]

  alias Trento.SapSystems.Services.HealthService

  def application_instance(%{instance: instance}) do
    instance
    |> Map.from_struct()
    |> Map.delete(:__meta__)
    |> Map.delete(:host)
    |> Map.delete(:sap_system)
    |> HealthService.add_deprecated_health()
  end

  def application_instance_moved(%{instance_moved: instance_moved}), do: instance_moved

  def application_instance_status_changed(%{instance: instance}), do: instance

  def sap_systems(%{sap_systems: sap_systems}),
    do: Enum.map(sap_systems, &sap_system(%{sap_system: &1}))

  def sap_system(%{
        sap_system:
          %{
            application_instances: application_instances,
            database_instances: database_instances,
            database: %{sid: database_sid, health: database_health}
          } = sap_system
      }) do
    rendered_application_instances =
      Enum.map(application_instances, &application_instance(%{instance: &1}))

    rendered_database_instances =
      Enum.map(database_instances, &database_instance(%{instance: &1}))

    sap_system
    |> Map.from_struct()
    |> Map.delete(:__meta__)
    |> Map.delete(:deregistered_at)
    |> Map.delete(:database)
    |> Map.put(
      :database_instances,
      rendered_database_instances
    )
    |> Map.put(:database_sid, database_sid)
    |> Map.put(:database_health, database_health)
    |> Map.put(
      :application_instances,
      rendered_application_instances
    )
  end

  def sap_system_registered(%{
        sap_system: %{database: %{sid: database_sid, health: database_health}} = sap_system
      }) do
    sap_system
    |> Map.from_struct()
    |> Map.delete(:__meta__)
    |> Map.delete(:database)
    |> Map.delete(:database_instances)
    |> Map.delete(:application_instances)
    |> Map.delete(:tags)
    |> Map.put(:database_sid, database_sid)
    |> Map.put(:database_health, database_health)
  end

  def sap_system_restored(%{sap_system: sap_system}), do: sap_system(%{sap_system: sap_system})

  def sap_system_updated(%{id: id, ensa_version: ensa_version}),
    do: %{id: id, ensa_version: ensa_version}

  def sap_system_health_changed(%{health: health}), do: health

  def sap_system_database_health_changed(%{id: id, database_health: database_health}),
    do: %{id: id, database_health: database_health}

  def sap_system_deregistered(%{id: id, sid: sid}), do: %{id: id, sid: sid}

  def application_instance_deregistered(%{
        sap_system_id: id,
        instance_number: instance_number,
        host_id: host_id,
        sid: sid
      }),
      do: %{sap_system_id: id, instance_number: instance_number, host_id: host_id, sid: sid}

  def application_instance_absent_at_changed(%{
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
