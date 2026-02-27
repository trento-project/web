defmodule Trento.AI.Brain do
  require Logger
  alias Anubis.Client.Base
  alias LangChain.Chains.LLMChain
  alias LangChain.ChatModels.ChatGoogleAI
  alias LangChain.Function
  alias LangChain.Message
  alias LangChain.MCP.SchemaConverter
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

  def list_mcp_functions(client_ref) do
    case list_mcp_tools(client_ref) do
      {:ok, tools} ->
        Enum.map(tools, &tool_to_function(client_ref, &1))

      {:error, reason} ->
        Logger.error("Failed to list MCP tools: #{inspect(reason)}")
        []
    end
  end

  defp list_mcp_tools(client_ref), do: list_mcp_tools(client_ref, 3, 50)

  defp list_mcp_tools(client_ref, retries_left, delay_ms) when retries_left > 0 do
    case safe_list_tools(client_ref) do
      {:ok, %{result: result}} when is_map(result) ->
        {:ok, Map.get(result, "tools", [])}

      {:error, reason} ->
        if should_retry_mcp_call?(reason) and retries_left > 1 do
          maybe_restart_mcp_client(client_ref, reason)
          Process.sleep(delay_ms)
          list_mcp_tools(client_ref, retries_left - 1, delay_ms * 2)
        else
          {:error, reason}
        end
    end
  end

  defp list_mcp_tools(_client_ref, _retries_left, _delay_ms) do
    {:error, :list_tools_retry_exhausted}
  end

  defp safe_list_tools(client_ref) do
    try do
      Base.list_tools(client_ref, timeout: 30_000)
    catch
      :exit, reason -> {:error, %{reason: :client_call_exit, details: reason}}
    end
  end

  defp server_not_ready?(%{data: data}) when is_map(data) do
    data_message = Map.get(data, :message) || Map.get(data, "message") || ""
    is_binary(data_message) and String.contains?(data_message, "Server capabilities not set")
  end

  defp server_not_ready?(_error), do: false

  defp execute_tool_call(client_ref, tool_name, args),
    do: execute_tool_call(client_ref, tool_name, args, 3, 50)

  defp execute_tool_call(client_ref, tool_name, args, retries_left, delay_ms)
       when retries_left > 0 do
    tool_args = if is_map(args), do: args, else: %{}

    case safe_call_tool(client_ref, tool_name, tool_args) do
      {:ok, %{is_error: false, result: result}} ->
        normalize_tool_result(result)

      {:ok, %{is_error: true, result: result}} ->
        {:error, "MCP tool '#{tool_name}' returned error: #{inspect(result)}"}

      {:error, reason} when retries_left > 1 ->
        if should_retry_mcp_call?(reason) do
          maybe_restart_mcp_client(client_ref, reason)
          Process.sleep(delay_ms)
          execute_tool_call(client_ref, tool_name, tool_args, retries_left - 1, delay_ms * 2)
        else
          {:error, "MCP tool '#{tool_name}' failed: #{inspect(reason)}"}
        end

      {:error, reason} ->
        {:error, "MCP tool '#{tool_name}' failed: #{inspect(reason)}"}
    end
  end

  defp safe_call_tool(client_ref, tool_name, tool_args) do
    try do
      Base.call_tool(client_ref, tool_name, tool_args, timeout: 30_000)
    catch
      :exit, reason -> {:error, %{reason: :client_call_exit, details: reason}}
    end
  end

  defp should_retry_mcp_call?(%{reason: :internal_error} = error), do: server_not_ready?(error)

  defp should_retry_mcp_call?(%{reason: :send_failure, data: data}) when is_map(data) do
    original_reason = Map.get(data, :original_reason) || Map.get(data, "original_reason")
    original_reason in [:session_expired, :closed]
  end

  defp should_retry_mcp_call?(%{reason: :request_timeout}), do: true

  defp should_retry_mcp_call?(%{reason: :client_call_exit, details: details}),
    do: retryable_client_exit?(details)

  defp should_retry_mcp_call?(_), do: false

  defp retryable_client_exit?({:timeout, {GenServer, :call, _}}), do: true
  defp retryable_client_exit?({:noproc, {GenServer, :call, _}}), do: true
  defp retryable_client_exit?({:shutdown, _}), do: true
  defp retryable_client_exit?(reason) when reason in [:timeout, :noproc], do: true
  defp retryable_client_exit?(_), do: false

  defp maybe_restart_mcp_client(client_ref, reason) do
    if should_restart_mcp_client?(reason) do
      case GenServer.whereis(client_ref) do
        pid when is_pid(pid) ->
          Logger.warning(
            "Restarting MCP client #{inspect(client_ref)} after transient error: #{inspect(reason)}"
          )

          Process.exit(pid, :kill)
          :ok

        _ ->
          :ok
      end
    end
  end

  defp should_restart_mcp_client?(%{reason: :send_failure, data: data}) when is_map(data) do
    original_reason = Map.get(data, :original_reason) || Map.get(data, "original_reason")
    original_reason in [:session_expired, :closed]
  end

  defp should_restart_mcp_client?(%{reason: :client_call_exit, details: details}),
    do: retryable_client_exit?(details)

  defp should_restart_mcp_client?(_), do: false

  defp normalize_tool_result(%{"content" => content}) when is_list(content) do
    text_content =
      content
      |> Enum.filter(&(is_map(&1) and Map.get(&1, "type") == "text"))
      |> Enum.map(&Map.get(&1, "text"))
      |> Enum.filter(&is_binary/1)

    case text_content do
      [] -> inspect(content)
      parts -> Enum.join(parts, "\n")
    end
  end

  defp normalize_tool_result(%{content: content}) when is_list(content) do
    normalize_tool_result(%{"content" => content})
  end

  defp normalize_tool_result(result), do: inspect(result)

  defp mcp_tool_name(%{"name" => name}) when is_binary(name) and byte_size(name) > 0, do: name
  defp mcp_tool_name(_), do: nil

  defp mcp_tool_description(%{"description" => description}) when is_binary(description),
    do: description

  defp mcp_tool_description(_), do: "MCP tool"

  defp mcp_tool_parameters(%{"inputSchema" => input_schema}) when is_map(input_schema),
    do: SchemaConverter.to_parameters(input_schema)

  defp mcp_tool_parameters(_), do: []

  defp tool_to_function(client_ref, tool) do
    case mcp_tool_name(tool) do
      nil ->
        Function.new!(%{
          name: "invalid_mcp_tool",
          description: "Invalid MCP tool definition",
          parameters: [],
          function: fn _args, _context ->
            {:error, "Invalid MCP tool definition"}
          end,
          async: false
        })

      tool_name ->
        Function.new!(%{
          name: tool_name,
          description: mcp_tool_description(tool),
          parameters: mcp_tool_parameters(tool),
          function: fn args, _context -> execute_tool_call(client_ref, tool_name, args) end,
          async: false
        })
    end
  end

  def exec_system_prompt(client_ref) do
    try do
      chain =
        LLMChain.new!(%{
          llm:
            ChatGoogleAI.new!(%{
              model: "gemini-2.5-flash",
              # model: "gemini-2.5-pro",
              # model: "gemini-3-flash-preview",
              # model: "gemini-3-pro-preview",
              api_key: System.get_env("GEMINI_API_KEY"),
              temperature: 0.1
              # temperature: 2.0
            })
        })
        |> LLMChain.add_tools(list_mcp_functions(client_ref))
        |> LLMChain.add_message(Message.new_system!(@system_prompt))

      {:ok, chain}
    rescue
      error ->
        {:error, "Could not initialize AI chain: #{Exception.message(error)}"}
    catch
      :exit, reason ->
        {:error, "Could not initialize AI chain: #{inspect(reason)}"}
    end
  end

  def exec_user_prompt(prompt, current_chain, context \\ %{foo: "42"}) do
    try do
      # Use in chain
      case current_chain
           |> LLMChain.update_custom_context(context)
           |> LLMChain.add_message(Message.new_user!(prompt))
           |> LLMChain.run(mode: :while_needs_response) do
        {:ok, updated_chain} ->
          case ChainResult.to_string(updated_chain) do
            {:ok, string_response} ->
              {:ok, updated_chain, string_response}

            {:error, reason} ->
              {:error, "Could not render AI response: #{inspect(reason)}"}
          end

        {:error, reason} ->
          {:error, "Could not run AI request: #{inspect(reason)}"}
      end
    rescue
      error ->
        {:error, "Could not run AI request: #{Exception.message(error)}"}
    catch
      :exit, reason ->
        {:error, "Could not run AI request: #{inspect(reason)}"}
    end
  end

  def user_prompt() do
    "How many hosts are there in my trento installation?"
  end
end
