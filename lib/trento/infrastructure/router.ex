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
    DeregisterApplicationInstance,
    DeregisterClusterHost,
    DeregisterDatabaseInstance,
    DeregisterHost,
    RegisterApplicationInstance,
    RegisterClusterHost,
    RegisterDatabaseInstance,
    RegisterHost,
    RequestHostDeregistration,
    RollUpCluster,
    RollUpHost,
    RollUpSapSystem,
    SelectChecks,
    UpdateHeartbeat,
    UpdateProvider,
    UpdateSlesSubscriptions
  }

  middleware Enrich

  identify Host, by: :host_id

  dispatch [
             RegisterHost,
             UpdateHeartbeat,
             UpdateProvider,
             UpdateSlesSubscriptions,
             RollUpHost,
             RequestHostDeregistration,
             DeregisterHost
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
             RegisterApplicationInstance,
             RegisterDatabaseInstance,
             RollUpSapSystem
           ],
           to: SapSystem,
           lifespan: SapSystem.Lifespan
end
