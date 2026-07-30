# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Infrastructure.Commanded.EventHandlers.AlertsEventHandler do
  @moduledoc """
  This event handler is responsible to forward checks execution request to the agent.
  """

  use Commanded.Event.Handler,
    application: Trento.Commanded,
    name: "alerts_event_handler"

  alias Trento.Clusters.Events.ClusterHealthChanged

  alias Trento.Hosts.Events.{
    HeartbeatFailed,
    HostHealthChanged
  }

  alias Trento.Databases.Events.DatabaseHealthChanged

  alias Trento.SapSystems.Events.SapSystemHealthChanged

  alias Trento.Infrastructure.Alerting.Alerting

  def handle(
        %HostHealthChanged{host_id: host_id, health: health},
        _metadata
      )
      when health == :critical do
    Alerting.notify_critical_host_health(host_id)
  end

  def handle(
        %ClusterHealthChanged{cluster_id: cluster_id, health: health},
        _metadata
      )
      when health == :critical do
    Alerting.notify_critical_cluster_health(cluster_id)
  end

  def handle(
        %DatabaseHealthChanged{database_id: database_id, health: health},
        _metadata
      )
      when health == :critical do
    Alerting.notify_critical_database_health(database_id)
  end

  def handle(
        %SapSystemHealthChanged{sap_system_id: sap_system_id, health: health},
        _metadata
      )
      when health == :critical do
    Alerting.notify_critical_sap_system_health(sap_system_id)
  end

  def handle(
        %HeartbeatFailed{host_id: host_id},
        %{created_at: failed_at}
      ) do
    Alerting.notify_heartbeat_failed(host_id, failed_at)
  end
end
