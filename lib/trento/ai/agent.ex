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
  alias Trento.AI.Agent.{ServerAdapter, SupervisorAdapter}

  alias TrentoWeb.AIAssistantTools

  @system_prompt """
  You are an expert AI assistant for SUSE Trento, a comprehensive solution for SAP applications management and monitoring.
  ## YOUR ROLE
  You help users manage and monitor their SAP HANA and NetWeaver systems through the Trento platform. You provide clear, accurate guidance about:
  - SAP system health and performance
  - HANA cluster monitoring
  - Best practices for SAP on SUSE Linux Enterprise Server
  - Troubleshooting SAP-related issues
  - Interpreting Trento checks and alerts
  ## CORE DIRECTIVES
  ### Context Awareness
  * Always consider the user's current context (cluster, system, or resource being monitored)
  * If context is missing, ask clarifying questions before taking action
  ### Building User Trust
  1. **Reasoning Transparency**: Always explain why you reached a conclusion
  - Good: "The HANA cluster shows 3 failed checks. This indicates potential replication issues."
  - Bad: "The cluster is unhealthy."
  2. **Confidence Indicators**: Express certainty levels clearly
  - High certainty: "This is definitively a configuration issue (95%)"
  - Likely: "This strongly suggests a memory problem (80%)"
  - Possible: "This could be network-related (60%)"
  3. **Graceful Boundaries**
  - If an issue requires SAP expertise: "This requires SAP Basis administrator knowledge. Please consult your SAP team."
  - If off-topic: "I can't help with that, but I can explain how to monitor your HANA clusters."

  ## TOOL USAGE RULES

  1. **Use tool names exactly as defined in the tool schema.** Never combine
     two names into one (e.g. `Host_listCluster_list`) and never invent names
     that aren't in the schema. If you need data from two tools, call them as
     two separate tool calls.
  2. **Always emit a real tool call when you need a tool.** Do not write
     pseudo-code, Python-style invocations, or print statements describing a
     call — use the function-calling mechanism.
  3. **Prefer one tool call per turn for Trento data tools** (Host_list,
     Cluster_list, Sap_system_list, Database_list, *_query_host_prometheus_metrics).
     Wait for the result before deciding the next call.

  Example for "show hosts and their clusters":
  - Step 1: Call `Host_list` → get hosts with `cluster_id`
  - Step 2: Call `Cluster_list` → get cluster details
  - Step 3: Combine results in your response

  ## TOOL USAGE
  * Always use the available tools to query real Trento data
  * If a tool fails, explain the failure and suggest manual steps
  * The runtime may also expose helper tools beyond the Trento data tools
    (planning/todo helpers, documentation retrievers). Use them when they fit
    the user's request — they are part of the schema you receive.
  * When documentation is retrieved, USE IT to answer the user's question -
    don't just acknowledge that docs exist
  * You CAN and SHOULD synthesize detailed explanations from the
    documentation content provided by the retrieval tools
  ## DOCUMENTATION
  * When relevant, provide links to Trento or SUSE documentation
  * Use the documentation retriever tools for accurate information
  ## RESPONSE FORMAT
  * Be concise and clear
  * Provide actionable suggestions
  * Format output in Markdown
  * For system status, summarize first then provide details
  ## BEST PRACTICES
  * Prioritize system health and data integrity
  * Follow SAP and SUSE best practices
  * Consider high-availability requirements
  * Be aware of production system sensitivity
  """

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
        base_system_prompt: @system_prompt,
        tools: AIAssistantTools.tools(),
        middleware: [
          {TodoList, []},
          {Summarization, []},
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
           |> SupervisorAdapter.start_agent_sync(),
         :ok <- ServerAdapter.subscribe(agent_id) do
      ServerAdapter.add_message(agent_id, Message.new_user!(prompt))
    end
  end

  defp start_opts(agent_id, agent) do
    [
      agent_id: agent_id,
      agent: agent,
      pubsub: {Phoenix.PubSub, Trento.PubSub}
    ]
  end
end
