# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Router do
  use Commanded.Commands.Router

  alias Trento.Infrastructure.Commanded.Middleware.Enrich

  alias Trento.Clusters.Commands.{
    CompleteChecksExecution,
    DeregisterClusterHost,
    MarkClusterHostStale,
    RegisterOfflineClusterHost,
    RegisterOnlineClusterHost,
    RollUpCluster,
    SelectChecks
  }

  alias Trento.Hosts.Commands.{
    ClearSoftwareUpdatesDiscovery,
    CompleteHostChecksExecution,
    CompleteSoftwareUpdatesDiscovery,
    DeregisterHost,
    RegisterHost,
    RequestHostDeregistration,
    RollUpHost,
    SelectHostChecks,
    UpdateHeartbeat,
    UpdateProvider,
    UpdateSaptuneStatus,
    UpdateSlesSubscriptions
  }

  alias Trento.Operations.Commands.{
    CancelOperationSchedule,
    ChangeOperationSchedule,
    CompleteScheduledRun,
    ScheduleOperation,
    StartScheduledRun
  }

  alias Trento.Databases.Commands.{
    DeregisterDatabaseInstance,
    MarkDatabaseInstanceAbsent,
    MarkDatabaseInstanceDataStale,
    RegisterDatabaseInstance,
    RollUpDatabase
  }

  alias Trento.SapSystems.Commands.{
    DeregisterApplicationInstance,
    DeregisterSapSystem,
    MarkApplicationInstanceAbsent,
    MarkApplicationInstanceDataStale,
    RegisterApplicationInstance,
    RestoreSapSystem,
    RollUpSapSystem,
    UpdateDatabaseHealth,
    UpdateDatabaseStaleAt
  }

  alias Trento.Clusters
  alias Trento.Databases
  alias Trento.Hosts
  alias Trento.Operations
  alias Trento.SapSystems

  middleware Enrich

  identify Hosts.Host, by: :host_id

  dispatch [
             RegisterHost,
             UpdateHeartbeat,
             UpdateProvider,
             UpdateSaptuneStatus,
             UpdateSlesSubscriptions,
             SelectHostChecks,
             RollUpHost,
             RequestHostDeregistration,
             DeregisterHost,
             CompleteHostChecksExecution,
             CompleteSoftwareUpdatesDiscovery,
             ClearSoftwareUpdatesDiscovery
           ],
           to: Hosts.Host,
           lifespan: Hosts.Lifespan

  identify Clusters.Cluster,
    by: :cluster_id

  dispatch [
             DeregisterClusterHost,
             MarkClusterHostStale,
             RollUpCluster,
             RegisterOfflineClusterHost,
             RegisterOnlineClusterHost,
             SelectChecks,
             CompleteChecksExecution
           ],
           to: Clusters.Cluster,
           lifespan: Clusters.Lifespan

  identify SapSystems.SapSystem, by: :sap_system_id

  dispatch [
             DeregisterApplicationInstance,
             DeregisterSapSystem,
             RestoreSapSystem,
             MarkApplicationInstanceAbsent,
             MarkApplicationInstanceDataStale,
             RegisterApplicationInstance,
             RollUpSapSystem,
             UpdateDatabaseHealth,
             UpdateDatabaseStaleAt
           ],
           to: SapSystems.SapSystem,
           lifespan: SapSystems.Lifespan

  identify Databases.Database, by: :database_id

  dispatch [
             DeregisterDatabaseInstance,
             MarkDatabaseInstanceAbsent,
             MarkDatabaseInstanceDataStale,
             RegisterDatabaseInstance,
             RollUpDatabase
           ],
           to: Databases.Database,
           lifespan: Databases.Lifespan

  identify Operations.Schedule, by: :schedule_id

  dispatch [
             ScheduleOperation,
             ChangeOperationSchedule,
             CancelOperationSchedule,
             StartScheduledRun,
             CompleteScheduledRun
           ],
           to: Operations.Schedule
end
