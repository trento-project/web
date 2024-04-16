defmodule Trento.Databases.Events.DatabaseInstanceDeregistered do
  @moduledoc """
  This event is emitted when a database instance is deregistered (decommissioned).
  """

  use Trento.Support.Event
  use Trento.Databases.Event.Upcaster.UpcastDatabaseId

  defevent version: 2 do
    field :instance_number, :string
    field :host_id, Ecto.UUID
    field :database_id, Ecto.UUID
    field :deregistered_at, :utc_datetime_usec
  end
end
