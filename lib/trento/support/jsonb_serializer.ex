defmodule Trento.Support.JsonbSerializer do
  @moduledoc """
  Serialize to/from PostgreSQL's native `jsonb` format.
  Requires events to be defined by the `defevent` macro.

  Configuration example:
  ```
  config :trento, Trento.EventStore,
    serializer: Trento.Support.JsonbSerializer,
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
  If a process manager supports superseding because it was renamed (i.e. it has a `supersede/0` function),
  the snapshotted process manager is superseded by the new module.
  """
  def deserialize(term, config) do
    case Keyword.get(config, :type) do
      nil ->
        term

      type ->
        module = String.to_existing_atom(type)
        Code.ensure_loaded?(module)

        cond do
          Kernel.function_exported?(module, :upcast, 2) ->
            %IntermediateEvent{module: module, term: term}

          Kernel.function_exported?(module, :supersede, 0) ->
            module.supersede().new!(term)

          true ->
            module.new!(term)
        end
    end
  end
end
