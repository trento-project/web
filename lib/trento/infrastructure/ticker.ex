# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Infrastructure.Ticker do
  @moduledoc """
  Calls a function at a fixed interval.

  Used for the periodic tasks that need a resolution under one minute,
  which Oban cron does not provide (for example the heartbeat check).
  Ticks are not persisted: a missed tick is simply skipped.
  """

  use GenServer, restart: :permanent

  require Logger

  @type option ::
          {:name, atom()}
          | {:interval, pos_integer()}
          | {:mfa, {module(), atom(), list()}}
          | {:enabled, boolean()}

  @doc """
  Builds the child specs of the enabled tickers from a keyword list of `name => options`.
  """
  @spec children(keyword(keyword())) :: [{module(), [option()]}]
  def children(tickers) do
    for {name, opts} <- tickers, Keyword.get(opts, :enabled, true) do
      {__MODULE__, opts |> Keyword.delete(:enabled) |> Keyword.put(:name, name)}
    end
  end

  def child_spec(opts) do
    %{id: Keyword.fetch!(opts, :name), start: {__MODULE__, :start_link, [opts]}}
  end

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: Keyword.fetch!(opts, :name))
  end

  @impl true
  def init(opts) do
    state = %{
      name: Keyword.fetch!(opts, :name),
      interval: Keyword.fetch!(opts, :interval),
      mfa: Keyword.fetch!(opts, :mfa)
    }

    schedule_tick(state)

    {:ok, state}
  end

  @impl true
  def handle_info(:tick, %{name: name, mfa: {module, function, args}} = state) do
    try do
      apply(module, function, args)
    rescue
      error ->
        Logger.error("Ticker #{name} failed: #{Exception.format(:error, error, __STACKTRACE__)}")
    end

    schedule_tick(state)

    {:noreply, state}
  end

  defp schedule_tick(%{interval: interval}), do: Process.send_after(self(), :tick, interval)
end
