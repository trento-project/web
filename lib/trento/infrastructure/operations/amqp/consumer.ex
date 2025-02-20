defmodule Trento.Infrastructure.Operations.AMQP.Consumer do
  @moduledoc """
  AMQP operations consumer.
  """

  use Trento.Infrastructure.Messaging.Adapter.AMQP.Consumer, id: __MODULE__, name: :operations
end
