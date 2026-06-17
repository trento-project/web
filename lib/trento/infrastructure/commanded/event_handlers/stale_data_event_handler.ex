# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Infrastructure.Commanded.EventHandlers.StaleDataEventHandler do
  @moduledoc """
  Event handler responsible to mark resources data as stale.

  The feature is implemented in an event handler to make it simpler, compared with
  the usage of a process manager (which would be more optimal, but more complex).

  When a host stops sending data and the system emits the `HeartbeatFailed` event,
  the resources in that host (application instances, database instances and clusters)
  have not been updated since the agent stopped reporting, so the data should be
  up to date.
  """

  use Commanded.Event.Handler,
    application: Trento.Commanded,
    name: "stale_data_event_handler",
    start_from: :current

  alias Trento.Hosts.Events.HeartbeatFailed
  alias Trento.SapSystems
  alias Trento.SapSystems.Commands.MarkApplicationInstanceDataStale

  def handle(%HeartbeatFailed{host_id: host_id}, %{correlation_id: correlation_id}) do
    host_id
    |> SapSystems.get_application_instances_by_host_id()
    |> Enum.map(fn %{sap_system_id: sap_system_id, instance_number: instance_number} ->
      %MarkApplicationInstanceDataStale{
        sap_system_id: sap_system_id,
        instance_number: instance_number,
        host_id: host_id
      }
    end)
    |> Enum.each(fn command ->
      commanded().dispatch(
        command,
        correlation_id: correlation_id,
        causation_id: correlation_id
      )
    end)
  end

  defp commanded,
    do: Application.fetch_env!(:trento, Trento.Commanded)[:adapter]
end
