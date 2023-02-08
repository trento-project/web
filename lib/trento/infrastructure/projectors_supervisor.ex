defmodule Trento.ProjectorsSupervisor do
  @moduledoc false

  use Supervisor

  def start_link(init_arg) do
    Supervisor.start_link(__MODULE__, init_arg, name: __MODULE__)
  end

  @impl true
  def init(_init_arg) do
    children = [
      Trento.ClusterProjector,
      Trento.HostProjector,
      Trento.SlesSubscriptionsProjector,
      Trento.DatabaseProjector,
      Trento.SapSystemProjector,
      Trento.TelemetryProjector
    ]

    Supervisor.init(children, strategy: :one_for_one)
  end
end
