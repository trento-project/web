defmodule Trento.Messaging.Adapters.AMQP.Consumer do
  @moduledoc """
  AMQP consumer.
  """

  @behaviour GenRMQ.Consumer

  require Logger

  @impl GenRMQ.Consumer
  def init do
    Application.fetch_env!(:trento, Trento.Messaging.Adapters.AMQP)[:consumer]
  end

  @spec start_link(any) :: {:error, any} | {:ok, pid}
  def start_link(_opts), do: GenRMQ.Consumer.start_link(__MODULE__, name: __MODULE__)

  @impl GenRMQ.Consumer
  def handle_message(%GenRMQ.Message{} = message) do
    Logger.info("Received message: #{inspect(message)}")
    GenRMQ.Consumer.ack(message)
  end

  @impl GenRMQ.Consumer
  def handle_error(%GenRMQ.Message{attributes: attributes, payload: payload} = message, reason) do
    Logger.error(
      "Rejecting message due to consumer task error: #{inspect(reason: reason, msg_attributes: attributes, msg_payload: payload)}"
    )

    GenRMQ.Consumer.reject(message, false)
  end

  @impl GenRMQ.Consumer
  def consumer_tag, do: "trento"

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
