defmodule Trento.Domain.Events.HostDeregistered do
  @moduledoc """
    This event is emitted when a deregistration (decommission) of a host is completed.
  """

  use Trento.Event

  defevent do
    field :host_id, Ecto.UUID
    field :deregistered_at, :utc_datetime_usec
  end
end
