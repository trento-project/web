defmodule Trento.CommandedCase do
  @moduledoc false

  use ExUnit.CaseTemplate

  setup _ do
    Mox.stub(Trento.Commanded.Mock, :dispatch, fn _ -> :ok end)

    :ok
  end

  setup context do
    mocked_commanded =
      Map.get(context, :mocked_commanded, true)

    if not mocked_commanded do
      Application.put_env(:trento, Trento.Commanded, adapter: Trento.Commanded)

      on_exit(fn ->
        Application.put_env(:trento, Trento.Commanded, adapter: Trento.Commanded.Mock)
      end)
    end

    {:ok, context}
  end
end
