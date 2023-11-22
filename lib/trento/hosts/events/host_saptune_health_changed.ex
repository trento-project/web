defmodule Trento.Hosts.Events.HostSaptuneHealthChanged do
  @moduledoc """
  This event is emitted when a host's saptune health changes.
  """

  use Trento.Support.Event

  require Trento.Domain.Enums.Health, as: Health

  defevent do
    field :host_id, Ecto.UUID
    field :saptune_health, Ecto.Enum, values: Health.values()
  end
end
