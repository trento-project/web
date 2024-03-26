defmodule Trento.Databases.Events.DatabaseRollUpRequested do
  @moduledoc """
  This event is emitted when an database roll-up is requested.
  It is used to trigger the stream archiving process and it contains the snapshot of the database aggregate.
  """

  use Trento.Support.Event

  defevent resource: "database" do
    field :database_id, Ecto.UUID
    embeds_one :snapshot, Trento.Databases.Database
  end
end
