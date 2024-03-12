defmodule Trento.CommandedCase do
  @moduledoc false

  use ExUnit.CaseTemplate

  setup _ do
    Mox.stub(Trento.Commanded.Mock, :dispatch, fn _ -> :ok end)

    :ok
  end
end
