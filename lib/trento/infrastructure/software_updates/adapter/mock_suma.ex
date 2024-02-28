defmodule Trento.Infrastructure.SoftwareUpdates.MockSuma do
  @moduledoc """
  Mocked SUMA Software updates discovery adapter
  """

  @behaviour Trento.SoftwareUpdates.Discovery.Gen

  @impl true
  def get_system_id(fully_qualified_domain_name),
    do:
      {:ok,
       fully_qualified_domain_name
       |> String.to_charlist()
       |> Enum.sum()}
end
