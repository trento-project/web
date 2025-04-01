defmodule Trento.Infrastructure.Catalog.AMQP.Consumer do
  @moduledoc """
  AMQP catalog consumer.
  """

  use Trento.Infrastructure.Messaging.Adapter.AMQP.Consumer, id: __MODULE__, name: :catalog
end
