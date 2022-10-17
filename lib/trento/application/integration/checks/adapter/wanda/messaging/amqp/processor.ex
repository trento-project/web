defmodule Trento.Integration.Checks.Wanda.Messaging.AMQP.Processor do
  @moduledoc """
  AMQP processor.
  """

  @behaviour GenRMQ.Processor

  require Logger

  def process(%GenRMQ.Message{} = message) do
    Logger.info("Received message: #{inspect(message)}")
    :ok
  end
end
