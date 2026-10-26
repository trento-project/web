# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Infrastructure.Commanded.EventHandlers.OperationSchedulesCleanupEventHandler do
  @moduledoc """
  Cancels the operation schedules of a host, cluster, SAP system or database
  that is deregistered, correlated to the clean up that removed it.
  """

  use Commanded.Event.Handler,
    application: Trento.Commanded,
    name: "operation_schedules_cleanup_event_handler"

  alias Trento.Clusters.Events.ClusterDeregistered
  alias Trento.Databases.Events.DatabaseDeregistered
  alias Trento.Hosts.Events.HostDeregistered
  alias Trento.Operations.Schedules
  alias Trento.SapSystems.Events.SapSystemDeregistered

  def handle(%HostDeregistered{host_id: id}, metadata), do: cancel(id, metadata)
  def handle(%ClusterDeregistered{cluster_id: id}, metadata), do: cancel(id, metadata)
  def handle(%SapSystemDeregistered{sap_system_id: id}, metadata), do: cancel(id, metadata)
  def handle(%DatabaseDeregistered{database_id: id}, metadata), do: cancel(id, metadata)

  defp cancel(target_id, metadata),
    do: Schedules.cancel_target_schedules(target_id, Map.get(metadata, :correlation_id))
end
