defmodule Trento.Infrastructure.Operations.AMQP.Processor do
  @moduledoc """
  AMQP processor for the operations events
  """

  @behaviour GenRMQ.Processor

  alias Trento.Contracts

  require Logger

  def process(%GenRMQ.Message{payload: payload} = message) do
    Logger.debug("Received message: #{inspect(message)}")

    case Contracts.from_event(payload) do
      {:ok, event} ->
        handle(event)

      {:error, reason} ->
        {:error, reason}
    end
  end

  defp handle(event) do
    Logger.debug("Handle event: #{inspect(event)}")
  end
end
