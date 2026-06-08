# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

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
        {Cachex, [:activity_correlations]},
        {Task.Supervisor, name: Trento.TasksSupervisor},
        # Start the Endpoint (http/https)
        TrentoWeb.Endpoint,
        Trento.Commanded,
        Trento.Scheduler,
        Trento.EventHandlersSupervisor,
        Trento.ProjectorsSupervisor,
        Trento.ProcessManagersSupervisor,
        Trento.Infrastructure.Checks.AMQP.Publisher,
        Trento.Infrastructure.Checks.AMQP.Consumer,
        Trento.Infrastructure.Operations.AMQP.Publisher,
        Trento.Infrastructure.Operations.AMQP.Consumer,
        Trento.Infrastructure.Catalog.AMQP.Consumer,
        Trento.Infrastructure.Discovery.AMQP.Publisher,
        Trento.Vault,
        Trento.Infrastructure.SoftwareUpdates.Auth.SumaAuth,
        {Samly.Provider, []},
        {Sagents.Supervisor, []}
        # Start a worker by calling: Trento.Worker.start_link(arg)
        # {Trento.Worker, arg}
      ] ++
        Application.get_env(:trento, :extra_children, [])

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: Trento.Supervisor]
    result = Supervisor.start_link(children, opts)

    warm_ai_tools_cache()

    result
  end

  # Pre-populates the AI tools cache so the first agent run doesn't pay
  # the cost of a router scan + (network-bound) remote OpenAPI fetch.
  # Each source is invoked in isolation under `Task.Supervisor`; failures
  # are absorbed by `Trento.AI.ToolsRegistry` (logged + per-source cache
  # left untouched). Gated by `:warm_tool_cache_at_boot` so tests / specs
  # opt out cleanly.
  defp warm_ai_tools_cache do
    ai_config = Application.get_env(:trento, :ai, [])

    if Keyword.get(ai_config, :warm_tool_cache_at_boot, false) do
      Task.Supervisor.start_child(Trento.TasksSupervisor, fn ->
        try do
          _ = Trento.AI.ToolsRegistry.refresh!()
          :ok
        rescue
          exception ->
            require Logger

            Logger.warning(
              "Trento.Application: AI tools cache warm failed: " <>
                Exception.format(:error, exception, __STACKTRACE__)
            )
        end
      end)
    end
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    TrentoWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
