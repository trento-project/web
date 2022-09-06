defmodule Trento.Support.IntermediateEvent do
  @moduledoc """
  Represents an event that has been deserialized from the database, but not yet casted to its final type.

  This is used to support upcasting of events.
  The final event is built in the upcast protocol, so we can have access to the metadata.
  """

  defstruct [:module, :term]

  @type t :: %__MODULE__{
          module: module(),
          term: any()
        }

  require Logger

  defimpl Commanded.Event.Upcaster do
    alias Trento.Support.IntermediateEvent

    def upcast(%IntermediateEvent{module: module, term: term}, metadata) do
      event =
        term
        |> module.upcast(metadata)
        |> module.new!()

      Logger.debug("Cast IntermediateEvent #{module}: #{inspect(term)} to: #{inspect(event)}")

      event
    end
  end
end
