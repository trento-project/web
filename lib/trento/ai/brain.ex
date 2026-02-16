defmodule Trento.AI.Brain do
  alias LangChain.Chains.LLMChain
  alias LangChain.ChatModels.ChatGoogleAI
  alias LangChain.Message
  alias LangChain.MCP.Adapter
  alias LangChain.Utils.ChainResult

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

  ## TOOL USAGE
  * Always use the available MCP tools to query real Trento data
  * If a tool fails, explain the failure and suggest manual steps
  * Use use_documentation_retriever tools for ANY documentation questions
  * When documentation is retrieved, USE IT to answer the user's question - don't just acknowledge that docs exist
  * You CAN and SHOULD synthesize detailed explanations from the documentation content provided by the retrieval tools

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

  def list_mcp_functions do
    # Supervisor.start_link([{Trento.AI.MCP, transport: {:streamable_http, base_url: "http://localhost:4002"}}], strategy: :one_for_one)

    # add patch to deps/langchain_mcp/lib/langchain_mcp/adapter.ex:210

    adapter =
      Adapter.new(
        client: Trento.AI.MCP,
        cache_tools: true
      )

    Adapter.to_functions(adapter)
  end

  def exec_system_prompt() do
    # Use in chain
    {:ok, updated_chain} =
      LLMChain.new!(%{
        llm:
          ChatGoogleAI.new!(%{
            model: "gemini-2.5-flash",
            # model: "gemini-2.5-pro",
            # model: "gemini-3-flash-preview",
            # model: "gemini-3-pro-preview",
            api_key: System.get_env("GOOGLE_GEMINI_SECRET_KEY"),
            temperature: 0.1
            # temperature: 2.0
          })
      })
      |> LLMChain.add_tools(list_mcp_functions())
      |> LLMChain.add_message(Message.new_system!(@system_prompt))
      |> LLMChain.run(mode: :while_needs_response)

    # |> IO.inspect(label: "LLMChain with MCP tools intermediate result")
    # |> LLMChain.run()

    # ChainResult.to_string(updated_chain)}
    {:ok, updated_chain, "42"}

    # |> IO.inspect(label: "LLMChain with MCP tools response")
  end

  def exec_user_prompt(prompt, current_chain) do
    # Use in chain
    {:ok, updated_chain} =
      current_chain
      |> LLMChain.update_custom_context(%{foo2: 1})
      |> LLMChain.add_tools(list_mcp_functions())
      |> LLMChain.add_message(Message.new_user!(prompt))
      |> LLMChain.run(mode: :while_needs_response)

    {:ok, updated_chain, ChainResult.to_string(updated_chain)}
    # |> IO.inspect(label: "LLMChain with MCP tools intermediate result")
    # |> LLMChain.run()

    # {:ok, updated_chain, ChainResult.to_string(updated_chain)}

    # |> IO.inspect(label: "LLMChain with MCP tools response")
  end

  def user_prompt() do
    "How many hosts are there in my trento installation?"
  end
end
