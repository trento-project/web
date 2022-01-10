defmodule Tronto.Router do
  use Commanded.Commands.Router

  alias Tronto.Support.Middleware.Validate

  alias Tronto.Monitoring.Domain.Host

  alias Tronto.Monitoring.Domain.Commands.{
    RegisterHost,
    UpdateHeartbeat
  }

  middleware Validate

  identify Host, by: :id_host
  dispatch [RegisterHost, UpdateHeartbeat], to: Host
end
