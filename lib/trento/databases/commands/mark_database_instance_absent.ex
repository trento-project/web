defmodule Trento.Databases.Commands.MarkDatabaseInstanceAbsent do
  @moduledoc """
  Mark a database instance as absent
  """
  @required_fields :all

  use Trento.Support.Command

  defcommand do
    field :instance_number, :string
    field :host_id, Ecto.UUID
    field :database_id, Ecto.UUID
    field :absent_at, :utc_datetime_usec
  end
end
