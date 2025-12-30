defmodule Trento.Infrastructure.Mcp.McpClient do
  @moduledoc """
  MCP (Model Context Protocol) client adapter using JSON-RPC 2.0 over HTTP with SSE
  """

  require Logger

  @behaviour Trento.Infrastructure.Mcp.Gen

  @impl true
  def list_tools do
    # MCP requires session initialization before calling methods
    Logger.info("=== MCP list_tools: Starting ===")
    Logger.info("[AGENTIC LOOP] PHASE: Session Initialization")

    with {:ok, {session_id, init_result}} <- initialize_session() do
      Logger.info("MCP initialize successful, session_id: #{session_id}")
      Logger.debug("MCP initialize response: #{format_response_summary(init_result)}")

      case send_initialized_notification(session_id) do
        {:ok, _} ->
          Logger.info("[AGENTIC LOOP] PHASE: Session Ready")
          Logger.info("[AGENTIC LOOP] PHASE: Tool Discovery")

          case fetch_tools(session_id) do
            {:ok, tools} ->
              Logger.info("Successfully fetched #{length(tools)} tools from MCP")
              Logger.debug("MCP Tools: #{inspect(Enum.map(tools, fn t -> t["name"] end))}")
              Logger.info("=== MCP list_tools: Complete ===")
              {:ok, tools}

            {:error, reason} = error ->
              Logger.error("Failed to fetch tools: #{inspect(reason)}")
              error
          end

        {:error, reason} = error ->
          Logger.error("Failed to send initialized notification: #{inspect(reason)}")
          error
      end
    else
      {:error, reason} = error ->
        Logger.error("Failed to initialize MCP session: #{inspect(reason)}")
        error
    end
  end

  defp initialize_session do
    mcp_url = Application.fetch_env!(:trento, __MODULE__)[:url]

    request = %{
      "jsonrpc" => "2.0",
      "id" => generate_id(),
      "method" => "initialize",
      "params" => %{
        "protocolVersion" => "2024-11-05",
        
        "capabilities" => %{
          "tools" => %{}
        },
        "clientInfo" => %{
          "name" => "trento-web",
          "version" => "1.0.0"
        }
      }
    }

    Logger.debug("Sending MCP initialize request")

    case send_mcp_request_with_session(mcp_url, request, nil, 10_000) do
      {:ok, session_id, response} -> {:ok, {session_id, response}}
      {:error, reason} -> {:error, reason}
    end
  end

  defp send_initialized_notification(session_id) do
    mcp_url = Application.fetch_env!(:trento, __MODULE__)[:url]

    # This is a notification (no id, no response expected)
    request = %{
      "jsonrpc" => "2.0",
      "method" => "notifications/initialized"
    }

    Logger.debug("Sending MCP initialized notification with session #{session_id}")

    # For notifications, we just send and don't expect a meaningful response
    case send_mcp_request_with_session(mcp_url, request, session_id, 5_000) do
      {:ok, _session_id, response} ->
        Logger.debug("MCP initialized notification response: #{inspect(response)}")
        {:ok, :notified}

      {:error, reason} ->
        Logger.error("Failed to send notification: #{inspect(reason)}")
        {:error, reason}
    end
  end

  defp fetch_tools(session_id) do
    mcp_url = Application.fetch_env!(:trento, __MODULE__)[:url]

    request = %{
      "jsonrpc" => "2.0",
      "id" => generate_id(),
      "method" => "tools/list",
      "params" => %{}
    }

    Logger.debug("Fetching tools from MCP with session #{session_id}")

    with {:ok, _session_id, response} <- send_mcp_request_with_session(mcp_url, request, session_id, 10_000) do
      Logger.debug("MCP tools/list response: #{format_response_summary(response)}")
      extract_tools_from_response(response)
    end
  end

  @impl true
  def call_tool(tool_name, arguments) do
    Logger.info("=== MCP call_tool: #{tool_name} ===")
    Logger.info("[AGENTIC LOOP] PHASE: Session Initialization")
    Logger.debug("MCP call_tool arguments: #{format_response_summary(arguments)}")

    # Initialize session for tool call
    with {:ok, {session_id, _init_result}} <- initialize_session() do
      Logger.info("MCP call_tool session initialized: #{session_id}")

      case send_initialized_notification(session_id) do
        {:ok, _} ->
          Logger.info("[AGENTIC LOOP] PHASE: Session Ready")
          Logger.info("[AGENTIC LOOP] PHASE: Tool Execution - #{tool_name}")

          case execute_tool_call(session_id, tool_name, arguments) do
            {:ok, result} ->
              Logger.info("MCP call_tool #{tool_name} succeeded")
              Logger.debug("MCP call_tool result: #{format_response_summary(result)}")
              Logger.info("[AGENTIC LOOP] PHASE: Complete")
              Logger.info("=== MCP call_tool: Complete ===")
              {:ok, result}

            {:error, reason} = error ->
              Logger.error("MCP call_tool #{tool_name} failed: #{inspect(reason)}")
              error
          end

        {:error, reason} = error ->
          Logger.error("MCP call_tool notification failed: #{inspect(reason)}")
          error
      end
    else
      {:error, reason} = error ->
        Logger.error("MCP call_tool session initialization failed: #{inspect(reason)}")
        error
    end
  end

  defp execute_tool_call(session_id, tool_name, arguments) do
    mcp_url = Application.fetch_env!(:trento, __MODULE__)[:url]

    request = %{
      "jsonrpc" => "2.0",
      "id" => generate_id(),
      "method" => "tools/call",
      "params" => %{
        "name" => tool_name,
        "arguments" => arguments
      }
    }

    Logger.debug("MCP execute_tool_call for #{tool_name}")

    with {:ok, _session_id, response} <- send_mcp_request_with_session(mcp_url, request, session_id, 30_000),
         {:ok, result} <- extract_result_from_response(response) do
      {:ok, result}
    end
  end

  # Send a request to the MCP server with session handling
  defp send_mcp_request_with_session(mcp_url, request, session_id, timeout) do
    Logger.debug("MCP Request to #{mcp_url}/mcp")
    Logger.debug("MCP Request session_id: #{inspect(session_id)}")
    Logger.debug("MCP Request payload: #{inspect(request, pretty: true)}")

    headers =
      [
        {"Content-Type", "application/json"},
        {"Accept", "application/json, text/event-stream"}
      ] ++
        if session_id do
          [{"Mcp-Session-Id", session_id}]
        else
          []
        end

    Logger.debug("MCP Request headers: #{inspect(headers)}")

    with {:ok, json_body} <- Jason.encode(request),
         {:ok, %HTTPoison.Response{status_code: status_code, body: body, headers: response_headers}}
         when status_code in [200, 202] <-
           HTTPoison.post(
             "#{mcp_url}/mcp",
             json_body,
             headers,
             recv_timeout: timeout
           ) do
      Logger.debug("MCP Response status: #{status_code}")
      Logger.debug("MCP Response headers: #{inspect(response_headers)}")
      Logger.debug("MCP Response body: #{format_body_summary(body)}")

      # Extract session ID from response headers
      new_session_id =
        case List.keyfind(response_headers, "Mcp-Session-Id", 0) do
          {"Mcp-Session-Id", id} ->
            Logger.debug("MCP Response extracted session_id: #{id}")
            id
          _ ->
            Logger.debug("MCP Response no session_id in headers, keeping: #{inspect(session_id)}")
            session_id
        end

      # Handle empty body for 202 responses
      case body do
        "" ->
          Logger.debug("MCP server returned #{status_code} with empty body, treating as success")
          {:ok, new_session_id, %{"result" => %{}}}

        _ ->
          case parse_sse_response(body) do
            {:ok, response} ->
              Logger.debug("MCP Response parsed: #{format_response_summary(response)}")
              {:ok, new_session_id, response}
            {:error, reason} ->
              Logger.error("MCP Response parse error: #{inspect(reason)}")
              {:error, reason}
          end
      end
    else
      {:ok, %HTTPoison.Response{status_code: status_code, body: body}} ->
        Logger.error("MCP server error: status #{status_code}, body: #{inspect(body)}")
        {:error, :mcp_unavailable}

      {:error, %HTTPoison.Error{reason: :econnrefused}} ->
        Logger.warning("MCP server unavailable (connection refused)")
        {:error, :mcp_unavailable}

      {:error, %HTTPoison.Error{reason: :timeout}} ->
        Logger.warning("MCP server timeout")
        {:error, :mcp_unavailable}

      {:error, %HTTPoison.Error{reason: reason}} ->
        Logger.error("MCP HTTP request failed: #{inspect(reason)}")
        {:error, :mcp_unavailable}

      {:error, reason} = error ->
        Logger.error("Unexpected error calling MCP server: #{inspect(reason)}")
        error
    end
  end

  # Parse Server-Sent Events (SSE) response format
  # Format: "event: message\ndata: {json}\n\n"
  defp parse_sse_response(body) do
    # Split by double newline to get events
    events = String.split(body, "\n\n", trim: true)

    # Parse the first/only event (we expect one response per request)
    case events do
      [event | _] ->
        # Extract data line
        lines = String.split(event, "\n")
        data_line = Enum.find(lines, &String.starts_with?(&1, "data: "))

        case data_line do
          "data: " <> json_data ->
            Jason.decode(json_data)

          nil ->
            Logger.error("No data line found in SSE response: #{inspect(body)}")
            {:error, :invalid_sse_format}
        end

      [] ->
        Logger.error("Empty SSE response: #{inspect(body)}")
        {:error, :empty_response}
    end
  end

  defp extract_tools_from_response(%{"result" => %{"tools" => tools}}) when is_list(tools) do
    {:ok, tools}
  end

  defp extract_tools_from_response(%{"error" => error}) do
    Logger.error("MCP JSON-RPC error: #{inspect(error)}")
    {:error, :mcp_unavailable}
  end

  defp extract_tools_from_response(response) do
    Logger.error("Unexpected MCP response format: #{inspect(response)}")
    {:error, :mcp_unavailable}
  end

  defp extract_result_from_response(%{"result" => result}) do
    {:ok, result}
  end

  defp extract_result_from_response(%{"error" => error}) do
    Logger.error("MCP JSON-RPC error: #{inspect(error)}")
    {:error, :mcp_tool_error}
  end

  defp extract_result_from_response(response) do
    Logger.error("Unexpected MCP response format: #{inspect(response)}")
    {:error, :mcp_tool_error}
  end

  defp generate_id do
    :rand.uniform(1_000_000)
  end

  # Helper functions for formatting response summaries
  defp format_body_summary(""), do: "[empty]"
  defp format_body_summary(body) when is_binary(body) do
    size = byte_size(body)
    "[#{size} bytes]"
  end

  defp format_response_summary(%{"result" => result, "id" => id}) do
    "[result with id=#{id}, #{map_size_summary(result)}]"
  end

  defp format_response_summary(%{"result" => result}) do
    "[result: #{map_size_summary(result)}]"
  end

  defp format_response_summary(%{"error" => error}) do
    "[error: #{inspect(error)}]"
  end

  defp format_response_summary(%{"content" => content, "isError" => is_error}) do
    content_summary =
      case content do
        list when is_list(list) -> "#{length(list)} items"
        _ -> "#{map_size_summary(content)}"
      end
    "[content: #{content_summary}, isError: #{is_error}]"
  end

  defp format_response_summary(map) when is_map(map) do
    "[#{map_size_summary(map)}]"
  end

  defp format_response_summary(other) do
    "[#{inspect(other)}]"
  end

  defp map_size_summary(map) when is_map(map) do
    keys = Map.keys(map)
    case length(keys) do
      0 -> "empty map"
      1 -> "1 key: #{inspect(hd(keys))}"
      n -> "#{n} keys: #{inspect(keys)}"
    end
  end

  defp map_size_summary(list) when is_list(list) do
    "list with #{length(list)} items"
  end

  defp map_size_summary(_other), do: "value"
end
