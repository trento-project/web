# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.AI.AICase do
  @moduledoc false

  use ExUnit.CaseTemplate

  alias Trento.AI.{ApplicationConfigLoader, FakeChatModel, LLMBuilder}
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
    Mox.stub_with(
      Trento.AI.ApplicationConfigLoader.Mock,
      Trento.AI.ApplicationConfigLoader
    )

    :ok
  end

  @doc """
  Swaps the AI config over to the real implementations for the duration of the
  test, so `Trento.AI.Agent` drives the actual sagents tree instead of the Mox
  doubles wired in `config/test.exs`.

  `:application_config_loader` goes back to the real module too, and that is
  what lets teardown call `Trento.AI.Agent.stop/1`: the Mox mock is `:private`
  and stubbed for the *test* process, while `on_exit` runs in a process of its own.
  """
  def real_sagents_adapters(_context) do
    ai = Application.get_env(:trento, :ai)

    Application.put_env(
      :trento,
      :ai,
      Keyword.merge(ai,
        application_config_loader: ApplicationConfigLoader,
        agent_supervisor_adapter: SagentsDynamicSupervisor,
        agent_server_adapter: SagentsAgentServer
      )
    )

    on_exit(fn -> Application.put_env(:trento, :ai, ai) end)
  end

  @doc """
  Makes `Trento.AI.LLMBuilder.build/1` return a `Trento.AI.FakeChatModel`.

  The model answers in the agent's run task and waits.

  - `{:llm_called, task_pid}` is emitted and the process that ran this setup can listen for it to know the run is genuinely in flight.
  - When released with a `send(task_pid, :release)`, the model returns whatever is in its `:reply` field.

  `@tag fake_llm: [reply: ["foo", "bar"]]` returns the stream of deltas
  `@tag fake_llm: [reply: {:error, reason}]` fails the run
  """
  def fake_llm(context) do
    model =
      context
      |> Map.get(:fake_llm, [])
      |> Keyword.put(:notify, self())
      |> then(&struct!(FakeChatModel, &1))

    ai = Application.get_env(:trento, :ai)

    Application.put_env(:trento, :ai, Keyword.put(ai, :llm_builder_adapter, LLMBuilder.Mock))

    on_exit(fn -> Application.put_env(:trento, :ai, ai) end)

    Mox.stub(LLMBuilder.Mock, :build_for_user, fn _user_id -> {:ok, model} end)

    :ok
  end

  @doc """
  Returns the pid of the running agent process for `agent_id`, failing the test
  when nothing is registered.

  The registry is the one piece of sagents with no `Trento.AI` port in front of
  it, so it is reached here once instead of at every assertion site.
  """
  def agent_pid!(agent_id) do
    assert {:ok, pid} = Sagents.AgentSupervisor.get_pid(agent_id)

    pid
  end
end
