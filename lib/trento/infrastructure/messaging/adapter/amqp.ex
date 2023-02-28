defmodule Trento.Infrastructure.Messaging.Adapter.AMQP do
  @moduledoc """
  AMQP adapter
  """

  @behaviour Trento.Infrastructure.Messaging.Adapter.Gen

  alias Trento.Infrastructure.Messaging.Adapter.AMQP.Publisher

  require Logger

  @impl true
  def publish(routing_key, message) do
    message
    |> Trento.Contracts.to_event(source: "github.com/trento-project/web")
    |> Publisher.publish_message(routing_key)
  end
end
