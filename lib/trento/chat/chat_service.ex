defmodule Trento.Chat.ChatService do
  @moduledoc """
  Chat service that orchestrates Ollama LLM with MCP tools for Trento domain data access.
  """

  require Logger

  @doc """
  Process a chat request with the given prompt and conversation history.

  ## Parameters
    - `prompt`: The user's question or prompt
    - `history`: List of previous messages in the conversation (format: [%{"role" => "user"|"assistant", "content" => "..."}])
    - `opts`: Optional keyword list with:
      - `:model` - LLM model name (defaults to configured model)
      - `:timeout` - Request timeout in milliseconds (defaults to configured timeout)

  ## Returns
    - `{:ok, response}` - Success with AI response string
    - `{:error, reason}` - Error atom indicating failure reason
  """
  @spec chat(String.t(), [map], keyword) :: {:ok, String.t()} | {:error, atom}
  def chat(prompt, history \\ [], opts \\ []) do
    model = opts[:model] || default_model()
    timeout = opts[:timeout] || default_timeout()

    with {:ok, mcp_tools} <- fetch_mcp_tools(),
         ollama_tools <- transform_mcp_to_ollama_tools(mcp_tools),
         {:ok, response} <- call_ollama(prompt, history, model, ollama_tools, timeout) do
      {:ok, response}
    else
      {:error, :mcp_unavailable} ->
        Logger.warning("MCP server unavailable, proceeding without tools")
        # Graceful degradation: chat without tools
        call_ollama(prompt, history, model, [], timeout)

      {:error, reason} = error ->
        Logger.error("Chat request failed: #{inspect(reason)}")
        error
    end
  end

  # Fetch tools from MCP server
  defp fetch_mcp_tools do
    mcp_adapter().list_tools()
  end

  # Call Ollama LLM with prompt, history, and tools
  defp call_ollama(prompt, history, model, tools, timeout) do
    ollama_adapter().chat(prompt, history, model, tools, timeout)
  end

  # Transform MCP tool format to Ollama function calling format
  defp transform_mcp_to_ollama_tools(mcp_tools) do
    Enum.map(mcp_tools, fn tool ->
      %{
        "type" => "function",
        "function" => %{
          "name" => tool["name"],
          "description" => tool["description"],
          "parameters" => tool["inputSchema"]
        }
      }
    end)
  end

  defp default_model do
    Application.fetch_env!(:trento, __MODULE__)[:default_model]
  end

  defp default_timeout do
    Application.fetch_env!(:trento, __MODULE__)[:timeout]
  end

  defp ollama_adapter do
    Application.fetch_env!(:trento, Trento.Infrastructure.Ollama)[:adapter]
  end

  defp mcp_adapter do
    Application.fetch_env!(:trento, Trento.Infrastructure.Mcp)[:adapter]
  end
end
