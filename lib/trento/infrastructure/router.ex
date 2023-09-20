defmodule Trento.Router do
  use Commanded.Commands.Router

  alias Trento.Support.Middleware.Enrich

  alias Trento.Domain.{
    Cluster,
    Host,
    SapSystem
  }

  alias Trento.Domain.Commands.{
    CompleteChecksExecution,
    CompleteHostChecksExecution,
    DeregisterApplicationInstance,
    DeregisterClusterHost,
    DeregisterDatabaseInstance,
    DeregisterHost,
    MarkApplicationInstanceAbsent,
    MarkDatabaseInstanceAbsent,
    RegisterApplicationInstance,
    RegisterClusterHost,
    RegisterDatabaseInstance,
    RegisterHost,
    RequestHostDeregistration,
    RollUpCluster,
    RollUpHost,
    RollUpSapSystem,
    SelectChecks,
    SelectHostChecks,
    UpdateHeartbeat,
    UpdateProvider,
    UpdateSaptuneStatus,
    UpdateSlesSubscriptions
  }

  middleware Enrich

  identify Host, by: :host_id

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
             CompleteHostChecksExecution
           ],
           to: Host,
           lifespan: Host.Lifespan

  identify Cluster,
    by: :cluster_id

  dispatch [
             DeregisterClusterHost,
             RollUpCluster,
             RegisterClusterHost,
             SelectChecks,
             CompleteChecksExecution
           ],
           to: Cluster,
           lifespan: Cluster.Lifespan

  identify SapSystem, by: :sap_system_id

  dispatch [
             DeregisterApplicationInstance,
             DeregisterDatabaseInstance,
             MarkApplicationInstanceAbsent,
             MarkDatabaseInstanceAbsent,
             RegisterApplicationInstance,
             RegisterDatabaseInstance,
             RollUpSapSystem
           ],
           to: SapSystem,
           lifespan: SapSystem.Lifespan
end
