defmodule Trento.Databases.Events.DatabaseInstanceMarkedAbsent do
  @moduledoc """
  This event is emitted when a database instance is marked as absent.
  """

  use Trento.Support.Event

  defevent do
    field :instance_number, :string
    field :host_id, Ecto.UUID
    field :database_id, Ecto.UUID
    field :absent_at, :utc_datetime_usec
  end
end
