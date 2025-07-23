defmodule Trento.Correlations.CorrelationCase do
  @moduledoc false

  use ExUnit.CaseTemplate

  setup_all _ do
    # Mox.stub_with(
    #   Trento.ActivityLog.Correlations.Mock,
    #   Trento.Correlations.CorrelationStub
    # )

    Application.put_env(:trento, :correlations, Trento.Correlations.CorrelationStub)

    on_exit(fn ->
      Application.put_env(:trento, :correlations, Trento.ActivityLog.Correlations.Mock)
    end)

    :ok
  end

  # setup context do
  #   mocked_commanded =
  #     Map.get(context, :mocked_commanded, true)

  #   if not mocked_commanded do
  #     Application.put_env(:trento, Trento.Commanded, adapter: Trento.Commanded)

  #     on_exit(fn ->
  #       Application.put_env(:trento, Trento.Commanded, adapter: Trento.Commanded.Mock)
  #     end)
  #   end

  #   {:ok, context}
  # end
end
