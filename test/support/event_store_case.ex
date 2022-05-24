defmodule Trento.EventStoreCase do
  @moduledoc """
  This module defines the test case to be used by
  tests that require setting an event store.
  """

  use ExUnit.CaseTemplate

  setup do
    :ok = Application.stop(:trento)
    :ok = Application.stop(:commanded)
    :ok = Application.stop(:eventstore)

    config = Trento.EventStore.config()

    {:ok, conn} = Postgrex.start_link(config)
    EventStore.Storage.Initializer.reset!(conn, config)

    {:ok, _} = Application.ensure_all_started(:trento)

    {:ok, %{conn: conn}}
  end
end
