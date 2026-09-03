# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule TrentoWeb.V1.HealthOverviewJSONTest do
  use TrentoWeb.ConnCase, async: true

  alias TrentoWeb.V1.HealthOverviewJSON

  require Trento.Enums.Health, as: Health

  describe "renders overview.json" do
    test "should render all the fields" do
      sap_system_id = UUID.uuid4()
      sid = UUID.uuid4()
      database_id = UUID.uuid4()
      database_sid = UUID.uuid4()
      app_cluster_id = UUID.uuid4()
      db_cluster_id = UUID.uuid4()

      now = DateTime.utc_now()
      application_stale_at = DateTime.add(now, -5, :minute)
      app_cluster_stale_at = DateTime.add(now, -10, :minute)
      database_stale_at = DateTime.add(now, -15, :minute)
      db_cluster_stale_at = DateTime.add(now, -20, :minute)
      hosts_stale_at = DateTime.add(now, -25, :minute)

      assert [
               %{
                 id: sap_system_id,
                 sid: sid,
                 sapsystem_health: Health.passing(),
                 application_health: Health.critical(),
                 application_stale_at: application_stale_at,
                 application_cluster_id: app_cluster_id,
                 application_cluster_health: Health.critical(),
                 application_cluster_stale_at: app_cluster_stale_at,
                 database_id: database_id,
                 database_sid: database_sid,
                 database_health: Health.passing(),
                 database_stale_at: database_stale_at,
                 database_cluster_id: db_cluster_id,
                 database_cluster_health: Health.warning(),
                 database_cluster_stale_at: db_cluster_stale_at,
                 hosts_health: Health.warning(),
                 hosts_stale_at: hosts_stale_at,
                 cluster_id: db_cluster_id,
                 clusters_health: Health.warning(),
                 tenant: database_sid
               }
             ] ==
               HealthOverviewJSON.overview(%{
                 health_infos: [
                   %{
                     id: sap_system_id,
                     sid: sid,
                     sapsystem_health: Health.passing(),
                     application_health: Health.critical(),
                     application_stale_at: application_stale_at,
                     application_cluster_id: app_cluster_id,
                     application_cluster_health: Health.critical(),
                     application_cluster_stale_at: app_cluster_stale_at,
                     database_id: database_id,
                     database_sid: database_sid,
                     database_health: Health.passing(),
                     database_stale_at: database_stale_at,
                     database_cluster_id: db_cluster_id,
                     database_cluster_health: Health.warning(),
                     database_cluster_stale_at: db_cluster_stale_at,
                     hosts_health: Health.warning(),
                     hosts_stale_at: hosts_stale_at
                   }
                 ]
               })
    end
  end
end
