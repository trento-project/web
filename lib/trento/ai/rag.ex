defmodule Trento.AI.RAG do
  @moduledoc false
  alias Trento.AI.Policy
  alias LangChain.Function
  require Logger

  def ask(question_str) do
    {:ok, answer, retrieved} = Arcana.ask(question_str, repo: Trento.RAGRepo)
    Logger.warning(inspect(retrieved))
    answer
  end

  def mcp_tool() do
    Function.new!(%{
      name: "ask",
      description:
        "Return JSON object of asked question after referring to the documents database via RAG.",
      parameters_schema: %{
        type: "object",
        properties: %{
          question: %{
            type: "string",
            description: "A simple question that can be answered by referring to the docs."
          }
        },
        required: ["question"]
      },
      function: fn %{"question" => question_str} = _args, %{user_id: user_id} = _context ->
        case Policy.is_authorized_call?(:ask, user_id) do
          true ->
            answer = ask(question_str)
            {:ok, Jason.encode!(answer)}

          false ->
            {:error, :unauthorized}
        end
      end
    })
  end
end
