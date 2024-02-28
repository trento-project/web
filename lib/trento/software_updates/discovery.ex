defmodule Trento.SoftwareUpdates.Discovery do
  @moduledoc """
  Software updates integration service
  """

  @behaviour Trento.SoftwareUpdates.Discovery.Gen

  @impl true
  def get_system_id(fully_qualified_domain_name),
    do: adapter().get_system_id(fully_qualified_domain_name)

  @impl true
  def get_relevant_patches(system_id),
    do: adapter().get_relevant_patches(system_id)

  defp adapter, do: Application.fetch_env!(:trento, __MODULE__)[:adapter]
end
