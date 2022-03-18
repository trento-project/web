defmodule Trento.ChecksEventHandler do
  @moduledoc """
  This event hanlder is responsible to forward checks execution request to the agent.
  """

  use Commanded.Event.Handler,
    application: Trento.Commanded,
    name: "checks_event_handler"

  alias Trento.Domain.Events.ChecksExecutionRequested

  def handle(
        %ChecksExecutionRequested{cluster_id: cluster_id, hosts: hosts, checks: checks},
        _metadata
      ) do
    Enum.each(hosts, fn host ->
      TrentoWeb.Endpoint.broadcast("monitoring:agent_" <> host, "checks_execution_requested", %{
        host_id: host,
        cluster_id: cluster_id,
        checks: checks
      })
    end)

    TrentoWeb.Endpoint.broadcast("monitoring:clusters", "checks_execution_started", %{
      cluster_id: cluster_id
    })
  end
end
