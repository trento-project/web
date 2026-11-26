# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Infrastructure.Checks.PubSubEvents do
  @moduledoc """
  Default `Trento.Checks.Events` implementation: the events of the periodic checks
  executions carried over `Phoenix.PubSub`.
  """

  @behaviour Trento.Checks.Events

  @topic "checks_executions"

  @impl true
  def subscribe, do: Phoenix.PubSub.subscribe(Trento.PubSub, @topic)

  @impl true
  def broadcast_execution_requested(target_type, target_id, requested_at),
    do:
      Phoenix.PubSub.broadcast(
        Trento.PubSub,
        @topic,
        {:checks_execution_requested, target_type, target_id, requested_at}
      )
end
