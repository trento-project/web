defmodule Trento.Infrastructure.Operations.AMQP.Publisher do
  @moduledoc """
  AMQP operations publisher
  """

  use Trento.Infrastructure.Messaging.Adapter.AMQP.Publisher, id: __MODULE__, name: :operations
end
