# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.AI.Agent do
  @moduledoc """
  Factory + lifecycle entrypoint for the Trento AI Assistant agent.

  `run/1` is the single side-effecting entrypoint: it builds the agent,
  ensures the per-thread `Sagents.AgentServer` is running, subscribes the
  **calling process** to the agent's `{:agent, ...}` PubSub stream, and
  sends the user prompt. Callers (the Phoenix channel) only deal with
  trento-domain arguments + the AG-UI events that arrive in their mailbox;
  `Sagents` and `LangChain` are implementation details of this module.

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
  """
  @spec new!(keyword()) :: Sagents.Agent.t()
  def new!(opts) do
    Sagents.Agent.new!(
      %{
        agent_id: Keyword.fetch!(opts, :agent_id),
        model: Keyword.fetch!(opts, :model),
        scope: Keyword.fetch!(opts, :scope),
        base_system_prompt: load_base_system_prompt(),
        tools: ToolsRegistry.tools(),
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
  process to its event stream, and send the user prompt. Returns `:ok`
  or the first `{:error, reason}` from the start/subscribe/send chain.
  """
  @spec run(Sagents.Agent.t(), String.t()) :: :ok | {:error, term()}
  def run(%Sagents.Agent{agent_id: agent_id} = agent, prompt) do
    with {:ok, _} <-
           agent_id
           |> start_opts(agent)
           |> AgentSupervisor.start_agent_sync(),
         :ok <- AgentServer.subscribe(agent_id) do
      AgentServer.add_message(agent_id, Message.new_user!(prompt))
    end
  end

  defp start_opts(agent_id, agent) do
    [
      agent_id: agent_id,
      agent: agent,
      pubsub: {Phoenix.PubSub, Trento.PubSub}
    ]
  end

  defp load_base_system_prompt do
    ApplicationConfigLoader.load()
    |> Keyword.fetch!(:base_system_prompt)
    |> File.read!()
  end
end
