# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Repo.Migrations.AddHealthDetailsSapSystemReadModel do
  use Ecto.Migration

  import Ecto.Query

  def up do
    alter table("sap_systems") do
      add :health_details, :map
    end

    flush()

    sap_systems =
      repo().all(
        from(s in "sap_systems",
          left_join: d in "databases",
          on: s.database_id == d.id,
          where: is_nil(s.health_details),
          select: %{
            id: s.id,
            database_health: d.health
          }
        )
      )

    if sap_systems != [] do
      system_ids = Enum.map(sap_systems, & &1.id)

      instance_statuses_by_system =
        repo().all(
          from(ai in "application_instances",
            where: ai.sap_system_id in ^system_ids,
            select: %{
              sap_system_id: ai.sap_system_id,
              status: ai.status
            }
          )
        )
        |> Enum.group_by(& &1.sap_system_id, & &1.status)

      for %{id: id, database_health: database_health} <- sap_systems do
        instance_statuses = Map.get(instance_statuses_by_system, id, [])
        instances_health = compute_instances_health(instance_statuses)

        health_details = %{
          "instances_health" => %{
            "value" => to_string(instances_health),
            "reason" => ""
          },
          "database_health" => %{
            "value" => to_string(database_health || "unknown"),
            "reason" => ""
          }
        }

        repo().update_all(
          from(s in "sap_systems", where: s.id == ^id),
          set: [health_details: health_details]
        )
      end
    end
  end

  def down do
    alter table("sap_systems") do
      remove :health_details
    end
  end

  defp compute_instances_health([]), do: :unknown

  defp compute_instances_health(statuses) do
    statuses
    |> Enum.map(&derive_health_from_status/1)
    |> compute_aggregated_health()
  end

  defp derive_health_from_status("green"), do: :passing
  defp derive_health_from_status(:green), do: :passing
  defp derive_health_from_status("yellow"), do: :warning
  defp derive_health_from_status(:yellow), do: :warning
  defp derive_health_from_status("red"), do: :critical
  defp derive_health_from_status(:red), do: :critical
  defp derive_health_from_status(_), do: :unknown

  defp compute_aggregated_health([]), do: :unknown

  defp compute_aggregated_health(healths) do
    healths
    |> Enum.map(&{&1, health_weight(&1)})
    |> Enum.max_by(fn {_, weight} -> weight end)
    |> elem(0)
  end

  defp health_weight(:unknown), do: 3
  defp health_weight(:critical), do: 2
  defp health_weight(:warning), do: 1
  defp health_weight(:passing), do: 0
  defp health_weight(_), do: 3
end
