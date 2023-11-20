defmodule Trento.Router do
  use Commanded.Commands.Router

  alias Trento.Support.Middleware.Enrich

  alias Trento.Domain.{
    Cluster,
    SapSystem
  }

  alias Trento.Domain.Commands.{
    CompleteChecksExecution,
    DeregisterApplicationInstance,
    DeregisterClusterHost,
    DeregisterDatabaseInstance,
    MarkApplicationInstanceAbsent,
    MarkDatabaseInstanceAbsent,
    RegisterApplicationInstance,
    RegisterClusterHost,
    RegisterDatabaseInstance,
    RollUpCluster,
    RollUpSapSystem,
    SelectChecks
  }

  alias Trento.Hosts.Commands.{
    CompleteHostChecksExecution,
    DeregisterHost,
    UpdateHeartbeat,
    UpdateProvider,
    UpdateSaptuneStatus,
    UpdateSlesSubscriptions,
    RegisterHost,
    RequestHostDeregistration,
    RollUpHost,
    SelectHostChecks
  }

  alias Trento.Hosts

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
             CompleteHostChecksExecution
           ],
           to: Hosts.Host,
           lifespan: Hosts.Lifespan

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
