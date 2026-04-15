defmodule Trento.AI.AICase do
  @moduledoc false

  use ExUnit.CaseTemplate

  setup _ do
    stub_config_loader()

    :ok
  end

  def stub_config_loader do
    Mox.stub_with(
      Trento.AI.ApplicationConfigLoader.Mock,
      Trento.AI.ApplicationConfigLoader
    )
  end
end
