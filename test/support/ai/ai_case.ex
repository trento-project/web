# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.AI.AICase do
  @moduledoc false

  use ExUnit.CaseTemplate

  alias Trento.AI.Agent, as: TrentoAIAgent
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
  """
  def real_sagents_adapters(context) do
    stub_ai_config(context,
      agent_supervisor_adapter: SagentsDynamicSupervisor,
      agent_server_adapter: SagentsAgentServer
    )
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

    Mox.stub(LLMBuilder.Mock, :build_for_user, fn _user_id -> {:ok, model} end)

    stub_ai_config(context, llm_builder_adapter: LLMBuilder.Mock)
  end

  @doc """
  Tears the thread's agent down once the test is over, through `Trento.AI.Agent.stop/1`.

  We need to re-stub the `ApplicationConfigLoader` mock in the teardown process because
  `Trento.AI.Agent.stop/1` calls both of its adapters, which are resolved through the config loader.

  Not doing so raises `Mox.UnexpectedCallError` because the teardown process is not the owner of the stub prepared in the test process.

  The config is therefore read in the test process, where the stub still answers,
  and carried into the exit closure which then owns it for the one call it makes.
  """
  def stop_agent_on_exit(agent_id) do
    config = ApplicationConfigLoader.load()

    on_exit(fn ->
      Mox.stub(ApplicationConfigLoader.Mock, :load_config, fn -> config end)

      TrentoAIAgent.stop(agent_id)
    end)
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

  defp stub_ai_config(context, overrides) do
    merged = Keyword.merge(Map.get(context, :ai_config_overrides, []), overrides)

    Mox.stub(ApplicationConfigLoader.Mock, :load_config, fn ->
      Keyword.merge(Application.get_env(:trento, :ai, []), merged)
    end)

    {:ok, ai_config_overrides: merged}
  end
end
