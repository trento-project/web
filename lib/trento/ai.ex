defmodule Trento.AI do
  @moduledoc """
  The `Trento.AI` module provides functions to interact with the AI features of the Trento application.
  """

  alias Trento.AI.Configurations

  @doc """
  Checks if the AI features are enabled.
  """
  @spec enabled?() :: boolean()
  def enabled?,
    do:
      :trento
      |> Application.get_env(:ai, [])
      |> Keyword.get(:enabled, false)

  @doc """
  Creates a user configuration for AI.

  See `Trento.AI.Configurations.create_user_configuration/2` for more details.
  """
  def create_user_configuration(user, attrs) do
    execute_if_enabled(fn -> configurations().create_user_configuration(user, attrs) end)
  end

  @doc """
  Updates a user configuration for AI.

  See `Trento.AI.Configurations.update_user_configuration/2` for more details.
  """
  def update_user_configuration(user, attrs) do
    execute_if_enabled(fn -> configurations().update_user_configuration(user, attrs) end)
  end

  defp execute_if_enabled(function) do
    if enabled?() do
      function.()
    else
      {:error, :ai_features_disabled}
    end
  end

  defp configurations do
    :trento
    |> Application.get_env(:ai)
    |> Keyword.get(:configurations, Configurations)
  end
end
