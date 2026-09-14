# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.AI.Agent do
  @moduledoc """
  Factory + lifecycle entrypoint for the Trento AI Assistant agent.

  `run/3` is the single side-effecting entrypoint: it builds the agent,
  ensures the per-thread `Sagents.AgentServer` is running, subscribes the
  **calling process** to the agent's `{:agent, ...}` event stream, and
  sends the user prompt. Since sagents 0.8.0 those events are delivered by
  monitored direct `send/2` from the AgentServer rather than broadcast over
  `Phoenix.PubSub`; the payload shapes are unchanged, but the stream is now
  bound to the subscriber's pid, which is why `run/3` hands the server pid
  back for the caller to monitor. Callers (the Phoenix
  channel) only deal with trento-domain arguments + the AG-UI events that
  arrive in their mailbox; `Sagents` and `LangChain` are implementation
  details of this module.

  `new!/1` is the pure factory (no side effects). Useful for tests that
  want to inspect the configured agent.
  """

  alias LangChain.Message
  alias Sagents.Middleware.{PatchToolCalls, Summarization, TodoList}
  alias Trento.AI.Agent.Server, as: AgentServer
  alias Trento.AI.Agent.Supervisor, as: AgentSupervisor
  alias Trento.AI.{ApplicationConfigLoader, ToolsRegistry}

  @doc """
  Pure factory for a Sagents.Agent struct configured as the Trento AI Assistant.

  Accepted `opts`:

  - `:agent_id`, `:model`, `:scope` — required (see Sagents docs).
  - `:tool_context` — optional map set verbatim on the Sagents agent's
    `tool_context` field. Sagents propagates this into the per-call
    `context.tool_context` map that tool function closures receive.
    Used to forward request-scoped data (e.g. the websocket user's JWT)
    to tools that need it, without polluting `:scope`.
  """
  @spec new!(keyword()) :: Sagents.Agent.t()
  def new!(opts) do
    tool_context = Keyword.get(opts, :tool_context, %{})

    Sagents.Agent.new!(
      %{
        agent_id: Keyword.fetch!(opts, :agent_id),
        model: Keyword.fetch!(opts, :model),
        scope: Keyword.fetch!(opts, :scope),
        tool_context: tool_context,
        base_system_prompt: load_base_system_prompt(),
        tools: ToolsRegistry.tools(tool_context),
        # see https://github.com/sagents-ai/sagents#provided-middleware
        middleware: [
          # Task management with write_todos tool for tracking multi-step work
          {TodoList, []},
          # Automatic conversation compression when token limits approach
          {Summarization, []},
          # Fix dangling tool calls from interrupted conversations
          {PatchToolCalls, []}
        ]
      },
      replace_default_middleware: true
    )
  end

  @doc """
  Ensure the agent for `:agent_id` is running, subscribe the calling
  process to its event stream, and send the user prompt. Returns
  `{:ok, server_pid}` — the `Sagents.AgentServer` process now publishing to
  the caller — or the first `{:error, reason}` from the start/subscribe/send
  chain. `{:error, :registry_unavailable}` among them: this node's sagents tree
  is already down, which happens while the BEAM drains and the endpoint is
  still serving.

  Callers are expected to monitor `server_pid`. Since sagents 0.8.0 the
  subscription is bound to the subscriber's pid, and the agent child is
  `restart: :transient`, so a server crash detaches the caller from the event
  stream for good: the restarted process has a different pid and no longer
  knows about us. The `monitor_ref` sagents hands back from `subscribe/1` is
  *its* monitor of the subscriber, not ours of it, so it cannot be used for
  this.
  """
  @spec run(Sagents.Agent.t(), String.t(), keyword()) :: {:ok, pid()} | {:error, term()}
  def run(%Sagents.Agent{agent_id: agent_id} = maybe_new_agent, prompt, opts \\ []) do
    refresh_when = Keyword.get(opts, :refresh_when, &default_refresh_when/2)

    with {:ok, _} <-
           agent_id
           |> start_opts(maybe_new_agent)
           |> AgentSupervisor.start_agent_sync(),
         :ok <- maybe_refresh_agent(agent_id, maybe_new_agent, refresh_when),
         {:ok, server_pid, _monitor_ref} <- AgentServer.subscribe(agent_id),
         :ok <- AgentServer.add_message(agent_id, Message.new_user!(prompt)) do
      {:ok, server_pid}
    end
  end

  @doc """
  Stops the running agent for `agent_id`, terminating any in-flight run.

  It cancels in-flight runs first, then stops the agent process.

  This is faster than only stopping the agent, because `Sagents.AgentServer.terminate/2`
  waits for the running task to finish (up to 25s) before the process exits.

  Best-effort — the cancel result is discarded and the supervisor's result is
  returned verbatim (`{:error, term()}` when no agent is running for the id).
  """
  @spec stop(String.t()) :: :ok | {:error, term()}
  def stop(agent_id) do
    cancel(agent_id)
    AgentSupervisor.stop_agent(agent_id)
  end

  @doc """
  Cancels the in-flight run for `agent_id`, keeping the agent process and its
  conversation state alive.

  Best-effort — returns `{:error, reason}` when nothing is running for the id.
  """
  @spec cancel(String.t()) :: :ok | {:error, term()}
  def cancel(agent_id) do
    AgentServer.cancel(agent_id)
  catch
    # Since sagents 0.12 `AgentServer.cancel/1` guards its own `GenServer.call`
    # and names the cases that used to exit here — nothing registered for
    # `agent_id`, a reply outliving the 5s default, the server dying mid-call —
    # as `{:error, :agent_not_running}`. This clause is the backstop for the
    # adapter boundary: `agent_server_adapter` is configurable, and an exit
    # signal must not take the caller down with it.
    :exit, reason -> {:error, reason}
  end

  # Refreshing the stored agent is best effort: there may be no agent process to
  # read from yet, `refresh_when` may answer `:noop`, and a failed write leaves
  # the previous configuration in place — none of that should stop the prompt
  # from being sent.
  #
  # `{:error, :registry_unavailable}` is the one outcome that has to travel. The
  # node's sagents tree is gone, so `subscribe/1` and `add_message/2` would fail
  # right after; better to end the run with a reason than to send a prompt no
  # one can answer.
  defp maybe_refresh_agent(agent_id, maybe_new_agent, refresh_when) do
    with {:ok, current_agent} <- AgentServer.get_agent(agent_id),
         {:ok, updated_agent} <- refresh_when.(current_agent, maybe_new_agent) do
      update_agent(agent_id, updated_agent)
    else
      {:error, :registry_unavailable} = error -> error
      _ -> :ok
    end
  end

  defp default_refresh_when(_current_agent, _new_agent), do: :noop

  defp update_agent(agent_id, updated_agent) do
    with %{state: current_state} <- AgentServer.get_info(agent_id),
         :ok <- AgentServer.update_agent_and_state(agent_id, updated_agent, current_state) do
      :ok
    else
      {:error, :registry_unavailable} = error -> error
      _ -> :ok
    end
  end

  defp start_opts(agent_id, agent) do
    [
      agent_id: agent_id,
      agent: agent,
      # Presence wiring only: sagents keeps just the name half of this tuple
      # (as `pubsub_name`) and reads it at a single call site, to subscribe the
      # AgentServer to `Phoenix.Presence` diffs — and only when the separate
      # `:presence_tracking` option is also set. Trento sets no presence options,
      # so this is inert today. Agent events reach subscribers via direct `send/2`.
      pubsub: {Phoenix.PubSub, Trento.PubSub}
    ]
  end

  defp load_base_system_prompt do
    ApplicationConfigLoader.load()
    |> Keyword.fetch!(:base_system_prompt)
    |> File.read!()
  end
end
