defmodule Trento.Databases.Events.DatabaseInstanceMarkedPresent do
  @moduledoc """
  This event is emitted when a database instance is marked as present.
  """

  use Trento.Support.Event
  use Trento.Databases.Event.Upcaster.UpcastDatabaseId

  defevent version: 2 do
    field :instance_number, :string
    field :host_id, Ecto.UUID
    field :database_id, Ecto.UUID
  end
end
