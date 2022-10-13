defmodule Trento.Messaging.Adapters.AMQP do
  @moduledoc """
  AMQP adapter
  """

  @behaviour Trento.Messaging.Adapters.Behaviour

  alias Trento.Messaging.Adapters.AMQP.Publisher

  require Logger

  @impl true
  def publish(routing_key, message) do
    Publisher.publish_message(message, routing_key)
  end

  @impl true
  def handle_event(message) do
    Logger.info("Received message: #{inspect(message)}")
    :ok
  end
end
