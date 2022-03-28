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

  def serialize(term), do: term

  def deserialize(term, config) do
    case Keyword.get(config, :type) do
      nil ->
        term

      type ->
        module = String.to_existing_atom(type)
        module.new!(term)
    end
  end
end
