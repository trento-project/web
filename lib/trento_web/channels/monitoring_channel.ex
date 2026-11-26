# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule TrentoWeb.MonitoringChannel do
  @moduledoc """
  Monitoring CHannel
  """

  use TrentoWeb, :channel

  require Logger

  @impl true
  def join("monitoring:" <> resource_name, _payload, socket)
      when resource_name in ["hosts", "clusters"] do
    case Trento.Checks.subscribe_to_events() do
      :ok ->
        :ok

      error ->
        Logger.warning("Cannot subscribe to the periodic checks events: #{inspect(error)}")
    end

    {:ok, socket}
  end

  def join("monitoring:" <> _resource_name, _payload, socket), do: {:ok, socket}

  @impl true
  def handle_info(
        {:checks_execution_requested, target_type, target_id, requested_at},
        %{topic: topic} = socket
      ) do
    case {target_type, topic} do
      {:host, "monitoring:hosts"} ->
        push(socket, "host_checks_execution_requested", %{
          id: target_id,
          requested_at: requested_at
        })

      {:cluster, "monitoring:clusters"} ->
        push(socket, "cluster_checks_execution_requested", %{
          id: target_id,
          requested_at: requested_at
        })

      _ ->
        :ok
    end

    {:noreply, socket}
  end

  def handle_info(_message, socket), do: {:noreply, socket}
end
