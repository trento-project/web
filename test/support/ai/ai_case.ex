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
    put_ai_env(
      application_config_loader: ApplicationConfigLoader,
      agent_supervisor_adapter: SagentsDynamicSupervisor,
      agent_server_adapter: SagentsAgentServer
    )
  end

  @doc """
  Makes `Trento.AI.LLMBuilder.build/1` hand out a `Trento.AI.FakeChatModel`,
  so a run driven by the real sagents stack never leaves the VM.

  The model answers in the agent's run task and parks there, which is what lets
  an integration test hold a run genuinely in flight — the only state in which
  `Trento.AI.Agent.cancel/1` does anything — and then end it on demand with
  `send(task_pid, :release)`. `{:llm_called, task_pid}` lands in the process
  that ran this setup.

  A `Mox.stub` — not an expect — and always the same struct: the channel
  rebuilds the model on every prompt and compares it with the running agent's,
  so handing back an equal one is what keeps a re-prompt from swapping the
  agent's model.
  """
  def fake_llm(_context) do
    model = %FakeChatModel{notify: self()}

    put_ai_env(llm_builder_adapter: LLMBuilder.Mock)

    Mox.stub(LLMBuilder.Mock, :build_for_user, fn _user_id -> {:ok, model} end)

    :ok
  end

  @doc """
  Expects the pair of `Trento.AI.Agent.Server` calls that every successful
  `Trento.AI.Agent.run/3` ends with.

  Kept in one place because it is the sagents-facing part of the contract: a
  change in what `subscribe/1` returns is a change here, not in every test that
  merely needs a run to start.
  """
  def expect_agent_subscription do
    Mox.expect(Trento.AI.Agent.Server.Mock, :subscribe, fn _agent_id -> :ok end)
    Mox.expect(Trento.AI.Agent.Server.Mock, :add_message, fn _agent_id, _message -> :ok end)
  end

  @doc """
  Lets `Trento.AI.Agent.run/3` reach `add_message/2` against a *fresh* agent:
  nothing is running yet, so `refresh_when` never fires.

  For tests about what a run does once started, not about the start itself —
  those expect `start_agent_sync/1` and `get_agent/1` themselves.
  """
  def stub_agent_run do
    Mox.stub(Trento.AI.Agent.Server.Mock, :get_agent, fn _agent_id -> {:error, :not_found} end)

    expect_agent_subscription()
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

  defp put_ai_env(overrides) do
    ai = Application.get_env(:trento, :ai)

    Application.put_env(:trento, :ai, Keyword.merge(ai, overrides))

    on_exit(fn -> Application.put_env(:trento, :ai, ai) end)
  end
end
