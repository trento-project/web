# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Router do
  use Commanded.Commands.Router

  alias Trento.Infrastructure.Commanded.Middleware.Enrich

  alias Trento.Clusters.Commands.{
    CompleteChecksExecution,
    DeregisterClusterHost,
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
    UpdateDatabaseHealth
  }

  alias Trento.Clusters
  alias Trento.Databases
  alias Trento.Hosts
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
             UpdateDatabaseHealth
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
end
