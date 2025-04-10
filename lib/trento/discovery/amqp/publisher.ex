defmodule Trento.Discovery.AMQP.Publisher do
  @moduledoc """
  AMQP discovery publisher
  """

  use Trento.Infrastructure.Messaging.Adapter.AMQP.Publisher, id: __MODULE__, name: :discoveries
end
