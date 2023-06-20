defmodule Trento.Domain.Events.ApplicationInstanceMoved do
  @moduledoc """
  This event is emitted when a database application is moved from a host to another.
  """

  use Trento.Event

  defevent do
    field :sap_system_id, Ecto.UUID
    field :instance_number, :string
    field :old_host_id, Ecto.UUID
    field :new_host_id, Ecto.UUID
  end
end
