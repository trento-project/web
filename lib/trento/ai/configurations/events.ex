# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.AI.Configurations.Events do
  @moduledoc """
  Behaviour + dispatcher for per-user AI configuration lifecycle events.

  The default production implementation is
  `Trento.Infrastructure.AI.PubSubConfigurationEvents`.
  """

  alias Trento.AI.ApplicationConfigLoader

  @doc """
  Subscribes the **calling process** to the given user's AI configuration
  lifecycle events.
  """
  @callback subscribe(non_neg_integer() | String.t()) :: :ok | {:error, term()}

  @doc """
  Broadcasts that the given user's AI configuration was created.
  """
  @callback broadcast_created(non_neg_integer()) :: :ok

  @doc """
  Broadcasts that the given user's AI configuration was cleared.
  """
  @callback broadcast_cleared(non_neg_integer()) :: :ok

  def subscribe(user_id), do: impl().subscribe(user_id)

  def broadcast_created(user_id), do: impl().broadcast_created(user_id)

  def broadcast_cleared(user_id), do: impl().broadcast_cleared(user_id)

  defp impl,
    do: Keyword.get(ApplicationConfigLoader.load(), :ai_configuration_events_adapter)
end
