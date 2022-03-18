defmodule Trento.AlertsEventHandler do
  @moduledoc """
  This event hanlder is responsible to forward checks execution request to the agent.
  """

  use Commanded.Event.Handler,
    application: Trento.Commanded,
    name: "alerts_event_handler"

  alias Trento.Domain.Events.{
    ClusterHealthChanged,
    HeartbeatFailed
  }

  alias Trento.{
    ClusterReadModel,
    HostReadModel
  }

  def handle(
        %ClusterHealthChanged{cluster_id: cluster_id, health: health},
        _metadata
      )
      when health in [:warning, :critical] do
    %ClusterReadModel{name: name} = Trento.Repo.get!(ClusterReadModel, cluster_id)

    email = Trento.AlertEmail.alert("Cluster #{name} health is now in #{health} state")
    Trento.Mailer.deliver(email)
  end

  def handle(
        %HeartbeatFailed{host_id: host_id},
        _metadata
      ) do
    %HostReadModel{hostname: hostname} = Trento.Repo.get!(HostReadModel, host_id)

    email = Trento.AlertEmail.alert("Host #{hostname} hearbeat failed")
    Trento.Mailer.deliver(email)
  end
end
