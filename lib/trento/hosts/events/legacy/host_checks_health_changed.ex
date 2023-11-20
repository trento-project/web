defmodule Trento.Domain.Events.HostChecksHealthChanged do
  @moduledoc """
  This event is emitted when a host's checks result changes.
  """

  use Trento.Event

  require Trento.Domain.Enums.Health, as: Health

  defevent superseeded_by: Trento.Hosts.Events.HostChecksHealthChanged do
    field :host_id, Ecto.UUID
    field :checks_health, Ecto.Enum, values: Health.values()
  end
end
