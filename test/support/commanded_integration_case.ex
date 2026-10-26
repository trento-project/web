# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: GPL-3.0-or-later

defmodule Trento.CommandedIntegrationCase do
  @moduledoc """
  Runs a test against the real Commanded application, with a fresh event
  store. The tests cannot run asynchronously: the Commanded adapter is a
  global setting.
  """

  use ExUnit.CaseTemplate

  using do
    quote do
      use Trento.EventStoreCase, async: false
    end
  end

  setup do
    Application.put_env(:trento, Trento.Commanded, adapter: Trento.Commanded)

    on_exit(fn ->
      Application.put_env(:trento, Trento.Commanded, adapter: Trento.Commanded.Mock)
    end)
  end

  @doc """
  Waits for an eventually consistent read, such as an activity log entry.
  """
  def eventually(fun, attempts \\ 50) do
    case fun.() do
      result when result in [nil, false, []] and attempts > 0 ->
        Process.sleep(20)
        eventually(fun, attempts - 1)

      result ->
        result
    end
  end
end
