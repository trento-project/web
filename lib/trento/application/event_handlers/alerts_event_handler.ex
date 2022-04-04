defmodule Trento.AlertsEventHandler do
  @moduledoc """
  This event handler is responsible to forward checks execution request to the agent.
  """

  use Commanded.Event.Handler,
    application: Trento.Commanded,
    name: "alerts_event_handler"

  alias Trento.Domain.Events.{
    ClusterHealthChanged,
    DatabaseHealthChanged,
    HeartbeatFailed,
    SapSystemHealthChanged
  }

  alias Trento.Application.UseCases.Alerting

  def handle(
        %HeartbeatFailed{host_id: host_id},
        _metadata
      ) do
    Alerting.notify_host_heartbeating_failure(host_id)
  end

  def handle(
        %ClusterHealthChanged{cluster_id: cluster_id, health: health},
        _metadata
      )
      when health == :critical do
    Alerting.notify_critical_cluster_health(cluster_id)
  end

  def handle(
        %DatabaseHealthChanged{sap_system_id: sap_system_id, health: health},
        _metadata
      )
      when health == :critical do
    Alerting.notify_critical_database_health(sap_system_id)
  end

  def handle(
        %SapSystemHealthChanged{sap_system_id: sap_system_id, health: health},
        _metadata
      )
      when health == :critical do
    Alerting.notify_critical_sap_system_health(sap_system_id)
  end
end
