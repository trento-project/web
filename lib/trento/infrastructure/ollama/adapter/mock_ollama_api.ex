defmodule Trento.Infrastructure.Ollama.MockOllamaApi do
  @moduledoc """
  Mocks Ollama API calls for testing
  """

  @behaviour Trento.Infrastructure.Ollama.Gen

  @impl true
  def chat(prompt, _history, _model, _tools, _timeout) do
    response = mock_response(prompt)
    {:ok, response}
  end

  @impl true
  def health_check do
    {:ok, %{"status" => "healthy", "version" => "0.1.0"}}
  end

  defp mock_response(prompt) do
    cond do
      String.contains?(String.downcase(prompt), "cluster") ->
        "Based on the current data, you have 3 Pacemaker clusters monitored by Trento. All clusters are in a healthy state."

      String.contains?(String.downcase(prompt), "host") ->
        "You have 12 hosts currently monitored. All hosts are passing their health checks."

      String.contains?(String.downcase(prompt), "sap") ->
        "Your SAP systems are running normally. There are 2 HANA databases and 3 SAP application servers."

      String.contains?(String.downcase(prompt), "hello") or
          String.contains?(String.downcase(prompt), "hi") ->
        "Hello! I'm the Trento AI assistant. I can help you with information about your clusters, hosts, and SAP systems."

      true ->
        "I'm a mock AI assistant. In production, I would provide detailed information about your Trento infrastructure."
    end
  end
end
