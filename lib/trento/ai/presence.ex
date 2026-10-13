# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.AI.Presence do
  @moduledoc """
  Viewers of AI agent conversations. sagents stops an idle agent once its last viewer is gone.
  """

  use Phoenix.Presence,
    otp_app: :trento,
    pubsub_server: Trento.PubSub

  alias Trento.AI.ApplicationConfigLoader

  @viewer_check_delay :timer.seconds(60)

  @doc """
  The Presence topic sagents watches for `agent_id`'s viewers.
  """
  @spec viewers_topic(String.t()) :: String.t()
  def viewers_topic(agent_id), do: "ai_agent_viewers:#{agent_id}"

  @doc """
  Grace period after the last viewer leaves, so a client that rejoins in time keeps the agent.
  Set by `:viewer_check_delay` in the `:ai` application environment.
  """
  @spec viewer_check_delay() :: non_neg_integer()
  def viewer_check_delay,
    do: Keyword.get(ApplicationConfigLoader.load(), :viewer_check_delay, @viewer_check_delay)

  @doc """
  Tracks the calling process as a viewer of `agent_id`. Presence drops the viewer when the
  process exits, so tracking from the channel covers every way the client goes away.
  Tracking twice is a no-op.
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
  Untracks the calling process as a viewer of `agent_id`.
  """
  @spec untrack_viewer(String.t(), String.t()) :: :ok
  def untrack_viewer(agent_id, viewer_id),
    do: untrack(self(), viewers_topic(agent_id), viewer_id)
end
