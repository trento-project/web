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
        # Start the Ecto audit process
        Supervisor.child_spec({WalEx.Supervisor, Application.get_env(:trento, WalEx0)},
          id: :trento_repo_audit
        ),
        Supervisor.child_spec({WalEx.Supervisor, Application.get_env(:trento, WalEx1)},
          id: :trento_eventstore_audit
        ),
        Trento.AuditRepo,
        # Start the Telemetry supervisor
        TrentoWeb.Telemetry,
        # Start the PubSub system
        {Phoenix.PubSub, name: Trento.PubSub},
        # Start the Endpoint (http/https)
        TrentoWeb.Endpoint,
        Trento.Commanded,
        Trento.Scheduler,
        Trento.EventHandlersSupervisor,
        Trento.ProjectorsSupervisor,
        Trento.ProcessManagersSupervisor,
        Trento.Infrastructure.Messaging.Adapter.AMQP.Publisher,
        Trento.Infrastructure.Checks.AMQP.Consumer,
        Trento.Vault,
        Trento.Infrastructure.SoftwareUpdates.Auth.SumaAuth,
        {Oban, Application.fetch_env!(:trento, Oban)},
        {Task.Supervisor, name: Trento.TasksSupervisor}
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
