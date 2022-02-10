defmodule Tronto.Monitoring.AlertsEventsHandler do
  @moduledoc """
  This event hanlder is responsible to forward checks execution request to the agent.
  """

  use Commanded.Event.Handler,
    application: Tronto.Commanded,
    name: "alerts_event_handler"

  alias Tronto.Monitoring.Domain.Events.{
    ClusterHealthChanged,
    HeartbeatFailed
  }

  alias Tronto.Monitoring.{
    ClusterReadModel,
    HostReadModel
  }

  def handle(
        %ClusterHealthChanged{cluster_id: cluster_id, health: health},
        _metadata
      )
      when health in [:warning, :critical] do
    %ClusterReadModel{name: name} = Tronto.Repo.get!(ClusterReadModel, cluster_id)

    email = Tronto.AlertEmail.alert("Cluster #{name} health is now in #{health} state")
    Tronto.Mailer.deliver(email)
  end

  def handle(
        %HeartbeatFailed{host_id: host_id},
        _metadata
      ) do
    %HostReadModel{hostname: hostname} = Tronto.Repo.get!(HostReadModel, host_id)

    email = Tronto.AlertEmail.alert("Host #{hostname} hearbeat failed")
    Tronto.Mailer.deliver(email)
  end
end
