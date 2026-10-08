# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.AI.Presence do
  @moduledoc """
  Tracks who is viewing an AI agent's conversation. sagents stops an idle
  agent once its last viewer is gone, see `track_viewer/2`.
  """

  use Phoenix.Presence,
    otp_app: :trento,
    pubsub_server: Trento.PubSub

  @doc """
  The Presence topic sagents watches for `agent_id`'s viewers.
  """
  @spec viewers_topic(String.t()) :: String.t()
  def viewers_topic(agent_id), do: "ai_agent_viewers:#{agent_id}"

  @doc """
  Registers the calling process as a viewer of `agent_id`'s conversation.

  sagents stops an idle agent once it has no viewer left, after a grace period
  that lets a reconnecting client pick the conversation up again. A viewer is
  dropped when its process exits, so tracking from the channel process covers
  every way the client can go away. Tracking the same viewer twice is a no-op.
  """
  @spec track_viewer(String.t(), String.t()) :: :ok | {:error, term()}
  def track_viewer(agent_id, viewer_id) do
    case track(self(), viewers_topic(agent_id), viewer_id, %{}) do
      {:ok, _ref} -> :ok
      {:error, {:already_tracked, _pid, _topic, _key}} -> :ok
      {:error, _reason} = error -> error
    end
  end

  @doc """
  Removes the calling process as a viewer of `agent_id`'s conversation.
  """
  @spec untrack_viewer(String.t(), String.t()) :: :ok
  def untrack_viewer(agent_id, viewer_id),
    do: untrack(self(), viewers_topic(agent_id), viewer_id)
end
