# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule TrentoWeb.V1.HealthOverviewJSON do
  def overview(%{health_infos: health_infos}) do
    Enum.map(health_infos, &health_summary/1)
  end

  def health_summary(%{
        id: id,
        sid: sid,
        sapsystem_health: sapsystem_health,
        application_health: application_health,
        application_stale_at: application_stale_at,
        application_cluster_id: application_cluster_id,
        application_cluster_health: application_cluster_health,
        application_cluster_stale_at: application_cluster_stale_at,
        database_id: database_id,
        database_sid: database_sid,
        database_health: database_health,
        database_stale_at: database_stale_at,
        database_cluster_id: database_cluster_id,
        database_cluster_health: database_cluster_health,
        database_cluster_stale_at: database_cluster_stale_at,
        hosts_health: hosts_health,
        hosts_stale_at: hosts_stale_at
      }) do
    %{
      id: id,
      sid: sid,
      sapsystem_health: sapsystem_health,
      application_health: application_health,
      application_stale_at: application_stale_at,
      application_cluster_id: application_cluster_id,
      application_cluster_health: application_cluster_health,
      application_cluster_stale_at: application_cluster_stale_at,
      database_id: database_id,
      database_sid: database_sid,
      database_health: database_health,
      database_stale_at: database_stale_at,
      database_cluster_id: database_cluster_id,
      database_cluster_health: database_cluster_health,
      database_cluster_stale_at: database_cluster_stale_at,
      hosts_health: hosts_health,
      hosts_stale_at: hosts_stale_at,
      # Deprecated fields
      cluster_id: database_cluster_id,
      clusters_health: database_cluster_health,
      tenant: database_sid
    }
  end
end
