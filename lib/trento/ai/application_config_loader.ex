defmodule Trento.AI.ApplicationConfigLoader do
  @moduledoc """
  This module is responsible for loading the AI application configuration and providing access to it.
  """

  @behaviour Trento.AI.ApplicationConfigLoader

  @callback load_config :: keyword()

  @impl true
  def load_config, do: Application.get_env(:trento, :ai, [])

  @spec load :: keyword()
  def load, do: impl().load_config()

  defp impl,
    do:
      :trento
      |> Application.get_env(:ai, [])
      |> Keyword.get(:application_config_loader, __MODULE__)
end
