defmodule Trento.Router do
  use Commanded.Commands.Router

  alias Trento.Support.Middleware.Enrich

  alias Trento.Domain.{
    Cluster,
    Host,
    SapSystem
  }

  alias Trento.Domain.Commands.{
    RegisterApplicationInstance,
    RegisterClusterHost,
    RegisterDatabaseInstance,
    RegisterHost,
    RequestChecksExecution,
    SelectChecks,
    StoreChecksResults,
    UpdateHeartbeat,
    UpdateProvider,
    UpdateSlesSubscriptions
  }

  middleware Enrich

  identify Host, by: :host_id
  dispatch [RegisterHost, UpdateHeartbeat, UpdateProvider, UpdateSlesSubscriptions], to: Host

  identify Cluster, by: :cluster_id

  dispatch [RegisterClusterHost, RequestChecksExecution, SelectChecks, StoreChecksResults],
    to: Cluster

  identify SapSystem, by: :sap_system_id

  dispatch [RegisterApplicationInstance, RegisterDatabaseInstance],
    to: SapSystem
end
