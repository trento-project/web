defmodule Trento.Databases.Events.DatabaseInstanceSystemReplicationChanged do
  @moduledoc """
  This event is emitted when a database instance system replication has changed.
  """

  import Trento.Databases.Events.Upcaster.Upcast, only: [upcast_legacy_aggregate: 1]

  use Trento.Support.Event

  defevent version: 2 do
    field :database_id, Ecto.UUID
    field :host_id, Ecto.UUID
    field :instance_number, :string
    field :system_replication, :string
    field :system_replication_status, :string
  end

  def upcast(params, _, 2), do: upcast_legacy_aggregate(params)
end
