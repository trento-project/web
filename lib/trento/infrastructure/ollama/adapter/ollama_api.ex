defmodule Trento.Infrastructure.Ollama.OllamaApi do
  @moduledoc """
  Ollama API adapter for LLM interactions
  """

  require Logger

  @behaviour Trento.Infrastructure.Ollama.Gen

  @impl true
  def chat(prompt, history, model, tools, timeout) do
    Logger.info("Starting Ollama chat with model: #{model}")
    Logger.debug("User prompt: #{prompt}")
    Logger.debug("History: #{length(history)} previous messages")
    Logger.debug("Available tools: #{length(tools)}")

    messages = build_messages(prompt, history)

    # Start the agentic loop
    chat_loop(messages, model, tools, timeout, 0)
  end

  # Recursive function that handles the agentic loop
  # max_iterations prevents infinite loops
  defp chat_loop(messages, model, tools, timeout, iteration, max_iterations \\ 10)

  defp chat_loop(_messages, _model, _tools, _timeout, iteration, max_iterations)
       when iteration >= max_iterations do
    Logger.error("Agentic loop exceeded maximum iterations (#{max_iterations})")
    {:error, :max_iterations_exceeded}
  end

  defp chat_loop(messages, model, tools, timeout, iteration, max_iterations) do
    ollama_url = Application.fetch_env!(:trento, __MODULE__)[:url]

    request_body = %{
      "model" => model,
      "messages" => messages,
      "tools" => tools,
      "stream" => false,
      "options" => %{
        "temperature" => 0.7
      }
    }

    Logger.debug("Ollama iteration #{iteration + 1}: Sending request with #{length(messages)} message(s), #{length(tools)} tool(s)")
    Logger.debug("Ollama messages: #{inspect(messages, pretty: true, limit: :infinity)}")

    if length(tools) > 0 do
      Logger.debug("Ollama available tools: #{inspect(Enum.map(tools, fn t -> t["function"]["name"] end))}")
    end

    with {:ok, json_body} <- Jason.encode(request_body),
         {:ok, %HTTPoison.Response{status_code: 200, body: body}} <-
           HTTPoison.post(
             "#{ollama_url}/api/chat",
             json_body,
             [{"Content-Type", "application/json"}],
             recv_timeout: timeout
           ),
         {:ok, response_data} <- Jason.decode(body),
         {:ok, result} <- handle_ollama_response(response_data, messages, model, tools, timeout, iteration, max_iterations) do
      {:ok, result}
    else
      {:ok, %HTTPoison.Response{status_code: status_code, body: body}} ->
        Logger.error("Ollama API error: status #{status_code}, body: #{inspect(body)}")
        {:error, :ollama_api_error}

      {:error, %HTTPoison.Error{reason: :timeout}} ->
        Logger.error("Ollama API request timeout")
        {:error, :ollama_timeout}

      {:error, %HTTPoison.Error{reason: :econnrefused}} ->
        Logger.error("Ollama service unavailable (connection refused)")
        {:error, :ollama_unavailable}

      {:error, %HTTPoison.Error{reason: reason}} ->
        Logger.error("Ollama HTTP request failed: #{inspect(reason)}")
        {:error, :ollama_unavailable}

      {:error, %Jason.DecodeError{} = error} ->
        Logger.error("Failed to decode Ollama response: #{inspect(error)}")
        {:error, :ollama_api_error}

      {:error, reason} = error ->
        Logger.error("Unexpected error calling Ollama API: #{inspect(reason)}")
        error
    end
  end

  # Handle different types of Ollama responses
  defp handle_ollama_response(%{"message" => message}, messages, model, tools, timeout, iteration, max_iterations) do
    Logger.debug("Ollama response message: #{inspect(message, pretty: true)}")

    case message do
      # Case 1: Final text response (no tool calls)
      %{"content" => content} when is_binary(content) and not is_map_key(message, "tool_calls") ->
        Logger.info("Ollama returned final response: #{String.slice(content, 0, 100)}...")
        {:ok, content}

      # Case 2: Tool calls present - execute them and continue the loop
      %{"tool_calls" => tool_calls} when is_list(tool_calls) and length(tool_calls) > 0 ->
        Logger.info("Ollama requested #{length(tool_calls)} tool call(s) on iteration #{iteration + 1}")
        Logger.debug("Tool calls requested: #{inspect(tool_calls, pretty: true)}")

        # Add the assistant's message with tool calls to conversation
        updated_messages = messages ++ [message]

        # Execute all tool calls and get results
        {:ok, tool_results} = execute_tool_calls(tool_calls)

        Logger.debug("Tool results: #{inspect(tool_results, pretty: true, limit: :infinity)}")

        # Add tool results to conversation
        messages_with_results = updated_messages ++ tool_results

        Logger.debug("Updated conversation has #{length(messages_with_results)} messages, continuing to next iteration")

        # Continue the loop with updated messages
        chat_loop(messages_with_results, model, tools, timeout, iteration + 1, max_iterations)

      # Case 3: Empty or unexpected response
      _ ->
        Logger.error("Unexpected Ollama message format: #{inspect(message)}")
        {:error, :unexpected_response_format}
    end
  end

  defp handle_ollama_response(response_data, _messages, _model, _tools, _timeout, _iteration, _max_iterations) do
    Logger.error("Unexpected Ollama response structure: #{inspect(response_data)}")
    {:error, :unexpected_response_format}
  end

  # Execute all tool calls and return formatted results
  defp execute_tool_calls(tool_calls) do
    results =
      Enum.map(tool_calls, fn tool_call ->
        function = tool_call["function"]
        tool_name = function["name"]
        arguments = function["arguments"] || %{}

        Logger.info("Executing MCP tool: #{tool_name} with arguments: #{inspect(arguments)}")

        case mcp_adapter().call_tool(tool_name, arguments) do
          {:ok, result} ->
            # Format the tool result for Ollama
            {:ok,
             %{
               "role" => "tool",
               "content" => format_tool_result(result)
             }}

          {:error, reason} ->
            Logger.error("Failed to execute tool #{tool_name}: #{inspect(reason)}")

            {:ok,
             %{
               "role" => "tool",
               "content" => "Error executing tool: #{inspect(reason)}"
             }}
        end
      end)

    # Check if any tool execution failed critically (all are {:ok, ...} due to error handling above)
    {:ok, Enum.map(results, fn {:ok, result} -> result end)}
  end

  # Format MCP tool result into a string for Ollama
  defp format_tool_result(result) when is_binary(result), do: result
  defp format_tool_result(result) when is_map(result) or is_list(result) do
    case Jason.encode(result, pretty: true) do
      {:ok, json} -> json
      {:error, _} -> inspect(result)
    end
  end
  defp format_tool_result(result), do: inspect(result)

  defp mcp_adapter do
    Application.fetch_env!(:trento, Trento.Infrastructure.Mcp)[:adapter]
  end

  @impl true
  def health_check do
    ollama_url = Application.fetch_env!(:trento, __MODULE__)[:url]

    with {:ok, %HTTPoison.Response{status_code: 200, body: body}} <-
           HTTPoison.get(
             "#{ollama_url}/api/version",
             [{"Accept", "application/json"}],
             recv_timeout: 5_000
           ),
         {:ok, version_info} <- Jason.decode(body) do
      {:ok, Map.put(version_info, "status", "healthy")}
    else
      {:error, %HTTPoison.Error{reason: reason}} ->
        Logger.error("Ollama health check failed: #{inspect(reason)}")
        {:error, :ollama_unavailable}

      {:error, reason} = error ->
        Logger.error("Unexpected error during Ollama health check: #{inspect(reason)}")
        error
    end
  end

  defp build_messages(prompt, history) do
    # History should already be in the format [%{"role" => "user"|"assistant", "content" => "..."}]
    # Append the new user prompt
    history ++ [%{"role" => "user", "content" => prompt}]
  end
end
