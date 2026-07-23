# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Infrastructure.AI.PubSubConfigurationEvents do
  @moduledoc """
  Default `Trento.AI.Configurations.Events` implementation: per-user AI
  configuration lifecycle events carried over `Phoenix.PubSub`.
  """

  @behaviour Trento.AI.Configurations.Events

  @impl true
  def subscribe(user_id), do: Phoenix.PubSub.subscribe(Trento.PubSub, topic(user_id))

  @impl true
  def broadcast_created(user_id), do: broadcast(user_id, {:ai_configuration, :created})

  @impl true
  def broadcast_cleared(user_id), do: broadcast(user_id, {:ai_configuration, :cleared})

  @impl true
  def broadcast_updated(user_id, payload),
    do: broadcast(user_id, {:ai_configuration, :updated, payload})

  defp broadcast(user_id, message),
    do: Phoenix.PubSub.broadcast(Trento.PubSub, topic(user_id), message)

  defp topic(user_id), do: "ai_user_config:#{user_id}"
end
