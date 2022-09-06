defmodule Trento.JsonbSerializer do
  @moduledoc """
  Serialize to/from PostgreSQL's native `jsonb` format.
  Requires events to be defined by the `defevent` macro.

  Configuration example:
  ```
  config :trento, Trento.EventStore,
    serializer: Trento.JsonbSerializer,
    column_data_type: "jsonb",
    types: EventStore.PostgresTypes
  ```
  """

  @behaviour EventStore.Serializer

  alias Trento.Support.IntermediateEvent

  def serialize(term), do: term

  @doc """
  Deserialize a `jsonb` value from the event store into a struct.
  This function is called by the event store when reading events and snapshots from the database.
  In case the type supports upcasting (i.e. it has a `upcast/2` function),
  the event is wrapped in an `IntermediateEvent` struct.
  The upcaster protocol is implemented for `IntermediateEvent` and it will take care of calling the `new!/1` function
  after the upcasting is done.
  """
  def deserialize(term, config) do
    case Keyword.get(config, :type) do
      nil ->
        term

      type ->
        module = String.to_existing_atom(type)

        if Kernel.function_exported?(module, :upcast, 2) do
          %IntermediateEvent{module: module, term: term}
        else
          module.new!(term)
        end
    end
  end
end
