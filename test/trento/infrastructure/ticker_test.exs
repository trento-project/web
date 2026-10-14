# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.Infrastructure.TickerTest do
  use ExUnit.Case, async: true

  import ExUnit.CaptureLog

  alias Trento.Infrastructure.Ticker

  def notify(pid), do: send(pid, :tick)

  def notify_and_raise(pid) do
    send(pid, :tick)
    raise "boom"
  end

  test "should call the function at every interval" do
    start_supervised!(
      {Ticker, name: :every_interval, interval: 10, mfa: {__MODULE__, :notify, [self()]}}
    )

    assert_receive :tick, 200
    assert_receive :tick, 200
  end

  test "should keep ticking when the function raises" do
    capture_log(fn ->
      start_supervised!(
        {Ticker, name: :raising, interval: 10, mfa: {__MODULE__, :notify_and_raise, [self()]}}
      )

      assert_receive :tick, 200
      assert_receive :tick, 200
    end)
  end

  test "should build children only for enabled tickers" do
    tickers = [
      enabled_ticker: [interval: 10, mfa: {__MODULE__, :notify, [self()]}],
      disabled_ticker: [interval: 10, mfa: {__MODULE__, :notify, [self()]}, enabled: false]
    ]

    assert [{Ticker, opts}] = Ticker.children(tickers)
    assert :enabled_ticker == Keyword.fetch!(opts, :name)
  end
end
