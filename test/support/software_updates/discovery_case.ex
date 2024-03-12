defmodule Trento.SoftwareUpdates.DiscoveryCase do
  @moduledoc false

  use ExUnit.CaseTemplate

  setup _ do
    Mox.stub_with(
      Trento.SoftwareUpdates.Discovery.Mock,
      Trento.Infrastructure.SoftwareUpdates.MockSuma
    )

    :ok
  end
end
