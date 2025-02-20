defmodule Trento.Infrastructure.Checks.AMQP.Publisher do
  @moduledoc """
  AMQP checks publisher
  """

  use Trento.Infrastructure.Messaging.Adapter.AMQP.Publisher, id: __MODULE__, name: :checks
end
