defmodule Trento.Hosts.Events.HostHealthChanged do
  @moduledoc """
  This event is emitted when the health of a host changes because of
  - an heartbeat failure/recovery
  - a check's execution result
  """

  use Trento.Support.Event

  require Trento.Domain.Enums.Health, as: Health

  defevent do
    field :host_id, Ecto.UUID
    field :health, Ecto.Enum, values: Health.values()
  end
end
