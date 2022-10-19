defmodule Trento.Messaging.Adapters.AMQP do
  @moduledoc """
  AMQP adapter
  """

  @behaviour Trento.Messaging.Adapters.Behaviour

  alias Trento.Messaging.Adapters.AMQP.Publisher

  require Logger

  # FIXME: fix Trento.Contracts.to_event/2
  @dialyzer {:nowarn_function, publish: 2}

  @impl true
  def publish(routing_key, message) do
    message
    |> Trento.Contracts.to_event(source: "github.com/trento-project/web")
    |> Publisher.publish_message(routing_key)
  end
end
