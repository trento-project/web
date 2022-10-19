defmodule Trento.Messaging.Adapters.AMQP.Publisher do
  @moduledoc """
  AMQP publisher.
  """

  alias Trento.Contracts

  @behaviour GenRMQ.Publisher

  require Logger

  def init do
    Application.fetch_env!(:trento, Trento.Messaging.Adapters.AMQP)[:publisher]
  end

  def start_link(_opts), do: GenRMQ.Publisher.start_link(__MODULE__, name: __MODULE__)

  def publish_message(message, routing_key \\ "") do
    Logger.info("Publishing message #{inspect(message)}")

    GenRMQ.Publisher.publish(__MODULE__, message, routing_key, [
      {:content_type, Contracts.content_type()}
    ])
  end

  def child_spec(opts) do
    %{
      id: __MODULE__,
      start: {__MODULE__, :start_link, [opts]},
      type: :worker,
      restart: :permanent,
      shutdown: 500
    }
  end
end
