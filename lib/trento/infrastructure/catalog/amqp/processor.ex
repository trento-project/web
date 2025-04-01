defmodule Trento.Infrastructure.Catalog.AMQP.Processor do
  @moduledoc """
  AMQP processor for the operations events
  """

  @behaviour GenRMQ.Processor

  alias Trento.Contracts

  alias Trento.ActivityLog.ActivityLogger

  require Logger

  def process(%GenRMQ.Message{payload: payload} = message) do
    Logger.debug("Received message: #{inspect(message)}")

    case Contracts.from_event(payload) do
      {:ok, event} ->
        ActivityLogger.log_activity(%{queue_event: event})

      {:error, reason} ->
        {:error, reason}
    end
  end
end
