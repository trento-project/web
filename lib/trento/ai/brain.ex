defmodule Trento.AI.Brain do
  alias LangChain.Chains.LLMChain
  alias LangChain.ChatModels.ChatGoogleAI
  alias LangChain.Message
  alias LangChain.MCP.Adapter
  alias LangChain.Utils.ChainResult

  def list_mcp_functions do
    # Supervisor.start_link([{Trento.AI.MCP, transport: {:streamable_http, base_url: "http://localhost:4002"}}], strategy: :one_for_one)

    # add patch to deps/langchain_mcp/lib/langchain_mcp/adapter.ex:210

    adapter =
      Adapter.new(
        client: Trento.AI.MCP,
        cache_tools: false,
        headers: %{
          "Authorization" =>
            "Bearer <GET A PERSONAL ACCESS TOKEN IF AUTHENTICATION IS ACTIVE>" # regenerate me when restarting this demo
        }
      )

    Adapter.to_functions(adapter)
  end

  def demo do
    # Use in chain
    {:ok, updated_chain} =
      LLMChain.new!(%{
        llm:
          ChatGoogleAI.new!(%{
            model: "gemini-2.5-flash",
            # model: "gemini-2.5-pro",
            # model: "gemini-3-flash-preview",
            # model: "gemini-3-pro-preview",
            api_key: "<GET A GOOGLE API KEY WITH ACCESS TO>",
            temperature: 0.1
            # temperature: 2.0
          })
      })
      |> LLMChain.add_tools(list_mcp_functions())
      |> LLMChain.add_message(
        Message.new_user!("How many hosts are there in my trento installation?")
      )
      |> LLMChain.run(mode: :while_needs_response)
      # |> IO.inspect(label: "LLMChain with MCP tools intermediate result")
      # |> LLMChain.run()

      ChainResult.to_string(updated_chain)

    # |> IO.inspect(label: "LLMChain with MCP tools response")
  end
end
