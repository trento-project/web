defmodule Trento.Domain.Events.HostSaptuneHealthChanged do
  @moduledoc """
  This event is emitted when a host's saptune health changes.
  """

  use Trento.Support.Event

  require Trento.Enums.Health, as: Health

  defevent superseded_by: Trento.Hosts.Events.HostSaptuneHealthChanged do
    field :host_id, Ecto.UUID
    field :saptune_health, Ecto.Enum, values: Health.values()
  end
end
