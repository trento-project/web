defmodule TrentoWeb.V1.ChatController do
  use TrentoWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias Trento.Chat.ChatService

  alias TrentoWeb.OpenApi.V1.Schema
  alias TrentoWeb.OpenApi.V1.Schema.Chat.ChatRequest
  alias TrentoWeb.OpenApi.V1.Schema.UnprocessableEntity

  plug OpenApiSpex.Plug.CastAndValidate
  action_fallback TrentoWeb.FallbackController

  operation :chat,
    summary: "Chat with Trento AI Assistant",
    tags: ["AI", "Chat"],
    description:
      "Send a conversational prompt to the Trento AI assistant. The assistant has access to Trento domain data via MCP tools and responds using an Ollama LLM. The client manages conversation history by sending previous messages in the history field.",
    request_body:
      {"Chat request with prompt and optional conversation history", "application/json",
       Schema.Chat.ChatRequest, required: true},
    responses: [
      ok:
        {"AI assistant response", "application/json", Schema.Chat.ChatResponse},
      request_timeout:
        {"Chat request timed out", "application/json", UnprocessableEntity},
      unprocessable_entity:
        {"Unable to process chat request", "application/json", UnprocessableEntity},
      service_unavailable:
        {"AI service unavailable", "application/json", UnprocessableEntity}
    ]

  def chat(conn, _params) do
    %ChatRequest{prompt: prompt, history: history} = conn.body_params

    case ChatService.chat(prompt, history || []) do
      {:ok, response} ->
        render(conn, :chat, response: response)

      {:error, :ollama_timeout} ->
        {:error, :chat_timeout}

      {:error, :ollama_unavailable} ->
        {:error, :ollama_unavailable}

      {:error, _reason} ->
        {:error, :chat_processing_error}
    end
  end
end
