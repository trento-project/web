# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

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

  @doc """
  Clears a user's AI configuration.

  See `Trento.AI.Configurations.clear_user_configuration/1` for more details.
  """
  def clear_user_configuration(user),
    do: configurations().clear_user_configuration(user)

  @doc """
  PubSub topic carrying per-user AI configuration lifecycle events.

  Every AI Assistant channel (one per browser tab) subscribes to this topic on
  join so it can react in real time to configuration changes made elsewhere
  (another tab, or a raw API call).
  """
  @spec ai_configuration_topic(non_neg_integer() | String.t()) :: String.t()
  def ai_configuration_topic(user_id), do: "ai_user_config:#{user_id}"

  @doc """
  Broadcasts that the given user's AI configuration was cleared, so all of the
  user's open AI Assistant channels can disable themselves.
  """
  @spec broadcast_ai_configuration_cleared(non_neg_integer()) :: :ok
  def broadcast_ai_configuration_cleared(user_id),
    do:
      Phoenix.PubSub.broadcast(
        Trento.PubSub,
        ai_configuration_topic(user_id),
        {:ai_configuration, :cleared}
      )

  @doc """
  Broadcasts that the given user's AI configuration was created, so all of the
  user's open AI Assistant channels can re-enable themselves.
  """
  @spec broadcast_ai_configuration_created(non_neg_integer()) :: :ok
  def broadcast_ai_configuration_created(user_id),
    do:
      Phoenix.PubSub.broadcast(
        Trento.PubSub,
        ai_configuration_topic(user_id),
        {:ai_configuration, :created}
      )

  defp configurations,
    do: Keyword.get(ApplicationConfigLoader.load(), :configurations, Configurations)
end
