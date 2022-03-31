defmodule Trento.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children =
      [
        # Start the Ecto repository
        Trento.Repo,
        # Start the Telemetry supervisor
        TrentoWeb.Telemetry,
        # Start the PubSub system
        {Phoenix.PubSub, name: Trento.PubSub},
        # Start the Endpoint (http/https)
        TrentoWeb.Endpoint,
        Trento.Commanded,
        Trento.Scheduler,
        Trento.EventHandlersSupervisor,
        Trento.ProjectorsSupervisor
        # Start a worker by calling: Trento.Worker.start_link(arg)
        # {Trento.Worker, arg}
      ] ++
        Application.get_env(:trento, :extra_children, [])

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: Trento.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    TrentoWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
