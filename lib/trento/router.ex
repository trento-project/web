defmodule Trento.Router do
  use Commanded.Commands.Router

  alias Trento.Infrastructure.Commanded.Middleware.Enrich

  alias Trento.Clusters.Commands.{
    CompleteChecksExecution,
    DeregisterClusterHost,
    RegisterClusterHost,
    RollUpCluster,
    SelectChecks
  }

  alias Trento.Hosts.Commands.{
    ClearSoftwareUpdatesDiscovery,
    CompleteHostChecksExecution,
    CompleteSoftwareUpdatesDiscovery,
    DeregisterHost,
    DiscoverSoftwareUpdates,
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
    RegisterDatabaseInstance,
    RollUpDatabase
  }

  alias Trento.SapSystems.Commands.{
    DeregisterApplicationInstance,
    DeregisterSapSystem,
    MarkApplicationInstanceAbsent,
    RegisterApplicationInstance,
    RestoreSapSystem,
    RollUpSapSystem
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
             DiscoverSoftwareUpdates,
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
             RegisterClusterHost,
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
             RegisterApplicationInstance,
             RollUpSapSystem
           ],
           to: SapSystems.SapSystem,
           lifespan: SapSystems.Lifespan

  identify Databases.Database, by: :database_id

  dispatch [
             DeregisterDatabaseInstance,
             MarkDatabaseInstanceAbsent,
             RegisterDatabaseInstance,
             RollUpDatabase
           ],
           to: Databases.Database,
           lifespan: Databases.Lifespan
end
