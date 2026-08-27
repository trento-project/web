# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.AI.AICase do
  @moduledoc false

  use ExUnit.CaseTemplate

  alias Trento.AI.ApplicationConfigLoader
  alias Trento.Infrastructure.AI.{SagentsAgentServer, SagentsDynamicSupervisor}

  # Booting a real sagents process tree and reaching the model call is slower
  # than any mocked round-trip, so integration tests wait longer.
  @integration_timeout 5_000

  using do
    quote do
      import Trento.AI.AICase

      @integration_timeout unquote(@integration_timeout)
    end
  end

  setup _ do
    stub_config_loader()

    :ok
  end

  def stub_config_loader do
    Mox.stub_with(
      Trento.AI.ApplicationConfigLoader.Mock,
      Trento.AI.ApplicationConfigLoader
    )
  end

  @doc """
  Swaps the whole AI config over to the real implementations for the duration
  of the test, so `Trento.AI.Agent` drives the actual sagents tree instead of
  the Mox doubles wired in `config/test.exs`.

  `:application_config_loader` goes back to the real module too, and that is
  what lets teardown call `Trento.AI.Agent.stop/1`: the Mox mock is `:private`
  and stubbed for the *test* process, while `on_exit` runs in a process of its
  own. Semantically it changes nothing — the mock is stubbed with
  `Mox.stub_with(…, ApplicationConfigLoader)`, so it only ever delegated to
  this same module.
  """
  def real_sagents_adapters(_context) do
    ai = Application.get_env(:trento, :ai)

    Application.put_env(
      :trento,
      :ai,
      ai
      |> Keyword.put(:application_config_loader, ApplicationConfigLoader)
      |> Keyword.put(:agent_supervisor_adapter, SagentsDynamicSupervisor)
      |> Keyword.put(:agent_server_adapter, SagentsAgentServer)
    )

    on_exit(fn -> Application.put_env(:trento, :ai, ai) end)
  end

  @doc """
  Returns the pid of the running agent process for `agent_id`, raising when
  nothing is registered.

  The registry is the one piece of sagents with no `Trento.AI` port in front of
  it, so it is reached here once instead of at every call site.
  """
  def agent_pid!(agent_id) do
    case Sagents.AgentSupervisor.get_pid(agent_id) do
      {:ok, pid} ->
        pid

      {:error, reason} ->
        raise "no agent process registered for #{inspect(agent_id)}: #{inspect(reason)}"
    end
  end
end
