defmodule Trento.Hosts.Events.HostDeregistered do
  @moduledoc """
    This event is emitted when a deregistration (decommission) of a host is completed.
  """

  use Trento.Support.Event

  defevent do
    field :host_id, Ecto.UUID
    field :deregistered_at, :utc_datetime_usec
  end
end
