defmodule TrentoWeb.OpenApi.V1.Schema.Chat do
  @moduledoc false

  require OpenApiSpex
  alias OpenApiSpex.Schema

  defmodule ChatMessage do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "ChatMessage",
      description: "A single message in the conversation history",
      type: :object,
      additionalProperties: false,
      properties: %{
        role: %Schema{
          type: :string,
          enum: ["user", "assistant"],
          description: "The role of the message sender",
          example: "user"
        },
        content: %Schema{
          type: :string,
          description: "The message content",
          example: "How many clusters are currently monitored?"
        }
      },
      required: [:role, :content],
      example: %{
        role: "user",
        content: "How many clusters are currently monitored?"
      }
    })
  end

  defmodule ChatRequest do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "ChatRequest",
      description: "Request to chat with Trento AI assistant",
      type: :object,
      additionalProperties: false,
      properties: %{
        prompt: %Schema{
          type: :string,
          description: "The user's question or prompt",
          example: "What is the health status of my HANA clusters?"
        },
        history: %Schema{
          type: :array,
          items: ChatMessage,
          description:
            "Previous conversation messages (stateless, client maintains history). Recommended maximum of 20 messages.",
          example: [
            %{role: "user", content: "List my clusters"},
            %{role: "assistant", content: "You have 3 HANA clusters monitored by Trento..."}
          ]
        }
      },
      required: [:prompt],
      example: %{
        prompt: "What is the health status of my HANA clusters?",
        history: []
      }
    })
  end

  defmodule ChatResponse do
    @moduledoc false

    OpenApiSpex.schema(%{
      title: "ChatResponse",
      description: "Response from Trento AI assistant",
      type: :object,
      additionalProperties: false,
      properties: %{
        response: %Schema{
          type: :string,
          description: "The AI assistant's response",
          example:
            "Based on the current data, you have 2 HANA clusters. Cluster 'prod-hana-01' has a 'passing' health status, and cluster 'dev-hana-01' also has a 'passing' status. All systems are operating normally."
        }
      },
      required: [:response],
      example: %{
        response:
          "Based on the current data, you have 2 HANA clusters with passing health status."
      }
    })
  end
end
