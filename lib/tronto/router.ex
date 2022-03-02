defmodule Tronto.Router do
  use Commanded.Commands.Router

  alias Tronto.Support.Middleware.Validate

  alias Tronto.Monitoring.Domain.{
    Cluster,
    Host
  }

  alias Tronto.Monitoring.Domain.Commands.{
    RegisterCluster,
    RegisterHost,
    RequestChecksExecution,
    SelectChecks,
    StoreChecksResults,
    UpdateHeartbeat,
    UpdateProvider,
    UpdateSubscriptions
  }

  middleware Validate

  identify Host, by: :host_id
  dispatch [RegisterHost, UpdateHeartbeat, UpdateProvider, UpdateSubscriptions], to: Host

  identify Cluster, by: :cluster_id

  dispatch [RegisterCluster, RequestChecksExecution, SelectChecks, StoreChecksResults],
    to: Cluster
end
