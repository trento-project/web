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

  # How long `parked_llm_transport/1` keeps a request in flight, unless the test
  # overrides it with a `:park_for` tag.
  @park_for 5_000

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
  Replaces the LLM's HTTP hop with a plug that parks, keeping a run genuinely in
  flight until something cancels it.

  Callers that build their model through `Trento.AI.LLMBuilder` have no seam to
  hand a fake ChatModel to (see `Trento.AI.FakeChatModel` for the ones that do),
  so the seam sits one layer lower: a global Req default `:plug`, blocking in
  the calling process — the agent's run task.

  The park is bounded, so a cancel that fails to kill the task fails the test's
  own assertions instead of hanging CI; `:park_for` in the context overrides how
  long. Setting a global Req option is safe as long as the case is synchronous —
  ExUnit then never overlaps it with another test.
  """
  def parked_llm_transport(context) do
    test_pid = self()
    park_for = Map.get(context, :park_for, @park_for)
    previous_options = Req.default_options()

    Req.default_options(
      plug: fn conn ->
        send(test_pid, {:llm_request, self()})
        Process.sleep(park_for)
        Req.Test.json(conn, %{})
      end
    )

    on_exit(fn -> Req.default_options(previous_options) end)
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
end
