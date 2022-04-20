defmodule Trento.ChecksEventHandler do
  @moduledoc """
  This event hanlder is responsible to forward checks execution request to the agent.
  """

  use Commanded.Event.Handler,
    application: Trento.Commanded,
    name: "checks_event_handler"

  alias Trento.Domain.Events.ChecksExecutionRequested
  alias Trento.Hosts
  alias Trento.Integration.Checks

  require Logger

  def handle(
        %ChecksExecutionRequested{
          cluster_id: cluster_id,
          provider: provider,
          hosts: hosts,
          checks: checks
        },
        %{correlation_id: execution_id}
      ) do
    hosts_settings =
      hosts
      |> Enum.map(fn host -> Hosts.get_connection_settings(host) end)
      |> Enum.filter(& &1)

    case Checks.request_execution(execution_id, cluster_id, provider, hosts_settings, checks) do
      :ok ->
        TrentoWeb.Endpoint.broadcast("monitoring:clusters", "checks_execution_requested", %{
          cluster_id: cluster_id
        })

      {:error, reason} ->
        Logger.error("Failed to request checks execution for cluster #{cluster_id}: #{reason}",
          error: reason
        )

        {:error, reason}
    end
  end
end
