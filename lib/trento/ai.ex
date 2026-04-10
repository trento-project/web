defmodule Trento.AI do
  @moduledoc """
  The `Trento.AI` module provides functions to interact with the AI features of the Trento application.
  """

  alias Trento.AI.ApplicationConfigLoader

  alias Trento.AI.Configurations

  @doc """
  Checks if the AI features are enabled.
  """
  @spec enabled?() :: boolean()
  def enabled?,
    do: Keyword.get(ApplicationConfigLoader.load(), :enabled, false)

  @doc """
  Creates a user configuration for AI.

  See `Trento.AI.Configurations.create_user_configuration/2` for more details.
  """
  def create_user_configuration(user, attrs),
    do: configurations().create_user_configuration(user, attrs)

  @doc """
  Updates a user configuration for AI.

  See `Trento.AI.Configurations.update_user_configuration/2` for more details.
  """
  def update_user_configuration(user, attrs),
    do: configurations().update_user_configuration(user, attrs)

  defp configurations,
    do: Keyword.get(ApplicationConfigLoader.load(), :configurations, Configurations)
end
