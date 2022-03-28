defmodule Trento.Domain.Events.DatabaseInstanceHealthChanged do
  @moduledoc """
  This event is emitted when a database instance health has changed.
  """

  use Trento.Event

  defevent do
    field :sap_system_id, Ecto.UUID
    field :host_id, Ecto.UUID
    field :instance_number, :string
    field :health, Ecto.Enum, values: [:passing, :warning, :critical, :unknown]
  end
end
