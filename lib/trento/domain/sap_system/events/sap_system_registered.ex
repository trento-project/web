defmodule Trento.Domain.Events.SapSystemRegistered do
  @moduledoc """
  This event is emitted when a sap system is registered.
  """

  use Trento.Event

  require Trento.Domain.Enum.Health, as: Health

  defevent do
    field :sap_system_id, Ecto.UUID
    field :sid, :string
    field :tenant, :string
    field :db_host, :string
    field :health, Ecto.Enum, values: Health.values()
  end
end
