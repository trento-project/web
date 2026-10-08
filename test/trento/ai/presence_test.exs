# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.AI.PresenceTest do
  use ExUnit.Case, async: true

  import Trento.AI.AICase, only: [viewers: 1]

  alias Trento.AI.Presence

  setup do
    %{agent_id: "thread-#{Faker.UUID.v4()}"}
  end

  test "lists a tracked viewer on the agent's topic", %{agent_id: agent_id} do
    assert :ok = Presence.track_viewer(agent_id, "user-1")

    assert ["user-1"] == viewers(agent_id)
  end

  test "treats tracking the same viewer twice as done", %{agent_id: agent_id} do
    assert :ok = Presence.track_viewer(agent_id, "user-1")
    assert :ok = Presence.track_viewer(agent_id, "user-1")

    assert ["user-1"] == viewers(agent_id)
  end

  test "removes an untracked viewer", %{agent_id: agent_id} do
    :ok = Presence.track_viewer(agent_id, "user-1")

    assert :ok = Presence.untrack_viewer(agent_id, "user-1")

    assert [] == viewers(agent_id)
  end

  test "removes the viewer once its process exits", %{agent_id: agent_id} do
    :ok = Phoenix.PubSub.subscribe(Trento.PubSub, Presence.viewers_topic(agent_id))

    # Stands in for the channel process: it tracks itself, then exits.
    {:ok, viewer} = Agent.start(fn -> :ok = Presence.track_viewer(agent_id, "user-1") end)
    assert ["user-1"] == viewers(agent_id)

    :ok = Agent.stop(viewer)

    assert_receive %{event: "presence_diff", payload: %{leaves: %{"user-1" => _}}}
    assert [] == viewers(agent_id)
  end
end
