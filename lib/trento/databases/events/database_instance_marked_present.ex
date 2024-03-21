defmodule Trento.Databases.Events.DatabaseInstanceMarkedPresent do
  @moduledoc """
  This event is emitted when a database instance is marked as present.
  """

  use Trento.Support.Event

  defevent do
    field :instance_number, :string
    field :host_id, Ecto.UUID
    field :database_id, Ecto.UUID
  end
end
