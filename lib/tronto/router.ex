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
    UpdateHeartbeat
  }

  middleware Validate

  identify Host, by: :id_host
  dispatch [RegisterHost, UpdateHeartbeat], to: Host

  identify Cluster, by: :id_cluster
  dispatch [RegisterCluster], to: Cluster
end
