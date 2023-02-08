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
    RegisterApplicationInstance,
    RegisterClusterHost,
    RegisterDatabaseInstance,
    RegisterHost,
    RollUpCluster,
    SelectChecks,
    UpdateHeartbeat,
    UpdateProvider,
    UpdateSlesSubscriptions
  }

  middleware Enrich

  identify Host, by: :host_id
  dispatch [RegisterHost, UpdateHeartbeat, UpdateProvider, UpdateSlesSubscriptions], to: Host

  identify Cluster,
    by: :cluster_id

  dispatch [
             RollUpCluster,
             RegisterClusterHost,
             SelectChecks,
             CompleteChecksExecution
           ],
           to: Cluster,
           lifespan: Cluster.Lifespan

  identify SapSystem, by: :sap_system_id

  dispatch [RegisterApplicationInstance, RegisterDatabaseInstance],
    to: SapSystem
end
