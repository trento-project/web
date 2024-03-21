defmodule Trento.Databases.Events.DatabaseInstanceDeregistered do
  @moduledoc """
  This event is emitted when a database instance is deregistered (decommissioned).
  """

  use Trento.Support.Event

  defevent do
    field :instance_number, :string
    field :host_id, Ecto.UUID
    field :database_id, Ecto.UUID
    field :deregistered_at, :utc_datetime_usec
  end
end
