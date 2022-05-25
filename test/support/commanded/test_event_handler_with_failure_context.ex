defmodule TestEventHandlerWithFailureContext do
  @moduledoc """
  This module defines an event handler that fails.
  """

  use Commanded.Event.Handler,
    application: TestCommandedApp,
    name: __MODULE__

  use Trento.Support.EventHandlerFailureContext,
    max_retry: 1,
    retry_after: 1,
    skip: true,
    after_retry: fn _, %{reply_to: reply_to}, %{failures: failures} ->
      send(reply_to, {:retry, failures})

      :ok
    end,
    after_max_retries_reached: fn _, %{reply_to: reply_to}, _ ->
      send(reply_to, :max_retries_reached)

      :ok
    end

  def handle(%TestEvent{data: "error"}, _) do
    {:error, :reason}
  end
end
