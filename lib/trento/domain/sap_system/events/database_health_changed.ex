defmodule Trento.Domain.Events.DatabaseHealthChanged do
  @moduledoc """
  This event is emitted when a database health has changed.
  """

  use Trento.Event

  defevent do
    field :sap_system_id, Ecto.UUID
    field :health, Ecto.Enum, values: [:passing, :warning, :critical, :unknown]
  end
end
