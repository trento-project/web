defmodule Trento.Infrastructure.Messaging.Adapter.AMQP do
  @moduledoc """
  AMQP adapter
  """

  @behaviour Trento.Infrastructure.Messaging.Adapter.Gen

  require Logger

  @impl true
  def publish(publisher, routing_key, message) do
    message
    |> Trento.Contracts.to_event(source: "github.com/trento-project/web")
    |> publisher.publish_message(routing_key)
  end
end
