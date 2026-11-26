# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Checks.Events do
  @moduledoc """
  Behaviour and dispatcher for the events of the periodic checks executions.

  The default implementation is `Trento.Infrastructure.Checks.PubSubEvents`.
  """

  @doc """
  Subscribes the calling process to the events of the periodic checks executions.
  """
  @callback subscribe() :: :ok | {:error, term()}

  @doc """
  Publishes that the checks of a target were requested periodically.
  """
  @callback broadcast_execution_requested(:host | :cluster, String.t(), DateTime.t()) :: :ok

  def subscribe, do: impl().subscribe()

  def broadcast_execution_requested(target_type, target_id, requested_at),
    do: impl().broadcast_execution_requested(target_type, target_id, requested_at)

  defp impl, do: Application.fetch_env!(:trento, Trento.Checks)[:events_adapter]
end
