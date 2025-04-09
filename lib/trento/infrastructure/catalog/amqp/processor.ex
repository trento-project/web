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

    with {:ok, event} <- Contracts.from_event(payload),
         {:ok, attributes} <- Contracts.attributes_from_event(payload) do
      ActivityLogger.log_activity(%{
        queue_event: event,
        metadata: %{
          user_id:
            attributes
            |> Map.get("user_id", {:ce_integer, nil})
            |> elem(1)
        }
      })
    end
  end
end
