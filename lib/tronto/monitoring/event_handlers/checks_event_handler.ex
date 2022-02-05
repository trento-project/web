defmodule Tronto.Monitoring.ChecksEventsHandler do
  @moduledoc """
  This event hanlder is responsible to forward checks execution request to the agent.
  """

  use Commanded.Event.Handler,
    application: Tronto.Commanded,
    name: "checks_event_handler"

  alias Tronto.Monitoring.Domain.Events.ChecksExecutionRequested

  def handle(
        %ChecksExecutionRequested{cluster_id: cluster_id, hosts: hosts, checks: checks},
        _metadata
      ) do
    Enum.each(hosts, fn host ->
      TrontoWeb.Endpoint.broadcast("monitoring:agent_" <> host, "checks_execution_requested", %{
        host_id: host,
        cluster_id: cluster_id,
        checks: checks
      })
    end)

    TrontoWeb.Endpoint.broadcast("monitoring:clusters", "checks_execution_started", %{
      cluster_id: cluster_id
    })
  end
end
