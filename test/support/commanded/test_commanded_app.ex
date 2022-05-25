defmodule TestCommandedApp do
  @moduledoc """
  InMemory commanded app used in tests.
  """

  alias Commanded.EventStore.Adapters.InMemory
  alias Commanded.Serialization.JsonSerializer

  use Commanded.Application,
    otp_app: :commanded,
    event_store: [
      adapter: InMemory,
      serializer: JsonSerializer
    ],
    pubsub: :local,
    registry: :local
end
